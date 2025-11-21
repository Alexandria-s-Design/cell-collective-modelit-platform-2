from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import AccessToken
from channels.db import database_sync_to_async
from django.db import close_old_connections
from ...service_manager import ServiceManager
from datetime import datetime, timezone as timezoneUtc

service_manager = ServiceManager()
users_service = service_manager.get_service("users", "get_user_service")
oauth_service = service_manager.get_service("oauth","get_oauth_service")


@database_sync_to_async
def get_user(token):
    try:
      token = oauth_service.get_access_token(token)
      
      expires_at = datetime.fromisoformat(str(token.expires_at))
      current_time_utc = datetime.now(timezoneUtc.utc)
      current_time = int(current_time_utc.timestamp())
      expires_at = int(expires_at.timestamp())
      
      if current_time > expires_at:
        return AnonymousUser()
      
      user_uuid = token.user_id
      full_user = users_service.get_user_by_uuid(user_uuid)
      queryset = full_user.get('groups')
      groups = [group.name for group in queryset]
      if  'ADMINS' in groups or 'TEACHERACCESSAPPROVERS' in groups:
        return full_user['profile']
      else:
        return AnonymousUser()
    except Exception:
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        params = parse_qs(query_string)
        token = params.get("token", [None])[0]
        
        close_old_connections()

        scope["user"] = await get_user(token) if token else AnonymousUser()

        return await self.inner(scope, receive, send)
