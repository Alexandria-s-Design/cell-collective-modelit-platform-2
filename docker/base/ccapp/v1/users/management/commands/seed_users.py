from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from ....service_manager import ServiceManager

service_manager = ServiceManager()
users_service = service_manager.get_service("users", "get_user_service")

ENTRY_PASSWORD = 'tHelikarSUPERsecret'
TESTER_ENTRY_PASSWORD = '123456789'

class Command(BaseCommand):
    help = 'Seed the database with initial USERS'

    def handle(self, *args, **kwargs):
        self.create_users()

    def create_users(self):
        users = [
            {
                "user_uuid": None,
                "app_user_id": None,
                "roles": ["ADMINS"],
                "first_name": "Admin",
                "last_name": "test",
                "username": "admin",
                "email": "admin@cellcollective.org",
                "password": ENTRY_PASSWORD,
                "is_staff": True,
                "is_superuser": True
            },
            {
                "user_uuid": None,
                "app_user_id": None,
                "roles": ["VIEWERS"],
                "first_name": "Guest",
                "last_name": "test",
                "username": "guest",
                "email": "guest@cellcollective.org",
                "password": ENTRY_PASSWORD,
                "is_staff": True,
                "is_superuser": False
            },
            {
                "user_uuid": "83a1c34f-60fd-445a-a2e9-65eee70e5690",
                "app_user_id": 1,
                "roles": ["TEACHERS", "RESEARCHERS"],
                "first_name": "Teacher",
                "last_name": "test",
                "username": "teachertest",
                "email": "cchlteachertest@gmail.com",
                "password": TESTER_ENTRY_PASSWORD,
                "is_staff": True,
                "is_superuser": True
            }
        ]

        for user_data in users:
            if not User.objects.filter(username=user_data['username']).exists():
                # user = User.objects.create_user()
                # user.save()
                dict_user = {
                    "email": user_data['email'],
                    "first_name": user_data['first_name'],
                    "last_name": user_data['last_name'],
                    "password": user_data['password'],
                    "roles": user_data['roles'],
                    "app_user_id": user_data['app_user_id'],
                    "institution_id": None,
                }
                if user_data.get("user_uuid"):
                    dict_user["user_uuid"] = user_data.get("user_uuid")

                user_data = users_service.create_user(dict_user)
                username = user_data["user"].username
                self.stdout.write(self.style.SUCCESS(f"User '{username}' created"))
            else:
                self.stdout.write(self.style.WARNING(f"User '{user_data['username']}' already exists"))
                
        
