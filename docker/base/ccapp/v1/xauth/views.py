# ----------------------------------------- #
# SERVICE: xauth
# ----------------------------------------- #
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import IsAuthenticated
from cc.core_http_response import CoreHttpResponse
from cc.core_http_request import CoreHTTPLoginRequest
from .serializers import (
    GroupSerializer,
    PermissionSerializer
)
from ..service_manager import ServiceManager
from datetime import timedelta, datetime
from django.utils import timezone
from django.urls import reverse_lazy
from django.contrib.auth.views import PasswordResetView, PasswordResetConfirmView
from django.contrib.messages.views import SuccessMessageMixin
from django.views.generic import TemplateView
from django.contrib.auth import update_session_auth_hash, login, get_user_model
from django.contrib.auth.forms import SetPasswordForm
from django.shortcuts import render, redirect
from cc.core_exceptions import (
  APIBadRequestError,
  APITokenExpiredError,
  APIPermissionDeniedError
)
from cc.core_http_status_code import (
  HttpStatusCode
)
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests
from .google.google_services import GoogleSdkLoginFlowService
import requests
import jwt
from datetime import datetime, timedelta, timezone
import uuid
import secrets
from urllib.parse import urlparse, urlunparse

TOKEN_EXPIRES_IN = 60*15

service_manager = ServiceManager()
auth_service = service_manager.get_service("xauth", "get_auth_service")
users_service = service_manager.get_service("users", "get_user_service")
aouth_service = service_manager.get_service("oauth", "get_oauth_service")


# Usage:
# generate_domain_prefix("https://cellcollective.org", "learning")
# Returns: https://learn.cellcollective.org
def generate_domain_prefix(origin_url, domain) -> str:    
    category_dict = {
        "teaching": "teach",
        "learning": "learn",
        "research": "research",
    }
    parsed_url = urlparse(origin_url)
    split_domain_url = parsed_url.netloc.split('.')
    domain_url_ends = ".".join(split_domain_url[-2:])
    domain_url = ''
    if domain:
        subdomain = split_domain_url[-3]+"-" if len(split_domain_url) == 3 else ''
        subdomain += f"{category_dict.get(domain)}"
        domain_url = f"{subdomain}.{domain_url_ends}"
    else:
        domain_url = f"{domain_url_ends}"
    
    return urlunparse((
        parsed_url.scheme,
        domain_url,
        parsed_url.path,
        parsed_url.params,
        parsed_url.query,
        parsed_url.fragment
    ))

def local_get_oauth_roles(pkUserUUID: str) -> list:
    user_groups = users_service.list_user_groups(pkUserUUID)
    group_serializer = GroupSerializer(user_groups["groups"], many=True)
    return [item['name'] for item in group_serializer.data]

class GroupListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        groups = auth_service.list_groups()
        groups_serializer = GroupSerializer(groups, many=True)
        return CoreHttpResponse({
            "name": "Role-Based Access Control (RBAC)",
            "groups": groups_serializer.data
        }, status=status.HTTP_200_OK).json()

class PermissionListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, *args, **kwargs):
        permissions = auth_service.list_permissions()
        permissions_serializer = PermissionSerializer(permissions, many=True)
        return CoreHttpResponse({
            "permissions": permissions_serializer.data
        }, status=status.HTTP_200_OK).json()
   
class AssignGroupPermissionView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request, *args, **kwargs):
        assing_data = auth_service.assing_group_permission(request.data)
        groups_serializer = GroupSerializer(assing_data["group"], many=False)
        permissions_serializer = PermissionSerializer(assing_data["permission"], many=False)
        return CoreHttpResponse({
            "assing": {
                "group": groups_serializer.data,
                "permission": permissions_serializer.data
            }
        }, status=status.HTTP_200_OK).json()
    
