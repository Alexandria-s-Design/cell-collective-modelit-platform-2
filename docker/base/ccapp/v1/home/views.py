# ----------------------------------------- #
# SERVICE: users
# ----------------------------------------- #
# from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework import status
from cc.core_http_response import CoreHttpResponse

class HomeView(APIView):
    def get(self, request, *args, **kwargs):
        return CoreHttpResponse({
            "API": "ModelIt!"
				}, status=status.HTTP_200_OK).json()
