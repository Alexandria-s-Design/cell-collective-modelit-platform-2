# ----------------------------------------- #
# SERVICE: oauth
# ----------------------------------------- #
from .service_interfaces import IOauthService
from v1.oauth.models import V1OauthAccessTokens
from rest_framework.exceptions import NotFound
from ...service_manager import MODULE_NAME
from cc.core_exceptions import (
  APIRouteDoesNotExistError,
  APIRefreshTokenError
)
class OauthService(IOauthService):
        
    def get_super_name(self):
        return OauthService.__class__.__name__
  

    def save_access_tokens(self, post_data):
        new_token = V1OauthAccessTokens.objects.create(
            user_id = post_data.get("user_id"),
            access_token = post_data.get("access_token"),
            refresh_token = post_data.get("refresh_token"),
            expires = post_data.get("expires"),
            expires_at = post_data.get("expires_at"),
            json_roles = post_data.get("json_roles"),
            created_by = post_data.get("created_by", None),
				)
        return new_token
    
    def get_access_token(self, token: str):
        try:
           token_data = V1OauthAccessTokens.objects.get(access_token = token)
           return token_data
        except V1OauthAccessTokens.DoesNotExist:
           raise NotFound('Access Token not found')
        
    def remove_access_token(self, token: str):
        try:
            instance = V1OauthAccessTokens.objects.get(access_token = token)
            instance.delete()
            return True
        except Exception:
            return None
        
    def get_refresh_token(self, token: str):
        try:
            instance = V1OauthAccessTokens.objects.get(refresh_token = token)
            return {
                "id": str(instance.id),
                "user_id": str(instance.user_id),
                "expires_at": instance.expires_at,
                'access_token': instance.access_token
						}
        except V1OauthAccessTokens.DoesNotExist:
            raise APIRefreshTokenError('Refresh Token not found')
    