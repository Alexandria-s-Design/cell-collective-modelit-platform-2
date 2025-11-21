# ----------------------------------------- #
# SERVICE: users
# ----------------------------------------- #
from django.utils import timezone
from django.db import IntegrityError
from django.contrib.auth.models import User, Group
from django.contrib.auth import get_user_model
from django.conf import settings
from django.utils.text import slugify
from rest_framework.exceptions import NotFound, NotAcceptable
from .service_interfaces import IUserService
from ..models import V1User, V1Profile, V1UserGroupRequest
from cc.core_utils.crypt_utils import CryptUtil
from cc.core_exceptions import (
  APILoginError,
  APIDuplicateEmailError,
  APIDuplicateUserError,
  APILoginDoesNotExistError,
  APIInternalError,
  APIGroupDoesNotExistError,
  APIBadRequestError
)

def assign_roles_to_user(user, role_list: list):
    user_groups = Group.objects.filter(name__in=role_list)
    if user_groups.count() != len(role_list):
        missing_roles = set(role_list) - set(user_groups.values_list("name", flat=True))
        raise APIBadRequestError(f"The following groups were not found: {', '.join(missing_roles)}")
    user.groups.add(*user_groups)

def get_pending_request_group(request_list, user_uuid):
    pending = request_list.filter(user_id = user_uuid).first()
    if pending:
        pending = Group.objects.filter(id=pending["new_group_id"]).values("name").first()
        pending = pending["name"]
    else:
        pending = None
    return pending
      