class LoginView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):        
        valid_user = users_service.get_valid_login_user(request.data)
        pkUserUUID = users_service.get_user_uuid_by_email(request.data.get("email"))
        request.__user__ = valid_user
        request.__class__ = CoreHTTPLoginRequest

        tokens = dict()
        if not valid_user.master:
            token_response = super().post(request, *args, **kwargs) 
            tokens = token_response.data
        else:
            # master is true for super password.
            refresh = RefreshToken.for_user(valid_user)
            tokens["access"] = str(refresh.access_token)
            tokens["refresh"] = str(refresh)
        
        oauth_roles = local_get_oauth_roles(pkUserUUID)
        
        expires_at = datetime.now(timezone.utc) + timedelta(seconds = TOKEN_EXPIRES_IN)

        aouth_service.save_access_tokens({
            "user_id": str(pkUserUUID),
            "access_token": tokens.get("access"),
            "refresh_token": tokens.get("refresh"),
            "expires": TOKEN_EXPIRES_IN,
            "expires_at": expires_at,
            "json_roles": oauth_roles
        })

        return Response({
            "user_id": str(pkUserUUID),
            "app_user_id": valid_user.app_user_id,
            "app_user_email": valid_user.email,
            "token_type": "Bearer",
            "expires_in": TOKEN_EXPIRES_IN,
            "access_token": tokens.get("access"),
            "refresh_token": tokens.get("refresh"),
            "expires_at": expires_at,
            "roles": oauth_roles
        })

class ImpersonateUserView(APIView):
  permission_classes = [IsAuthenticated]
  def post(self, request, *args, **kwargs):
    email = request.data.get("email")
    admin_password = request.data.get("password")
    admin_user_id = request.curr_user.get("user_id")
    admin_user_data = users_service.get_user_by_uuid(admin_user_id)
    group_serializer = GroupSerializer(admin_user_data["groups"], many=True)
    roles = [item['name'] for item in group_serializer.data]
    if 'ADMINS' not in roles:
      raise APIPermissionDeniedError('The logged-in user is not ADMIN role')
    
    pkUserUUID = users_service.get_user_uuid_by_email(email)
    if str(pkUserUUID) == str(admin_user_id):
      raise APIBadRequestError('You cannot impersonate yourself')
    
    if not users_service.check_password(admin_user_id, admin_password):
      raise APIBadRequestError('Your password is incorrect')
    
    user_data = users_service.get_existing_user_by_email(email)
    user = user_data['user']
    user.check
    refresh = RefreshToken.for_user(user)
    refresh['impersonated'] = True
    refresh['impersonator_id'] = admin_user_id
    refresh['app_user_id'] = str(pkUserUUID)
    oauth_roles = local_get_oauth_roles(pkUserUUID)
    expires_at = datetime.now(timezone.utc) + timedelta(seconds = TOKEN_EXPIRES_IN)
    
    aouth_service.save_access_tokens({
      "user_id": str(pkUserUUID),
      "access_token": str(refresh.access_token),
      "refresh_token": str(refresh),
      "expires": TOKEN_EXPIRES_IN,
      "expires_at": expires_at,
      "json_roles": oauth_roles,
      "created_by": admin_user_id
    })
    
    return Response({
      "user_id": str(pkUserUUID),
      "app_user_email": email,
      "app_user_id": user_data['app_user_id'],
      "token_type": "Bearer",
      "expires_in": TOKEN_EXPIRES_IN,
      "access_token": str(refresh.access_token),
      "refresh_token": str(refresh),
      "expires_at": expires_at,
      "roles": oauth_roles
    })

class LogoutView(APIView):

    def get(self, request, token, *args, **kwargs):
        aouth_service.remove_access_token(token)

        return CoreHttpResponse({
            "drop_token": token
        }, status=status.HTTP_200_OK).json()
    

class ResetPasswordView(SuccessMessageMixin, PasswordResetView):
    template_name = 'password_reset.html'
    email_template_name = 'password_reset_email.html'
    subject_template_name = 'password_reset_subject'
    success_message = "Instructions for resetting your password have been sent to your email,"\
            " if an account with the provided address exists."\
            " You should receive the message soon. If you don’t see it,"\
            " please confirm the email is correct and check your spam folder."

    success_url = reverse_lazy('password-reset-message')

class ResetPasswordMessageView(TemplateView):
    template_name = 'password_reset_message.html'


