# ----------------------------------------- #
# SERVICE: oauth
# ----------------------------------------- #
from rest_framework import serializers
from django.contrib.auth.models import  Group as AuthGroup


class GroupSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = AuthGroup
        fields = '__all__'

