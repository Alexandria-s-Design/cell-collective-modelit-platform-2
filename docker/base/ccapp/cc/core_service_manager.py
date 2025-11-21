# ----------------------------------------- #
# CORE for SERVICE MANAGER: Defines the superclass
# for all service managers by module folder.
# ----------------------------------------- #
import importlib
import os

FACTORY_NAME = 'service_factory'

class CoreServiceManager:
    def __init__(self, module_dir="module1", start_load=True):
        self.module_folder = module_dir
        self.services = {}
        if start_load == True:
            self.load_services()

    def load_services(self):
        service_files = [
            f for f in os.listdir(self.module_folder)
            if os.path.isdir(os.path.join(self.module_folder, f)) and not f.startswith('__')
        ]
        
        for service_name in service_files:
            service_path = f"{self.module_folder}.{service_name}.services.{FACTORY_NAME}"
            if os.path.isfile(os.path.join(self.module_folder, service_name, "services", f"{FACTORY_NAME}.py")):
                print("Loading Service: "+ service_path)
                service = importlib.import_module(service_path)
                service_class = getattr(service, "ServiceFactory")
                self.services[service_name] = service_class()

    def get_service(self, service_name, service_factory, *service_args):
        if service_name in self.services:
            service_instance = self.services[service_name]
            if (hasattr(service_instance, service_factory)):
                service_method = getattr(service_instance, service_factory)
                return service_method(*service_args)
            else:
                raise ImportError(f"Service Factory '{service_name}.{service_factory}' is not loaded.")
        else:
            raise ImportError(f"Service '{service_name}' is not loaded.")