class ResetPasswordConfirmView(PasswordResetConfirmView):
    template_name = 'password_reset_confirm.html'
    success_url = reverse_lazy('login')

    def post(self, request, *args, **kwargs):
        super().post(request, *args, **kwargs)
        return redirect(self.get_success_url())
    

class TokenRefreshStorageView(TokenRefreshView):

    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get('refresh')
        
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            refresh_token_val = aouth_service.get_refresh_token(refresh_token)
            active_uuid = refresh_token_val.get('user_id')            
            oauth_roles = local_get_oauth_roles(active_uuid)
            
            # validate active user
            users_service.get_active_user_by_uuid(active_uuid)

            token_response = super().post(request, *args, **kwargs)
            tokens = token_response.data

            if "access" not in tokens or "refresh" not in tokens:
                return Response({
                    "detail": "New token generation failed"
                }, status=status.HTTP_400_BAD_REQUEST)

            expires_at = datetime.now(timezone.utc) + timedelta(seconds = TOKEN_EXPIRES_IN)
            
            aouth_service.save_access_tokens({
                "user_id": active_uuid,
                "access_token": tokens.get("access"),
                "refresh_token": tokens.get("refresh"),
                "expires": TOKEN_EXPIRES_IN,
                "expires_at": expires_at,
                "json_roles": oauth_roles
            })

            aouth_service.remove_access_token(refresh_token_val.get('access_token'))

            return Response({
                "expires_in": TOKEN_EXPIRES_IN,
                "access_token": tokens.get("access"),
                "refresh_token": tokens.get("refresh"),
                "expirest_at": expires_at
            }, status=status.HTTP_200_OK)

        except TokenError as e:
            return CoreHttpResponse({
                "details": str(e)
            }, status=status.HTTP_400_BAD_REQUEST).json()
        

class TokenVerifyStorageView(TokenRefreshView):

    def get(self, request, *args, **kwargs):
        login_token = None
        auth_header = request.headers.get("Authorization")
                
        if auth_header and auth_header.startswith("Bearer "):
            login_token = auth_header.split(" ")[1]

            if login_token is None:
                raise APITokenExpiredError("Invalid token!")
        
            try:
                access_tokens = aouth_service.get_access_token(login_token)
                user_uuid = access_tokens.user_id
                expires_at = access_tokens.expires_at
                now = datetime.now(timezone.utc)
                expires = int((expires_at - now).total_seconds())
                
                if (expires <= 0):
                    raise APITokenExpiredError("Token expired!")

                data = {
                    "user_id": str(user_uuid),
                    "roles": access_tokens.json_roles,
                    "expires_at": access_tokens.expires_at,
                    "expires": expires
                }
                
                return CoreHttpResponse({
                    "user": data
                }, status=HttpStatusCode.HTTP_200_OK).json()
            
            except APITokenExpiredError as e:
                raise APITokenExpiredError(str(e))            
            except Exception as e:
                raise APIBadRequestError(f"Required a access token. {str(e)}")
             
        return CoreHttpResponse({
            "details": {
                "error": "Not Authorization code found."
            }
        }, status=HttpStatusCode.HTTP_400_BAD_REQUEST).json()
        
class PublicApi(APIView):
    authentication_classes = ()
    permission_classes = ()

service_manager = ServiceManager()
users_service = service_manager.get_service("users", "get_user_service")

