# ----------------------------------------- #
# SERVICE: users
# ----------------------------------------- #
from abc import ABC, abstractmethod

class IUserService(ABC):
    
    @abstractmethod
    def get_auth_user_by_email(self, email: str):
       pass
    
    @abstractmethod
    def get_user_by_uuid(self, id: int):
        pass
    
    @abstractmethod
    def get_existing_user_by_email(self, email):
        pass

    @abstractmethod
    def get_user_uuid_by_email(self, email: str):
        pass
      
    @abstractmethod
    def get_user_group_requests(self, user_id: str, assigned_group_id: list[str]):
       pass

    @abstractmethod
    def get_user_by_email(self, email):
        pass

    @abstractmethod
    def create_user(self, post_data: dict, force_update: bool):
        pass

    @abstractmethod
    def update_user(self, pkUUID, post_data: dict):
        pass

    @abstractmethod
    def disable_or_enable_user(self, pkUUID, active: bool):
        pass
    
    @abstractmethod
    def assing_user_group(self, post_data: dict):
        pass
    
    @abstractmethod
    def list_user_groups(self, pkUUID):
         pass
    
    @abstractmethod
    def get_valid_login_user(self, post_data: dict):
         pass
    
    @abstractmethod
    def get_active_user_by_uuid(self, pkUUID: str):
         pass
    
    @abstractmethod
    def get_all_users(self):
         pass
    
    @abstractmethod
    def generate_social_username(self, name: str, email: str):
        pass
    
    @abstractmethod
    def check_password(self, pkUUID, password):
      pass

class IUserGroupService(ABC):
    
    @abstractmethod
    def create_request_user_group(self, user_uuid: str, user_groups: dict, new_group: str):
        pass
    
    @abstractmethod
    def update_request_user_group(self, user_uuid: str, group: str, accepted: bool):
        pass