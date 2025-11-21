import os
import json
import shutil
import pandas as pd
from ..schemas import ContextBody as ContextConf
from openpyxl import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows
from como.project import Config
from loguru import logger

def context_get_key_in(conf: dict, keys, _keys=None):
		_tConf = None
		for k in keys:
			if _tConf is None and k in conf:
				_tConf = conf[k]
				continue
			if _tConf is None:
				break
			if k in _tConf:
				_tConf = _tConf[k]

		return _tConf

def context_valid_checkbox(conf_name, conf: ContextConf):
		conf_val = context_get_key_in(conf, ['settings','settings','checkboxesData', conf_name])
		if conf_val is not None and 'value' in conf_val:
			return conf_val['value'] == 'true' or conf_val['value'] == True
		return None

def context_get_valid_upload(type_upload, path,) -> str: 
		print(f"{type_upload}: Checking the existence of the file {path}.")
		if not os.path.exists(path):
				raise ValueError(f"{type_upload}: The file {path} does not exist.")
		return path

# Rename Count Matrix
def rename_matrix_csv_cols(filePath, targetDir):
    df = pd.read_csv(filePath)
    df.rename(columns={
				'genes': 'ensembl_gene_id',
		}, inplace=True)
    targetPath = os.path.join(targetDir, 'renamed_gene_counts_matrix.csv')
    df.to_csv(targetPath, index=False)
    return targetPath

# Returns the new file path
def rename_boundary_csv_cols(filePath, targetDir):
		df = pd.read_csv(filePath)

		df.rename(columns={
				'Reaction ID': 'Abbreviation',
				'Compartment': 'Compartment',
				'Lower Bound': 'Minimum Reaction Rate',
				'Upper Bound': 'Maximum Reaction Rate'
		}, inplace=True)

		df['Reaction'] = df['Boundary']
    
    # Remove the 'Boundary' column as it is no longer needed in COMO
		df.drop(columns=['Boundary'], inplace=True)

		# Reordering columns
		df = df[['Reaction','Abbreviation', 'Compartment', 'Minimum Reaction Rate', 'Maximum Reaction Rate']]
		targetPath = os.path.join(targetDir, 'renamed_boundary_reactions.csv')
		df.to_csv(targetPath, index=False)
		return targetPath

# Returns the new file path
def rename_active_genes_csv_cols(filePath, targetDir):
		df = pd.read_csv(filePath)
		df.rename(columns={
				'Active': 'combine_z'
		}, inplace=True)
		targetPath = os.path.join(targetDir, 'active_genes.csv')
		df.to_csv(targetPath, index=False)
		return targetPath

# Returns the new file path
def rename_reactions_csv_cols(filePath, targetDir: str, prefix: str):
		df = pd.read_csv(filePath)

		df.rename(columns={
				'Reaction ID': 'Abbreviation'
		}, inplace=True)

		targetPath = os.path.join(targetDir, f"renamed_{prefix}_reactions.csv")
		df.to_csv(targetPath, index=False)
		return targetPath

# Returns the new file path
def ensure_objective_in_json(input_json_filepath, target_dir):
    output_json_filepath = os.path.join(target_dir, "obj_generated_model.json")
    model_data = {}
    with open(input_json_filepath, 'r') as file:
        model_data = json.load(file)

    reactions = model_data.get('reactions', [])
    first_reaction = reactions[0] if reactions else None

    if first_reaction == None:
        raise ValueError("Reaction value is required in the model JSON file")

    objective_id = first_reaction['id']
    objective_key = 'objective'
    objective_dict = {}

    if objective_key not in model_data:
        objective_dict[objective_id] = 1.0
        model_data[objective_key] = objective_dict

    with open(output_json_filepath, 'w') as file:
        json.dump(model_data, file, indent=4)

    return output_json_filepath, objective_id

def generate_trnaseq_data(
		matrix_filepath: str,
		context_name: str,
		config: Config = None,
		xlsx_name: str = 'trnaseq_data_inputs_auto'
) -> str:
    
    column_headers = ["sample_name", "fragment_length", "layout", "strand", "study", "library_prep"]
    wb = Workbook()
    ws = wb.active
    ws.title = context_name

    ws.append(column_headers)


		# pd.compat.StringIO(csv_data)
    df = pd.read_csv(matrix_filepath)
    
    for col_name in df.columns[1:].tolist():
        row_data = [
					col_name, '', 'paired-end', 'NONE', 'S3', 'total'
				]
        ws.append(row_data)
    
    wb.save(f"{config.config_dir}/{xlsx_name}.xlsx")

    return f"{config.config_dir}/{xlsx_name}.xlsx"


def copy_gene_counts_matrix_total(
		matrix_filepath: str,
		context_name: str,
		config: Config = None
) -> str:
		
    if not os.path.exists(matrix_filepath):
        raise ValueError(f"Gene count matrix file does not exist.")

    destination_path =  os.path.join( 
        config.data_dir, "data_matrices",
        context_name,
        f"gene_counts_matrix_total_{context_name}.csv"
    )
			
    if os.path.exists(destination_path):
        print(f"Retrieving the gene counts matrix file from {destination_path}")
        return destination_path
	
    shutil.copy(matrix_filepath, destination_path)
    print(f"Copying the gene counts matrix file to {destination_path}")
    return destination_path

# Initializing and creating files and folders for testing
def initialize_testing(replace = False):
    body = {}
    with open("/app/tests/fixtures/create_context_req.json", "r") as fp:
        body = json.loads(fp.read())
        
    source_dir = '/app/tests/fixtures/inputs'
    destination_dir = '/uploads/context/test_como'

    if replace == True:
        logger.debug(f"Removed the directory and all of its contents. {destination_dir}")
        shutil.rmtree(destination_dir)

    if not os.path.exists(destination_dir):
        logger.debug(f"Copying input directory to {destination_dir}")
        os.makedirs(destination_dir)
        shutil.copytree(source_dir, destination_dir+"/inputs")

    return body

