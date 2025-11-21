# TODO: This command should be placed in cc/management/commands/makeservice.py
# and use the BaseCommand class from the django.core.management.base module

import os
import sys

RED = '\033[31m'
GREEN = '\033[32m'
YELLOW = '\033[33m'
RESET = '\033[0m'

def main():

		print(f"\n")
		module_dir = sys.argv[1]
		service_name = sys.argv[2]
		
		module_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), module_dir)
		service_path = os.path.join(module_path, service_name)
    
		print(f"{GREEN}==> Finding module directory:\n {module_path}{GREEN}\n")	
		if not os.path.exists(module_path):
				print(f"{RED}==> Module {module_dir} does not exists:\n {module_path}{RED}\n")
				return
				
		if os.path.exists(service_path):
				print(f"{YELLOW}==> Service already exists: {service_path}{YELLOW}\n")
				return
		
		os.makedirs(service_path)
		os.makedirs(os.path.join(service_path, "services"), exist_ok=True)
		os.makedirs(os.path.join(service_path, "migrations"), exist_ok=True)
		os.makedirs(os.path.join(service_path, "tests"), exist_ok=True)
		os.makedirs(os.path.join(service_path, "management"), exist_ok=True)
		os.makedirs(os.path.join(service_path, "management", "commands"), exist_ok=True)
		os.makedirs(os.path.join(service_path, "serializers"), exist_ok=True)
		os.makedirs(os.path.join(service_path, "middleware"), exist_ok=True)
		

		service_file_list = [
				{"file": f"{service_path}/services/__init__.py"},
				{"file":f"{service_path}/services/service_factory.py"},
				{"file":f"{service_path}/services/service_interfaces.py"},
				{"file":f"{service_path}/services/{service_name}_service.py"},
				{"file":f"{service_path}/migrations/__init__.py"},
				{"file":f"{service_path}/tests/__init__.py"},
				{"file":f"{service_path}/tests/test_{service_name}.py"},
				{"file":f"{service_path}/management/__init__.py"},
				{"file":f"{service_path}/management/commands/__init__.py"},
				{"file":f"{service_path}/management/commands/seed_{service_name}.py"},
				{"file":f"{service_path}/models.py"},
				{"file":f"{service_path}/urls.py"},
				{"file":f"{service_path}/views.py"},
				{"file":f"{service_path}/__init__.py"},
				{"file":f"{service_path}/apps.py"},
				{"file":f"{service_path}/serializers/__init__.py"},
				{"file":f"{service_path}/middleware/__init__.py"},
		]
		
		for file_conf in service_file_list:
				with open(file_conf["file"], 'w') as file:
						file.write(f"# ----------------------------------------- #\n")
						file.write(f"# SERVICE: {service_name}\n")
						file.write(f"# ----------------------------------------- #\n")

		print(f'{GREEN}==> Service {service_name} created successfully!{GREEN}\n')

if __name__ == '__main__':
    main()