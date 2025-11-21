# ----------------------------------------- #
# SERVICE: oauth
# ----------------------------------------- #
import uuid
from django.db import models
from ..service_manager import MODULE_NAME
from cc.core_base_models import CoreBaseModel
from django.contrib.auth.models import Group


# Defines Clients (Apps). E.g: k12, cc.
class V1OauthClients(CoreBaseModel):
      id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
      name = models.CharField(max_length = 60, null=True)
      client_secret = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
      redirect_uri = models.CharField(max_length = 300, null=True)
      grant_types = models.CharField(max_length = 255, null=True)
      scope = models.JSONField(null=True, editable=True)
      
      class Meta:
        db_table = CoreBaseModel.get_table_name(MODULE_NAME, 'oauth_clients')
        indexes = [
            models.Index(fields=['client_secret'])
        ]

# Defines User authorization. E.g: Joe, John.
class V1OauthAuthorization(CoreBaseModel):
      id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
      code = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
      user_id = models.UUIDField(null=True, editable=True)
      client_id = models.ForeignKey(V1OauthClients, on_delete=models.SET_NULL, null=True, blank=True)
      grant_types = models.CharField(max_length = 255, null=True)
      scope = models.JSONField(null=True, editable=True)
      
      class Meta:
        db_table = CoreBaseModel.get_table_name(MODULE_NAME, 'oauth_authorization')
        indexes = [
            models.Index(fields=['user_id']),
            models.Index(fields=['code'])
				]

class V1OauthAccessTokens(CoreBaseModel):
      id = models.UUIDField(default=uuid.uuid4, unique=True, primary_key=True, editable=False)
      user_id = models.UUIDField(null=True, editable=True)
      access_token = models.CharField(max_length=1000, null=True, editable=True)
      refresh_token = models.CharField(max_length=1000, null=True, editable=True)
      expires = models.IntegerField(null=True)
      expires_at = models.DateTimeField(null=True)
      json_roles = models.JSONField(null=True, editable=True)
      json_routes = models.JSONField(null=True, editable=True)
      
      class Meta:
          db_table = CoreBaseModel.get_table_name(MODULE_NAME, 'oauth_access_tokens')
          indexes = [
              models.Index(fields=['user_id']),
              models.Index(fields=['access_token'])
          ]