def generate_signin_temp_token(user_uuid: str, user_name: str, user_email: str):
    exp_time = datetime.now(timezone.utc) + timedelta(minutes=1)

    payload = {
        "exp": exp_time,
        "uuid": user_uuid,
        "user_name": user_name,
        "user_email": user_email
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    return token

class GoogleLoginRedirectApi(PublicApi):
    def get(self, request, *args, **kwargs):
        query_params = request.GET
        google_login_flow = GoogleSdkLoginFlowService()

        authorization_url, state = google_login_flow.get_authorization_url()

        request.session["domain_oauth2"] = query_params.get('domain', None)
        request.session["google_oauth2_state"] = state

        return redirect(authorization_url)

class GoogleLoginApi(PublicApi):
    class InputSerializer(serializers.Serializer):
        code = serializers.CharField(required=False)
        error = serializers.CharField(required=False)
        state = serializers.CharField(required=False)

    def get(self, request, *args, **kwargs):
        input_serializer = self.InputSerializer(data=request.GET)
        input_serializer.is_valid(raise_exception=True)

        validated_data = input_serializer.validated_data
        
        code = validated_data.get("code")
        error = validated_data.get("error")
        state = validated_data.get("state")

        if error is not None:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        if code is None or state is None:
            return Response({"error": "Code and state are required."}, status=status.HTTP_400_BAD_REQUEST)

        session_state = request.session.get("google_oauth2_state")

        if session_state is None:
            return Response({"error": "CSRF check failed."}, status=status.HTTP_400_BAD_REQUEST)

        del request.session["google_oauth2_state"]

        if state != session_state:
            return Response({"error": "CSRF check failed."}, status=status.HTTP_400_BAD_REQUEST)

        google_login_flow = GoogleSdkLoginFlowService()

        google_tokens = google_login_flow.get_tokens(code=code, state=state)

        id_token_decoded = google_tokens.decode_id_token()
        # user_info = google_login_flow.get_user_info(google_tokens=google_tokens)

        user_email = id_token_decoded["email"]
        user_uuid = None
        jwt = None
        user_data = {}

        try:           
          user_uuid = users_service.get_user_uuid_by_email(email=user_email)
        except Exception:
          pass

        gen_username = users_service.generate_social_username(id_token_decoded["name"], user_email)
        
        user_data = create_user_data(first_name=id_token_decoded["given_name"], last_name=id_token_decoded["family_name"], email=user_email, user_name=gen_username, password=id_token_decoded["sub"], avatar_uri=id_token_decoded.get("picture"), third_party_id=id_token_decoded["sub"], third_party_type="google", third_party_token=google_tokens.id_token, signin_temp_token=None, is_signin_temp_token_used=False)

        if user_uuid is None:
          created_user_data = users_service.create_user(user_data)
          user_uuid = users_service.get_user_uuid_by_email(user_email)
          jwt = generate_signin_temp_token(str(user_uuid), id_token_decoded["name"], user_email)
          
          user_data = {
            "signin_temp_token": jwt
          }
        else:
          jwt = generate_signin_temp_token(str(user_uuid), id_token_decoded["name"], user_email)
          user_data = create_user_data(first_name=id_token_decoded["given_name"], last_name=id_token_decoded["family_name"], email=user_email, user_name=gen_username, password=id_token_decoded["sub"], avatar_uri=id_token_decoded.get("picture"), third_party_id=id_token_decoded["sub"], third_party_type="google", third_party_token=google_tokens.id_token, signin_temp_token=jwt, is_signin_temp_token_used=False)

        user = users_service.get_user_by_email(email=user_email)        

        updated_user_data = users_service.update_user(user_uuid, user_data)

        base_frontend_url = settings.BASE_FRONTEND_URL
        if settings.APP_ENV_ENVIRONMENT == 'production':
            base_frontend_url = generate_domain_prefix(base_frontend_url, request.session.get("domain_oauth2"))

        return redirect(f'{base_frontend_url}/?auth=external&type=google&token={jwt}')

class LoginThirdPartyView(TokenObtainPairView):

    def post(self, request, *args, **kwargs):        
        signin_temp_token = request.data.get("signin_temp_token")
        user_uuid = None
        user_name = None
        user_email = None
        
        try:
            decoded_token = jwt.decode(signin_temp_token, settings.SECRET_KEY, algorithms=["HS256"])
            user_uuid = decoded_token.get("uuid")
            user_name = decoded_token.get("user_name")
            user_email = decoded_token.get("user_email")
            
            if users_service.is_signin_temp_token_used(user_uuid):
              return Response({"error": "Token has already been used"}, status=400)
        except jwt.ExpiredSignatureError:
            return Response({"error": "Token expired"}, status=400)
        except jwt.InvalidTokenError:
            return Response({"error": "Invalid token"}, status=400)
        
        valid_user = users_service.get_active_user_by_uuid(pkUUID=user_uuid)
        if not valid_user:
            return Response({"error": "User not found"}, status=404)
        
        try:
            request_data = 	{
              "is_signin_temp_token_used": True
            }

            user_data = users_service.update_user(user_uuid, request_data)
        except Exception as e:
            return Response({"error": "Failed to invalidate temp token"}, status=500)

        request.__user__ = valid_user
        request.__class__ = CoreHTTPLoginRequest
        
        refresh = RefreshToken.for_user(valid_user)
        access_token = str(refresh.access_token)

        oauth_roles = local_get_oauth_roles(user_uuid)
        
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=TOKEN_EXPIRES_IN)

        aouth_service.save_access_tokens({
            "user_id": str(user_uuid),
            "access_token": access_token,
            "refresh_token": str(refresh),
            "expires": TOKEN_EXPIRES_IN,
            "expires_at": expires_at,
            "json_roles": oauth_roles
        })

        return Response({
            "email": user_email,
            "user_name": user_name,
            "user_id": str(user_uuid),
            "app_user_id": valid_user.app_user_id,
            "app_user_email": valid_user.email,
            "token_type": "Bearer",
            "expires_in": TOKEN_EXPIRES_IN,
            "access_token": access_token,
            "refresh_token": str(refresh),
            "expires_at": expires_at,
            "roles": oauth_roles
        })
    
