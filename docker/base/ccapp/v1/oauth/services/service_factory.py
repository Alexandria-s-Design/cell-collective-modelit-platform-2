# ----------------------------------------- #
# SERVICE: oauth
# ----------------------------------------- #
from .oauth_service import OauthService

class ServiceFactory:
    @staticmethod
    def get_oauth_service():
        return OauthService()