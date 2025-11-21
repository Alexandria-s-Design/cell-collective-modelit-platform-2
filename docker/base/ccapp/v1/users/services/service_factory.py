# ----------------------------------------- #
# SERVICE: users
# ----------------------------------------- #
from .users_service import UserService
from .users_groups_service import UserGroupService
from .notifications_service import UserNotifications

class ServiceFactory:
    @staticmethod
    def get_user_service():
        return UserService()
    
    @staticmethod
    def get_user_group_service():
        return UserGroupService()
    
    @staticmethod
    def get_user_notifications_service():
        return UserNotifications()