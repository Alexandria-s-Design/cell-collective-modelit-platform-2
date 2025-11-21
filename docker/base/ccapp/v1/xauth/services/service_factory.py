# ----------------------------------------- #
# SERVICE: auth
# ----------------------------------------- #
from .auth_service import AuthService
from .web_user_service import WebUserService

class ServiceFactory:
    @staticmethod
    def get_auth_service():
        return AuthService()

    @staticmethod
    def get_web_user_service():
        return WebUserService()