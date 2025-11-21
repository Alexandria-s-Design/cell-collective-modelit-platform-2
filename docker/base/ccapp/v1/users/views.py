# ----------------------------------------- #
# SERVICE: users
# ----------------------------------------- #
# from django.http import JsonResponse
# import json
from django.conf import settings
from ..service_manager import ServiceManager
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from cc.core_http_response import CoreHttpResponse
from .serializers import (
    UserSerializer,
    V1ProfileSerializer,
    GroupSerializer,
    V1UserGroupRequestSerializer
)
# from rest_framework.permissions import IsAuthenticated
from cc.core_exceptions import APIInternalError, APIBadRequestError
from channels.generic.websocket import AsyncWebsocketConsumer
import json

service_manager = ServiceManager()
users_service = service_manager.get_service("users", "get_user_service")
users_groups_service = service_manager.get_service("users", "get_user_group_service")
user_notifications_service = service_manager.get_service("users","get_user_notifications_service")

class HasRolePermission(permissions.BasePermission):
  """
    Custom permission to check if the user has the required role(s).
    The required roles should be specified in the view using `required_roles` attribute.
  """
  def has_permission(self, request, view):
    # Ensure that `allowed_roles` is defined in view
    allowed_roles = getattr(view, 'allowed_roles', None)
    if not allowed_roles:
      return True # No role restriction defined, allow access
    
    # Ensure the user is authenticated
    if not request.user or not request.user.is_authenticated:
      return False
    
    user_id = request.curr_user.get("user_id")
    user_data = users_service.get_user_by_uuid(user_id)
    group_serializer = GroupSerializer(user_data["groups"], many=True)
    roles = [item['name'] for item in group_serializer.data]
    # Check if user has any of the required roles
    for role in allowed_roles:
      if role in roles:
        return True
    
    return False # Deny access if the no role has been found in allowed list
    
  
class CustomPagination(PageNumberPagination):
  page_size = 50  # Default number of items per page
  page_size_query_param = 'page_size'  # Allow the client to set the page size
  max_page_size = 100  # Maximum number of items per page

class RegisterView(APIView):

    def post(self, request, *args, **kwargs):        
        if request.data.get("vpassword"):
            if request.data.get("password") != request.data.get("vpassword"):
              raise APIBadRequestError("Passwords do not match")
        force_update = request.data.get("update_secret_key") == settings.WEB_API_SECRET_KEY
        user_data = users_service.create_user(request.data, force_update)
        user_serializer = UserSerializer(user_data["user"], many=False)
        profile_serializer = V1ProfileSerializer(user_data["profile"], many=False)
        return CoreHttpResponse({
            "user": user_serializer.data,
            "profile": profile_serializer.data
        }, status=status.HTTP_201_CREATED).json()

class ChangePasswordView(APIView):
  permission_classes = [IsAuthenticated]
  def post(self, request, *args, **kwargs):
    user_id = request.curr_user.get("user_id")
    if not users_service.check_password(user_id, request.data.get("cpassword")):
      raise APIBadRequestError("The password is incorrect")            
    user_data = users_service.change_password(user_id, request.data)
    if not user_data:
      raise APIInternalError("The password could not be changed")
    return CoreHttpResponse({
      "message": "Password successfully changed."
    }, status=status.HTTP_200_OK).json()
    
class ResetPasswordView(APIView):
  permission_classes = [IsAuthenticated]
  def post(self, request, *args, **kwargs):

    if request.data.get("secret") != settings.WEB_API_SECRET_KEY:
       raise APIBadRequestError("Passwords do not match")

    user_uuid = users_service.get_user_uuid_by_email(email=request.data.get("email"))       
    user_data = users_service.change_password(str(user_uuid), {
       "password": request.data.get("password"),
       "vpassword": request.data.get("vpassword")
    })
    if not user_data:
      raise APIInternalError("The password could not be reset")
    return CoreHttpResponse({
      "message": "Password successfully reseted."
    }, status=status.HTTP_200_OK).json()

class GetNotificationsView(APIView):
  def get(self, request, *args, **kwargs):
    notifications = user_notifications_service.get_user_notifications(request)
    if not notifications:
      raise APIInternalError("Error occured fetching notifications.")
    else:
      return CoreHttpResponse(notifications, status=status.HTTP_200_OK).json()

  def post(self, request, *args, **kwargs):
    if request.data.get("notification"):
      notification_id = request.data.get("notification")
      res = user_notifications_service.read_user_notification(request, notification_id)
      if res == "OK":
        return CoreHttpResponse({"message": res}, status=status.HTTP_200_OK).json()
      else:
        return CoreHttpResponse({"message": res}, status=status.HTTP_200_OK).json()
    
