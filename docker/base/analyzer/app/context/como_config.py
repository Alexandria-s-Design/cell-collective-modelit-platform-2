from ..schemas import ContextBody as ContextConf
from pathlib import Path
from como.project import Config
import os
import shutil

UPLOADS_DIR = "/uploads/context"
CONFIG_SHEETS_DIR = "config_sheets"

def initialize_fixtures(context_dir):
	fixtdir = os.path.abspath(os.path.join("app","context","fixtures"))

	# f_results = ["rnaseq.csv","mrnaseq_data_inputs_auto.xlsx","trnaseq_data_inputs_auto.xlsx"]	
	f_results = []
	for f_result in f_results:
			f_dest = f"{context_dir}/results/{f_result}"
			if not os.path.exists(f_dest):
				shutil.copy(f"{fixtdir}/results/{f_result}",	f_dest)
	
	if not os.path.exists(f"{UPLOADS_DIR}/{CONFIG_SHEETS_DIR}/ping.txt"):
		shutil.copytree(f"{fixtdir}/{CONFIG_SHEETS_DIR}", f"{UPLOADS_DIR}/{CONFIG_SHEETS_DIR}", dirs_exist_ok=True)
	
	return True

def initialize_config(conf: ContextConf) -> Config:
		
		context_name = f"{conf['modelOriginId']}_{conf['id']}"
		conf['contextDir'] = f"{UPLOADS_DIR}/{context_name}"
		conf['contextName'] = context_name
		conf['uploadsRoot'] = "/uploads"

		config = Config()
		config.update(
			data_dir=Path(conf['contextDir']),
			config_dir=Path(f"{conf['contextDir']}/{CONFIG_SHEETS_DIR}"),
			result_dir=Path(f"{conf['contextDir']}/results")
		)

		os.makedirs(f"{conf['contextDir']}/COMO_input", exist_ok=True)
		os.makedirs(f"{conf['contextDir']}/data_matrices", exist_ok=True)
		os.makedirs(f"{conf['contextDir']}/data_matrices/{context_name}", exist_ok=True)
		os.makedirs(f"{conf['contextDir']}/data_matrices/placeholder", exist_ok=True)
		os.makedirs(f"{conf['contextDir']}/results", exist_ok=True)
		os.makedirs(f"{conf['contextDir']}/results/{context_name}", exist_ok=True)
		os.makedirs(f"{conf['contextDir']}/{CONFIG_SHEETS_DIR}", exist_ok=True)
		initialize_fixtures(conf['contextDir'])
		return config
