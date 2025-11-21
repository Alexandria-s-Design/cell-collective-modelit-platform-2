# ----------------------------------------- #
# SERVICE: xauth
# ----------------------------------------- #
from django.apps import AppConfig

class AuthConfig(AppConfig):
    name = 'v1.xauth'

    def ready(self):
        import v1.xauth.signals