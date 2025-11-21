# ----------------------------------------- #
# SERVICE: users
# ----------------------------------------- #
import uuid
from django.db import models
from ..service_manager import MODULE_NAME
from cc.core_base_models import CoreBaseModel
from django.contrib.auth.models import User, Group

class V1User(CoreBaseModel):
      id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
      auth_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
      is_active = models.BooleanField()
      app_user_id = models.BigIntegerField(null=True)
      
      class Meta:
        db_table = CoreBaseModel.get_table_name(MODULE_NAME, 'user')
       
class V1Profile(CoreBaseModel):
      id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
      user = models.ForeignKey(V1User, on_delete=models.CASCADE, null=True, blank=True)
      institution_id = models.IntegerField(null=True)
      third_party_id = models.CharField(max_length=255, null=True)
      third_party_type = models.CharField(max_length=50, null=True)
      third_party_token = models.CharField(max_length=1500, null=True)
      signin_temp_token = models.CharField(max_length=300, null=True)
      is_signin_temp_token_used = models.BooleanField(default=False, null=True)
      avatar_uri = models.CharField(max_length=500, null=True)
      class Meta:
        db_table = CoreBaseModel.get_table_name(MODULE_NAME, 'profile')
        indexes = [
            models.Index(fields=['institution_id']),
            models.Index(fields=['third_party_type']),
            models.Index(fields=['third_party_id'])
        ]
        

class V1UserGroupRequest(CoreBaseModel):
      id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
      user = models.ForeignKey(V1User, on_delete=models.CASCADE, null=True, blank=True)
      new_group = models.ForeignKey(
          Group,
          on_delete=models.CASCADE,
          related_name='v1usergrouprequest_new_group'
      )
      old_group = models.ForeignKey(
          Group,
          on_delete=models.CASCADE,
          related_name='v1usergrouprequest_old_group'
      )
      pending = models.BooleanField()
      accepted = models.BooleanField(default=False)
      
      class Meta:
        db_table = CoreBaseModel.get_table_name(MODULE_NAME, 'user_group_request')
        indexes = [
            models.Index(fields=['pending'])
        ]
        
class Notification(CoreBaseModel):
  id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
  user = models.ForeignKey(V1User, on_delete=models.CASCADE, related_name="notifications")
  message = models.TextField()
  is_read = models.BooleanField(default=False)