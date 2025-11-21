# ----------------------------------------- #
# SERVICE: auth
# ----------------------------------------- #
from .service_interfaces import IAuthService
from django.contrib.auth.models import Group, Permission
from rest_framework.exceptions import NotFound

class AuthService(IAuthService):
    
    def get_super_name(self):
        return AuthService.__class__.__name__

    def list_groups(self):        
        return Group.objects.all()
    
    def list_permissions(self):
        return Permission.objects.all()
    
    def assing_group_permission(self, post_data: dict):
        try:
           group = Group.objects.get(id=post_data.get("group_id"))
           permission = Permission.objects.get(id=post_data.get("permission_id"))
           group.permissions.add(permission)
           return {
              "group": group,
              "permission": permission
					 }
        except Group.DoesNotExist:
           raise NotFound('Group ID not found')
        except Permission.DoesNotExist:
           raise NotFound('Permission ID not found')