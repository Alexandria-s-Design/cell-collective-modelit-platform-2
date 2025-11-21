from django.apps import AppConfig

class UsersConfig(AppConfig):
    name = 'v1.users'

    def ready(self):
        import v1.users.signals