class FacebookLoginRedirectApi(PublicApi):
    def get(self, request, *args, **kwargs):
        query_params = request.GET
        redirect_uri = f"{settings.BASE_APP_URL}/auth/facebook-callback"
        state = secrets.token_urlsafe(16)
        
        request.session["domain_oauth2"] = query_params.get('domain', None)
        request.session["facebook_oauth2_state"] = state

        authorization_url = (
            f"{settings.SOCIAL_AUTH_FACEBOOK_URL}/v12.0/dialog/oauth?"
            f"client_id={settings.SOCIAL_AUTH_FACEBOOK_KEY}&"
            f"redirect_uri={redirect_uri}&"
            f"state={state}&"
            f"scope=email,public_profile,business_management"
        )
        return redirect(authorization_url)
  
class FacebookLoginApi(PublicApi):
    class InputSerializer(serializers.Serializer):
        code = serializers.CharField(required=False)
        error = serializers.CharField(required=False)
        state = serializers.CharField(required=False)

    def get(self, request, *args, **kwargs):
        input_serializer = self.InputSerializer(data=request.GET)
        input_serializer.is_valid(raise_exception=True)
        validated_data = input_serializer.validated_data

        code = validated_data.get("code")
        error = validated_data.get("error")
        state = validated_data.get("state")

        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        session_state = request.session.get("facebook_oauth2_state")
        if not session_state or state != session_state:
            return Response({"error": "CSRF check failed."}, status=status.HTTP_400_BAD_REQUEST)

        del request.session["facebook_oauth2_state"]

        token_url = (
            f"{settings.SOCIAL_AUTH_FACEBOOK_API}/v12.0/oauth/access_token?"
            f"client_id={settings.SOCIAL_AUTH_FACEBOOK_KEY}&"
            f"redirect_uri={settings.BASE_APP_URL}/auth/facebook-callback&"
            f"client_secret={settings.SOCIAL_AUTH_FACEBOOK_SECRET}&"
            f"code={code}"
        )
        token_response = requests.get(token_url)
        token_data = token_response.json()

        if "error" in token_data:
            return Response({"error": token_data["error"]["message"]}, status=status.HTTP_400_BAD_REQUEST)

        access_token = token_data["access_token"]

        user_info_url = f"{settings.SOCIAL_AUTH_FACEBOOK_API}/me?fields=id,name,email,picture&access_token={access_token}"
        user_info_response = requests.get(user_info_url)
        user_info = user_info_response.json()

        if "error" in user_info:
            return Response({"error": user_info["error"]["message"]}, status=status.HTTP_400_BAD_REQUEST)

        user_email = user_info.get("email")
        user_name = user_info.get("name")
        first_name = user_name.split()[0]
        last_name = user_name.split()[1]
        user_avatar = user_info.get("picture", {}).get("data", {}).get("url")

        user_uuid = None
        jwt = None
        user_data = None

        try:
            user_uuid = users_service.get_user_uuid_by_email(email=user_email)
        except Exception:
            pass

        gen_username = users_service.generate_social_username(user_name, user_email, user_email)
        user_data = create_user_data(first_name=first_name, last_name=last_name, email=user_email, user_name=gen_username, password=user_info["id"], avatar_uri=user_avatar, third_party_id=user_info["id"], third_party_type="facebook", third_party_token=access_token, signin_temp_token=None, is_signin_temp_token_used=False)

        if user_uuid is None:
            created_user_data = users_service.create_user(user_data)
            user_uuid = users_service.get_user_uuid_by_email(user_email)
            jwt = generate_signin_temp_token(user_uuid, user_name, user_email)
            user_data = { "signin_temp_token", jwt}
        else:
            jwt = generate_signin_temp_token(str(user_uuid), user_name, user_email)
            user_data = create_user_data(first_name=first_name, last_name=last_name, email=user_email, user_name=gen_username, password=user_info["id"], avatar_uri=user_avatar, third_party_id=user_info["id"], third_party_type="facebook", third_party_token=access_token, signin_temp_token=jwt, is_signin_temp_token_used=False)
        
        updated_user_data = users_service.update_user(user_uuid, user_data)

        base_frontend_url = settings.BASE_FRONTEND_URL
        if settings.APP_ENV_ENVIRONMENT == 'production':
            base_frontend_url = generate_domain_prefix(base_frontend_url, request.session.get("domain_oauth2"))

        return redirect(f"{base_frontend_url}/?auth=external&type=facebook&token={jwt}")
      
