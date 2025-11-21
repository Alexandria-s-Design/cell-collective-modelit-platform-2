from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework import status
from ...service_manager import ServiceManager
from cc.core_exceptions import (
    APIUnauthorizedError
)
from cc.core_http_response import CoreResponseFormat, CoreHttpResponse


service_manager = ServiceManager()
aouth_service = service_manager.get_service("oauth", "get_oauth_service")

class GetAuthenticatedUserAppIdMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
          auth_header = request.headers.get("Authorization")
          if auth_header and auth_header.startswith("Bearer "):
            login_token = auth_header.split(" ")[1]
            valid_token = AccessToken(login_token)
            user_uuid = valid_token.get('user_uuid')
            request.curr_user = {
												"user_id": user_uuid
								}
        except Exception as e:
          # we do not token validity check, continue
          pass
        response = self.get_response(request)
        return response