from django.utils import timezone
from .service_interfaces import IUserGroupService
from django.contrib.auth.models import User, Group
from ..models import V1UserGroupRequest
from cc.core_exceptions import (
  APIInternalError,
  APIGroupDoesNotExistError,
  APIBadRequestError
)

class UserGroupService(IUserGroupService):
    def create_request_user_group(self, user_uuid: str, user_groups: dict, new_group: str):
      try:

        fetch_new_group = Group.objects.get(name=new_group)
        pending_request = V1UserGroupRequest.objects.filter(user_id=user_uuid, new_group=fetch_new_group, pending=True).first()
        
        if pending_request:
           return pending_request
        
        fetch_old_group = Group.objects.get(id=user_groups[-1].get("id"))
        group_request = V1UserGroupRequest.objects.create(
            user_id = user_uuid,
            old_group = fetch_old_group,
            new_group = fetch_new_group,
            pending = True,
        )

        return group_request
        
      except Group.DoesNotExist:
          raise APIGroupDoesNotExistError(new_group)
    

    def update_request_user_group(self, user_uuid: str, group: str, accepted: bool):
        try:
            group = Group.objects.get(name=group)
            fetch_group_request = V1UserGroupRequest.objects.filter(user_id=user_uuid, new_group=group, pending = True).first()

            if fetch_group_request:
               fetch_group_request.updated_at = timezone.now()
               fetch_group_request.pending = False
               fetch_group_request.accepted = accepted
               fetch_group_request.save()

            return {
               "group_request": fetch_group_request
            }

        except Group.DoesNotExist:
            raise APIGroupDoesNotExistError(group)