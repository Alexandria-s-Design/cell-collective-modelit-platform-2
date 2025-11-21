# ----------------------------------------- #
# SERVICE: xauth
# ----------------------------------------- #
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import (
    Group as AuthGroup,
    Permission as AuthPermission,
    
)
from django.contrib.contenttypes.models import (
    ContentType
)

from v1.service_manager import ServiceManager

service_manager = ServiceManager()
users_service = service_manager.get_service("users", "get_user_service")

class ContentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentType
        fields = "__all__"
        
class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthGroup
        fields = "__all__"
        

class PermissionSerializer(serializers.ModelSerializer):
    content_type = ContentTypeSerializer()
    class Meta:
        model = AuthPermission
        fields = "__all__"
        
        
class JWTTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims, we could add more claims here like roles, names etc. so that UI does not need to make extra http call to get profile.
        token['user_uuid'] = str(users_service.get_user_uuid_by_email(user.email))
        return token
      