class NotificationConsumerView(AsyncWebsocketConsumer):
  async def connect(self):
    if hasattr(self.scope["user"], "user_id"):
      self.group_name = f"admin_notifications_{self.scope['user'].user_id}"
      await self.channel_layer.group_add(self.group_name, self.channel_name)
      await self.accept()
    else:
      await self.close()
		
  async def disconnect(self, code):
    if hasattr(self, 'group_name'):
      await self.channel_layer.group_discard(self.group_name, self.channel_name)
    else: 
      print("Disconnect called without group_name being set.")
	
  async def send_notification(self, event):
    await self.send(text_data=json.dumps({"message": event["message"]}))

class GetUsersView(APIView):
  permission_classes = [IsAuthenticated]
  def get(self, request, *args, **kwargs):
    all_users = []
    try:
      user_id = request.curr_user.get("user_id")
      user_data = users_service.get_user_by_uuid(user_id)
      group_serializer = GroupSerializer(user_data["groups"], many=True)
      roles = [item['name'] for item in group_serializer.data]
      
      if 'ADMINS' in roles: 
        users = users_service.get_all_users()
      elif 'TEACHERACCESSAPPROVERS' in roles:
        users = users_service.get_users_by_role('STUDENTS', True)
        users += users_service.get_users_by_role('TEACHERS', True)
        unique_users = {user["profile"]: user for user in users}.values() # remove users in both groups 
        users = list(unique_users)
      else:
        users = []
      
      search_term = request.GET.get("search", "").lower()
      ordering = request.GET.get("ordering", "")

      if search_term:
        users = [
            user for user in users
            if search_term in user["user"].username.lower()
            or search_term in user["user"].email.lower()
        ]

      paginator = PageNumberPagination()
      paginator.page_size = 45
      for user in users:
        user_serializer = UserSerializer(user["user"], many=False)
        profile_serializer = V1ProfileSerializer(user["profile"], many=False)
        group_serializer = GroupSerializer(user["groups"], many=True)
        all_users.append({
          "user": user_serializer.data,
          "profile": profile_serializer.data,
          "groups": group_serializer.data,
          "pending_request": {"name": user["pending_request"]}
        })

      if ordering:
        reverse = ordering.startswith("-")
        key = ordering.lstrip("-")

        def get_nested_value(obj, path):
          keys = path.split("__")
          for k in keys:
              if isinstance(obj, list) and k.isdigit():
                  idx = int(k)
                  if idx < len(obj):
                      obj = obj[idx]
                  else:
                      return ''
              else:
                  obj = obj.get(k)
              if obj is None:
                  return ''
          return obj
        
        all_users.sort(
            key=lambda u: str(get_nested_value(u, key) or ""), 
            reverse=reverse
        )

      paginated_users = paginator.paginate_queryset(all_users, request)
      paginated_response = paginator.get_paginated_response(paginated_users)
      response_data = paginated_response.data
    
      return CoreHttpResponse(response_data, status=status.HTTP_200_OK).json()
      # return users_dict
    except Exception as e:
      raise APIInternalError(str(e)) 
class ProfileMeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            user_id = request.curr_user.get("user_id")            
            user_data = users_service.get_user_by_uuid(user_id)
            user_serializer = UserSerializer(user_data["user"], many=False)
            profile_serializer = V1ProfileSerializer(user_data["profile"], many=False)
            group_serializer = GroupSerializer(user_data["groups"], many=True)
            group_ids = [ g["id"] for g in group_serializer.data]
            group_request = users_service.get_user_group_requests(user_id, group_ids)
            return CoreHttpResponse({
                "user": user_serializer.data,
                "profile": profile_serializer.data,
                "groups": group_serializer.data,
                **group_request
            }, status=status.HTTP_200_OK).json()
        except Exception as e:
            raise APIInternalError(str(e))
    
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pkUUID, *args, **kwargs):
        user_data = users_service.update_user(pkUUID, request.data)
        user_serializer = UserSerializer(user_data, many=False)
        return CoreHttpResponse({
            "user": user_serializer.data
        }, status=status.HTTP_200_OK).json()

class UserDisableView(APIView):
    allowed_roles = ['ADMINS']
    permission_classes = [IsAuthenticated, HasRolePermission]
    def get(self, request, pkUUID, *args, **kwargs):
        user_id = request.curr_user.get("user_id")
                
        if user_id == pkUUID:
            raise APIBadRequestError('This account cannot be disabled')
        
        users_service.disable_or_enable_user(pkUUID, False)
        return CoreHttpResponse({
            "user": {"id": pkUUID}
        }, status=status.HTTP_204_NO_CONTENT).json()

