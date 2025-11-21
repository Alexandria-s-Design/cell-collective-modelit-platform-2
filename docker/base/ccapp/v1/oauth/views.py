# ----------------------------------------- #
# SERVICE: oauth
# ----------------------------------------- #
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from cc.core_http_response import CoreHttpResponse
from ..service_manager import ServiceManager

service_manager = ServiceManager()
aouth_service = service_manager.get_service("oauth", "get_oauth_service")

