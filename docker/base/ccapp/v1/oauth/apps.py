# ----------------------------------------- #
# SERVICE: oauth
# ----------------------------------------- #
from django.apps import AppConfig

class AuthConfig(AppConfig):
    name = 'v1.oauth'

    def ready(self):
        import v1.oauth.signals