# ----------------------------------------- #
# SERVICE: oauth
# ----------------------------------------- #
from abc import ABC, abstractmethod

class IOauthService(ABC):

    @abstractmethod
    def save_access_tokens(self, post_data):
        pass
    
    @abstractmethod
    def get_access_token(self, token):
        pass
    
    @abstractmethod
    def remove_access_token(self, token):
        pass
    
    @abstractmethod
    def get_refresh_token(self, token: str):
        pass