class LinkedInLoginRedirectApi(PublicApi):
    def get(self, request, *args, **kwargs):
        query_params = request.GET
        redirect_uri = f"{settings.BASE_APP_URL}/auth/linkedin-callback"
        state = secrets.token_urlsafe(16)

        request.session["domain_oauth2"] = query_params.get('domain', None)
        request.session["linkedin_oauth2_state"] = state

        authorization_url = (
            f"{settings.SOCIAL_AUTH_LINKEDIN_API}/v2/authorization?"
            f"response_type=code&"
            f"client_id={settings.SOCIAL_AUTH_LINKEDIN_KEY}&"
            f"redirect_uri={redirect_uri}&"
            f"state={state}&"
            f"scope=r_liteprofile,r_emailaddress"
        )
        return redirect(authorization_url)
    

def get_avatar_uri(user_avatar_data):
    elements = user_avatar_data.get("profilePicture", {}).get("displayImage~", {}).get("elements", [])
    
    if not elements:
        return None

    elements_sorted = sorted(
        elements,
        key=lambda x: x["data"]["com.linkedin.digitalmedia.mediaartifact.StillImage"]["displaySize"]["width"],
        reverse=False,
    )

    return elements_sorted[0]["identifiers"][0]["identifier"]

def create_user_data(first_name, last_name, avatar_uri, third_party_id, third_party_type, third_party_token, signin_temp_token, is_signin_temp_token_used, email, user_name, password):
    return {
        "email": email,
        "username": user_name,
        "password": password,
        "first_name": first_name,
        "last_name": last_name,
        "avatar_uri": avatar_uri, 
        "third_party_id": third_party_id,
        "third_party_type": third_party_type,
        "third_party_token": third_party_token,
        "signin_temp_token": signin_temp_token,
        "is_signin_temp_token_used": is_signin_temp_token_used
     }
    
