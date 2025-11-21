from rest_framework import serializers
from ..models import V1User, V1Profile, V1UserGroupRequest
from django.contrib.auth.models import (
	  User as AuthUser,
    Group as AuthGroup   
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthUser
        fields = ['username', 'email',
                  'first_name', 'last_name',
                  'is_superuser',
                  'date_joined', 'last_login', 'is_active']

class V1UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = V1User
        fields = ['id', 'auth_user_id', 'created_at', 'app_user_id']

class V1ProfileSerializer(serializers.ModelSerializer):
    user = V1UserSerializer()

    class Meta:
        model = V1Profile
        fields = ['id', 'user', 'institution_id', 'third_party_id',
                  'third_party_type', 'avatar_uri', 'created_at',
                  'created_by', 'updated_by', 'third_party_token', 'signin_temp_token',  'is_signin_temp_token_used']
        
class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuthGroup
        fields = "__all__"
        
class V1UserGroupRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = V1UserGroupRequest
        fields = ['id', 'user_id', 'old_group_id', 'new_group_id', 'pending', 'accepted', 'created_at', 'updated_at']