class UserEnableView(APIView):
    allowed_roles = ['ADMINS']
    permission_classes = [IsAuthenticated, HasRolePermission]
    def get(self, request, pkUUID, *args, **kwargs):
        user_id = request.curr_user.get("user_id")
                
        if user_id == pkUUID:
            raise APIBadRequestError('This account cannot be enabled')
        return CoreHttpResponse({
            "user": {"id": pkUUID}
        }, status=status.HTTP_200_OK).json()

class AssignGroupView(APIView):
    allowed_roles = ['ADMINS']
    permission_classes = [IsAuthenticated, HasRolePermission]
    def post(self, request, *args, **kwargs):
        user_id = request.curr_user.get("user_id")
        user_data = users_service.get_user_by_uuid(user_id)
        user_group_serializer = GroupSerializer(user_data["groups"], many=True)
        roles = [item['name'] for item in user_group_serializer.data]
        
        if not any(role in roles for role in ['ADMINS', 'TEACHERACCESSAPPROVERS']):
            raise APIBadRequestError('The logged-in user cannot assign groups.')
        
        users_groups_service.update_request_user_group(
            user_uuid=request.data.get("user_id"),
            group=request.data.get("group"),
            accepted = True
        )

        assign_data = users_service.assing_user_group(request.data)
        user_serializer = UserSerializer(assign_data["user"], many=False)
        group_serializer = GroupSerializer(assign_data["group"], many=False)
        return CoreHttpResponse({
            "user": user_serializer.data,
            "group": group_serializer.data
        }, status=status.HTTP_200_OK).json()

class RemoveGroupView(APIView):
  allowed_roles = ['ADMINS']
  permission_classes = [IsAuthenticated, HasRolePermission]
  def post(self, request, *args, **kwargs):
    user_id = request.curr_user.get("user_id")
    user_data = users_service.get_user_by_uuid(user_id)
    user_group_serializer = GroupSerializer(user_data["groups"], many=True)
    roles = [item['name'] for item in user_group_serializer.data]
        
    if not any(role in roles for role in ['ADMINS', 'TEACHERACCESSAPPROVERS']):
      raise APIBadRequestError('The logged-in user cannot assign groups.')
          
    remove_data = users_service.remove_from_user_group(request.data)
    user_serializer = UserSerializer(remove_data["user"], many=False)
    group_serializer = GroupSerializer(remove_data["group"], many=False)
    
    return CoreHttpResponse({
            "user": user_serializer.data,
            "group": group_serializer.data
        }, status=status.HTTP_200_OK).json()
    
      
class UserGroupsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, pkUserUUID, *args, **kwargs):
        groups_data = users_service.list_user_groups(pkUserUUID)
        group_serializer = GroupSerializer(groups_data["groups"], many=True)
        return CoreHttpResponse({
            "user": groups_data["user"],
            "groups": group_serializer.data
        }, status=status.HTTP_200_OK).json()


class UserGroupsRequestView(APIView):
    permission_classes = [IsAuthenticated]
    # probably should be limited to TEACHERS, STUDENT, LABMEMBERS
    def post(self, request, *args, **kwargs):
        user_uuid = request.curr_user.get("user_id")
        user_data = users_service.get_user_by_uuid(user_uuid)
        user_groups = GroupSerializer(user_data["groups"], many=True)

        if not request.data.get('new_group'):
          raise APIBadRequestError("The parameter new_group is required")

        create_new_request = users_groups_service.create_request_user_group(
           user_uuid,
           user_groups.data,
           new_group = request.data.get("new_group")
        )
        request_serializer = V1UserGroupRequestSerializer(create_new_request)

        return CoreHttpResponse(
           request_serializer.data,
           status=status.HTTP_200_OK
        ).json()

class RejectUserGroupRequestView(APIView):
    allowed_roles = ['ADMINS']
    permission_classes =[IsAuthenticated, HasRolePermission]
   
    def post(self, request, *args, **kwargs):
        user_id = request.curr_user.get("user_id")
        user_data = users_service.get_user_by_uuid(user_id)
        user_group_serializer = GroupSerializer(user_data["groups"], many=True)
        roles = [item['name'] for item in user_group_serializer.data]
        
        if not any(role in roles for role in ['ADMINS', 'TEACHERACCESSAPPROVERS']):
            raise APIBadRequestError('The logged-in user cannot assign groups.')
        
        users_groups_service.update_request_user_group(
            user_uuid=request.data.get("user_id"),
            group=request.data.get("group"),
            accepted = False
        )
        return CoreHttpResponse({
            "success": "true",
        }, status=status.HTTP_200_OK).json()
    