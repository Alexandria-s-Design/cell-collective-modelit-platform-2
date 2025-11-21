import requests
from .service_interfaces import IWebUserService
from django.conf import settings

class WebUserService(IWebUserService):

  def register(self, post_data):
    web_api_response = requests.post(
        f"{settings.BASE_WEB_API_URL}/users/register",
        json={
            "email": post_data.get("email"),
            "lastName": post_data.get("last_name"),
            "firstName": post_data.get("first_name"),  
            "ccappUserId": post_data.get("ccapp_user_id"),
        }
    )
    web_api_response.raise_for_status()
    response_data = web_api_response.json()
    
    return response_data["data"]["user_id"]