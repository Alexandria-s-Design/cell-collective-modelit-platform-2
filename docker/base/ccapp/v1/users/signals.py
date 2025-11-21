import uuid
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User as AuthUser
from v1.users.models import V1User, V1Profile, Notification, V1UserGroupRequest
from ..service_manager import ServiceManager
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

service_manager = ServiceManager()
users_service = service_manager.get_service("users", "get_user_service")

@receiver(post_save, sender=AuthUser)
def create_user_related_models(sender, instance, created, **kwargs):
    if created:
        # Create the V1User entry
        v1_user = V1User.objects.create(
            id=uuid.uuid4(),
            auth_user=instance,
            is_active=True,
        )
        
        # Create the V1Profile entry for the newly created V1User
        V1Profile.objects.create(
            user=v1_user,
            institution_id=None,
            third_party_id=None,
            third_party_type=None,
            third_party_token=None,
            signin_temp_token=None,
            is_signin_temp_token_used=None,
            avatar_uri=None,
            created_by=v1_user.id,
            updated_by=v1_user.id,
        )
        
@receiver(post_save, sender=V1UserGroupRequest)
def notify_admins_on_new_request(sender, instance, created, **kwargs):
    if created:  
			  # get all admins
        users = V1User.objects.all()
        admins = []
        for user in users:
          full_user = users_service.get_user_by_uuid(user.id)
          queryset = full_user.get('groups')
          groups = [group.name for group in queryset]
          if  'ADMINS' in groups or 'TEACHERACCESSAPPROVERS' in groups:
            admins.append(user)
				# user requesting teachers access details
        user_from_instance = instance.user
        requested_by = users_service.get_user_by_uuid(user_from_instance.id)["user"]
        # notification message
        message = f"New request to join {instance.new_group} by {requested_by.email}."
        
        for admin in admins:
            Notification.objects.create(user=admin, message=message)
            # send websocket notification
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
							f"admin_notifications_{admin.id}",
              {"type": "send_notification", "message": message}
						)