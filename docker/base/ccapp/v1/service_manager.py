from cc.core_service_manager import CoreServiceManager

MODULE_NAME = 'v1'
OAUTH_PERMISSIONS_METHODS = ['GET', 'PUT', 'POST', 'DELETE']

class ServiceManager(CoreServiceManager):
   
    def __init__(self, module_dir='v1', start_load=True):
        super().__init__(module_dir, start_load)