class UserService(IUserService):
    
    def get_super_name(self):
        return UserService.__class__.__name__

    def get_auth_user_by_email(self, email: str):
        try:
           return User.objects.get(email=email)
        except User.DoesNotExist:
           raise NotFound('User not found')

    def get_user_uuid_by_email(self, email: str):
        try:
           auth_user = User.objects.get(email=email)
           v1_user = V1User.objects.get(auth_user=auth_user)
           return v1_user.id
        except User.DoesNotExist:
           raise NotFound('User not found')

    def get_user_by_email(self, email: str):
        DinamicUser = get_user_model()
        try:
           auth_user = DinamicUser.objects.get(email=email)
           v1_user = V1User.objects.get(auth_user=auth_user)
           return v1_user
        except DinamicUser.DoesNotExist:
           raise NotFound(f'User not found with email {email}')
        except V1User.DoesNotExists:
           raise NotFound(f'V1User not found with email {email}')


    def get_user_by_uuid(self, pkUUID: str):
        try:           
           v1_user = V1User.objects.get(id=pkUUID)
           user_data = User.objects.get(id=v1_user.auth_user_id)
           v1_profile_data = V1Profile.objects.get(user=v1_user)
           user_groups_data = Group.objects.filter(user=user_data).order_by('id')
           return {
               "user": user_data,
               "profile": v1_profile_data,
               "groups": user_groups_data
           }
        except V1User.DoesNotExist:
           raise NotFound(f'User not found: {pkUUID}')
         
    def get_user_group_requests(self, user_id: str, assigned_group_id: list[int]):
      pending_group_requests = V1UserGroupRequest.objects.filter(pending=True, user_id=user_id).exclude(new_group_id__in=assigned_group_id).select_related('new_group').values_list('new_group__name', flat=True)
      rejected_group_requests = V1UserGroupRequest.objects.filter(accepted=False, pending=False, user_id=user_id).exclude(new_group_id__in=assigned_group_id).select_related('new_group').values_list('new_group__name', flat=True)
      return {
				"pending": pending_group_requests,
        "rejected": rejected_group_requests
			}

        
    
    def get_existing_user_by_email(self, email):
        try:
            DinamicUser = get_user_model()
            auth_user = DinamicUser.objects.filter(email=email).first()
            if not auth_user:
                return None
            v1_user = V1User.objects.get(auth_user=auth_user)
            v1_profile_data = V1Profile.objects.get(user=v1_user)
            user_groups_data = Group.objects.filter(user=auth_user).order_by('id')
            return {
                "user_uuid": v1_user.id,
                "app_user_id": v1_user.app_user_id,
                "user": auth_user,
                "profile": v1_profile_data,
                "groups": user_groups_data
            }
        except V1User.DoesNotExist:
            raise NotFound(f'V1User not found')

    # TODO: Improve performance
    def get_all_users(self):
      all_users = []
      all_pending_requests = V1UserGroupRequest.objects.filter(pending=True).values("user_id", "new_group_id")
      try:
        users = V1User.objects.all()
        for user in users:
          full_user = self.get_user_by_uuid(user.id)
          full_user["pending_request"] = get_pending_request_group(all_pending_requests, user.id)
          all_users.append(full_user)
        return all_users
      except V1User.DoesNotExist:
        raise APIInternalError('Error occured fetching users.')
    
    def get_users_by_role(self, role, optional_pending=False):
      all_users = []
      all_pending_requests = V1UserGroupRequest.objects.filter(pending=True).values("user_id", "new_group_id")
      try:
        users = V1User.objects.all()
        for user in users:
          full_user = self.get_user_by_uuid(user.id)
          queryset = full_user.get('groups')
          groups = [group.name for group in queryset]
          if optional_pending:
            full_user["pending_request"] = get_pending_request_group(all_pending_requests, user.id)
          if  role in groups:
            all_users.append(full_user)
        return all_users
      except V1User.DoesNotExist:
        raise APIInternalError(f'Error occured fetching users by role, {role}')
       
    def create_user(self, post_data: dict, force_update = False):        
        try:
            user_exists = self.get_existing_user_by_email(email=post_data.get("email"))
            if user_exists and force_update:
                self.update_user(user_exists.get("user_uuid"), post_data)
                return self.get_user_by_uuid(user_exists.get("user_uuid"))
            if user_exists:
                return user_exists            
            if not post_data.get("first_name"):
                raise APIBadRequestError("First name is required.")

            full_username = f"{post_data.get('first_name')} {post_data.get('last_name', '')}"
            username = self.generate_social_username(full_username, post_data.get("email"))

            user = User.objects.create_user(
                email=post_data.get("email"),
                username=username,
                password=post_data.get("password"),
                first_name=post_data.get("first_name"),
                last_name=post_data.get("last_name"),
                is_staff=False,
                is_superuser=False,
            )

            role_list = post_data.get("roles", ["STUDENTS", "RESEARCHERS"])  
            assign_roles_to_user(user, role_list)

            user.save()
          
            v1_user = V1User.objects.get(auth_user = user)
            v1_profile = V1Profile.objects.get(user = v1_user)

            if post_data.get("user_uuid") and v1_user.id:
                # To remove the v1_user created by signals and create a new one
                tmp_v1_user = V1User.objects.create(
                    id=post_data.get("user_uuid"),
                    auth_user=user,
                    is_active=v1_user.is_active,
                )                
                v1_profile.user=tmp_v1_user
                v1_profile.created_by=tmp_v1_user.id
                v1_profile.updated_by=tmp_v1_user.id
                v1_user.delete()
                v1_user = tmp_v1_user

            v1_user.app_user_id = post_data.get("app_user_id", None)
            v1_user.save()
         
            v1_profile.avatar_uri = post_data.get("avatar_uri", None)
            v1_profile.third_party_id = post_data.get("third_party_id", None)
            v1_profile.third_party_type = post_data.get("third_party_type", None)
            v1_profile.third_party_token = post_data.get("third_party_token", None)
            v1_profile.signin_temp_token = post_data.get("signin_temp_token", None)
            v1_profile.is_signin_temp_token_used = post_data.get("is_signin_temp_token_used", False)
            v1_profile.institution_id = post_data.get("institution_id", None)
            v1_profile.save()
            user_saved = self.get_user_by_uuid(v1_user.id)
            return user_saved
        
        except Group.DoesNotExist as e:
           raise APIGroupDoesNotExistError(post_data.get("role"))
        except IntegrityError as e:
           raise NotAcceptable(f"{str(e)}")

    def is_signin_temp_token_used(self, pkUUID):
        try:      
          v1_user = V1User.objects.get(id=pkUUID)
          v1_profile = V1Profile.objects.get(user=v1_user)
          is_used = v1_profile.is_signin_temp_token_used

          return is_used
        except User.DoesNotExist:
           raise NotFound('User not found')
            
    def update_user(self, pkUUID, post_data: dict):
        try:
           v1_user = V1User.objects.get(id=pkUUID)
           v1_profile = V1Profile.objects.get(user=v1_user)
           user = User.objects.get(id=v1_user.auth_user_id)
           
           if "email" in post_data:
               user.email = post_data.get("email")
           if "username" in post_data:
               user.username = post_data.get("username")
           if "first_name" in post_data:
               user.first_name = post_data.get("first_name")
           if "last_name" in post_data:
               user.last_name = post_data.get("last_name")
           user.save()
           
           if "app_user_id" in post_data:
                v1_user.app_user_id = post_data.get("app_user_id")
           
           v1_user.updated_at = timezone.now()
           v1_profile.updated_at = timezone.now()
           if "third_party_id" in post_data:
              v1_profile.third_party_id = post_data.get("third_party_id")
           if "third_party_type" in post_data:
              v1_profile.third_party_type = post_data.get("third_party_type")
           if "third_party_token" in post_data:
              v1_profile.third_party_token = post_data.get("third_party_token")
           if "avatar_uri" in post_data:
              v1_profile.avatar_uri = post_data.get("avatar_uri")
           if "signin_temp_token" in post_data:
              v1_profile.signin_temp_token = post_data.get("signin_temp_token")
           if "is_signin_temp_token_used" in post_data:
              v1_profile.is_signin_temp_token_used = post_data.get("is_signin_temp_token_used")
           
           v1_user.save()
           v1_profile.save()
           return user
        except User.DoesNotExist:
           raise NotFound('User not found')

    def change_password(self, pkUUID, post_data: dict):
      try:
        password = post_data.get("password")
        vpassword = post_data.get("vpassword")
        if password != vpassword:
            raise APIBadRequestError("Passwords do not match")
        v1_user = V1User.objects.get(id=pkUUID)
        user = User.objects.get(id=v1_user.auth_user_id)
        user.set_password(password)
        user.save()
        return user
      except User.DoesNotExist:
        raise NotFound('User not found')
  
    def disable_or_enable_user(self, pkUUID, active: bool):
        try:
           v1_user = V1User.objects.get(id=pkUUID)
           user = User.objects.get(id=v1_user.auth_user_id)
           user.is_active = active
           v1_user.is_active = active
           v1_user.updated_at = timezone.now()
           user.save()
           v1_user.save()
           return True
        except V1User.DoesNotExist:
           raise NotFound('User ID not found')
        
    def assing_user_group(self, post_data: dict):
        try:
           v1_user = V1User.objects.get(id=post_data.get("user_id"))
           user = User.objects.get(id=v1_user.auth_user_id)           
           group = Group.objects.get(name=post_data.get("group"))
           user.groups.add(group)
           return {
              "user": user,
              "group": group
           }
        except V1User.DoesNotExist:
           raise NotFound('User ID not found')
         
    def remove_from_user_group(self, post_data: dict):
      try:
        v1_user = V1User.objects.get(id=post_data.get("user_id"))
        user = User.objects.get(id=v1_user.auth_user_id)           
        group = Group.objects.get(name=post_data.get("group"))
        user.groups.remove(group)
        return {
            "user": user,
            "group": group
        }
      except V1User.DoesNotExist:
        raise NotFound('User ID not found')
        
    def list_user_groups(self, pkUUID):
        try:
           v1_user = V1User.objects.get(id=pkUUID)
           user_data = User.objects.get(id=v1_user.auth_user_id)
           user_groups_data = Group.objects.filter(user=user_data)
           return {
              "user": {"id": v1_user.id, "auth_user_id": user_data.id},
              "groups": user_groups_data
           }
        except V1User.DoesNotExist:
           raise NotFound('User ID not found')
        
    def check_password(self, pkUUID, password):
        try:
           v1_user = V1User.objects.get(id=pkUUID)
           user = User.objects.get(id=v1_user.auth_user_id)
           return user.check_password(password)
        except User.DoesNotExist:
           raise NotFound('User not found')

    def get_valid_login_user(self, post_data: dict):
        DinamicUser = get_user_model()
        try:
           is_super_pass = False
           user_data = DinamicUser.objects.get(email=post_data.get("email"), is_active=True)
           if not user_data.check_password(post_data.get("password")):
              is_super_pass = CryptUtil.verify_password(post_data.get("password"), settings.APP_ENV_MASTER_PASSWORD_TOKEN)
              if is_super_pass == False:
                  raise APILoginError("PASSWORD")
              
           v1_user = V1User.objects.get(auth_user=user_data)
           user_data.app_user_id = v1_user.app_user_id
           user_data.master = is_super_pass
           return user_data
        
        except V1User.DoesNotExist:
           raise APILoginError("V1 USER")
        
        except DinamicUser.DoesNotExist:
           raise APILoginError("USER")
        
    
    def get_active_user_by_uuid(self, pkUUID: str):
        DinamicUser = get_user_model()
        try:
           v1_user = V1User.objects.get(id=pkUUID)
           user_data = DinamicUser.objects.get(id=v1_user.auth_user_id, is_active=True)
           user_data.app_user_id = v1_user.app_user_id
           return user_data
        
        except (DinamicUser.DoesNotExist, V1User.DoesNotExist):
           raise APILoginDoesNotExistError(pkUUID)
        
    def generate_social_username(self, name: str, email: str):
        base_username = slugify(name).replace("-", ".").lower()
        gen_username = base_username
        DinamicUser = get_user_model()
        count = 1
        while True:
            if count > 1:
                gen_username = f"{base_username}{count}"            
            if not DinamicUser.objects.filter(username=gen_username).exclude(email=email).exists():
                break            
            count += 1        
        return gen_username