class LinkedInLoginApi(PublicApi):
    class InputSerializer(serializers.Serializer):
        code = serializers.CharField(required=False)
        error = serializers.CharField(required=False)
        state = serializers.CharField(required=False)

    def get(self, request, *args, **kwargs):
        input_serializer = self.InputSerializer(data=request.GET)
        input_serializer.is_valid(raise_exception=True)
        validated_data = input_serializer.validated_data

        code = validated_data.get("code")
        error = validated_data.get("error")
        state = validated_data.get("state")

        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        session_state = request.session.get("linkedin_oauth2_state")
        if not session_state or state != session_state:
            return Response({"error": "CSRF check failed."}, status=status.HTTP_400_BAD_REQUEST)

        del request.session["linkedin_oauth2_state"]

        # Exchange authorization code for access token
        token_url = (
            f"{settings.SOCIAL_AUTH_LINKEDIN_API}/v2/accessToken?"
            f"grant_type=authorization_code&"
            f"code={code}&"
            f"redirect_uri={settings.BASE_APP_URL}/auth/linkedin-callback&"
            f"client_id={settings.SOCIAL_AUTH_LINKEDIN_KEY}&"
            f"client_secret={settings.SOCIAL_AUTH_LINKEDIN_SECRET}"
        )
        token_response = requests.post(token_url)
        token_data = token_response.json()

        if "error" in token_data:
            return Response({"error": token_data["error_description"]}, status=status.HTTP_400_BAD_REQUEST)

        access_token = token_data["access_token"]

        # Fetch user info from LinkedIn
        user_info_url = "https://api.linkedin.com/v2/me"
        user_email_url = "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))"
        headers = {"Authorization": f"Bearer {access_token}"}

        user_info_response = requests.get(user_info_url, headers=headers)
        user_info = user_info_response.json()

        user_email_response = requests.get(user_email_url, headers=headers)
        user_email_data = user_email_response.json()
        
        user_avatar_url = "https://api.linkedin.com/v2/me?projection=(profilePicture(displayImage~:playableStreams))"
        user_avatar_response = requests.get(user_avatar_url, headers=headers)
        user_avatar_data = user_avatar_response.json()

        user_avatar_uri = get_avatar_uri(user_avatar_data)
        
        if "error" in user_info or "error" in user_email_data:
            return Response({"error": "Failed to fetch user info from LinkedIn"}, status=status.HTTP_400_BAD_REQUEST)

        user_email = user_email_data["elements"][0]["handle~"]["emailAddress"]
        user_name = user_info.get("localizedFirstName") + " " + user_info.get("localizedLastName")

        user_uuid = None
        jwt = None
        user_data = None

        try:
            user_uuid = users_service.get_user_uuid_by_email(email=user_email)
        except Exception:
            pass

        gen_username = users_service.generate_social_username(user_name, user_email)
        user_data = create_user_data(email=user_email, first_name=user_info['localizedFirstName'], last_name=user_info['localizedLastName'], user_name=gen_username, password=user_info["id"], avatar_uri=user_avatar_uri, third_party_id=user_info["id"], third_party_type="linkedin", third_party_token=access_token, signin_temp_token=None, is_signin_temp_token_used=False)

        if user_uuid is None:
            created_user_data = users_service.create_user(user_data)
            user_uuid = users_service.get_user_uuid_by_email(user_email)
            jwt = generate_signin_temp_token(user_uuid, user_name, user_email)
            user_data = {"signin_temp_token": jwt}
        else:
            jwt = generate_signin_temp_token(str(user_uuid), user_name, user_email)
            user_data = create_user_data(email=user_email, first_name=user_info['localizedFirstName'], last_name=user_info['localizedLastName'], user_name=gen_username, password=user_info["id"], avatar_uri=user_avatar_uri, third_party_id=user_info["id"], third_party_type="linkedin", third_party_token=access_token, signin_temp_token=None, is_signin_temp_token_used=False)    

        updated_user_data = users_service.update_user(user_uuid, user_data)

        base_frontend_url = settings.BASE_FRONTEND_URL
        if settings.APP_ENV_ENVIRONMENT == 'production':
            base_frontend_url = generate_domain_prefix(base_frontend_url, request.session.get("domain_oauth2"))

        return redirect(f"{base_frontend_url}/?auth=external&type=linkedin&token={jwt}")
       
class TestImportUsers(APIView):
    def get(self, request, *args, **kwargs):
        return CoreHttpResponse({
              "message": "importing data..."
          }, status=status.HTTP_200_OK).json()
        
