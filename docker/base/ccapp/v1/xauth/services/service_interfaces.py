# ----------------------------------------- #
# SERVICE: auth
# ----------------------------------------- #

from abc import ABC, abstractmethod

class IAuthService(ABC):
    
    @abstractmethod
    def list_groups(self):
        pass
    
    @abstractmethod
    def list_permissions(self):
        pass
    
    @abstractmethod
    def assing_group_permission(self, post_data: dict):
        pass
  

class IWebUserService(ABC):

    @abstractmethod
    def register(self, post_data: dict):
        pass