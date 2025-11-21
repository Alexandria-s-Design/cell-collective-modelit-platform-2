import time
from typing import Any
from collections import defaultdict
import json
import os
import libsbml
import cobra 
import tempfile

import tellurium as te
import numpy as np

from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware

from .context.como_invoker import (
    ComoInvoker,
    RNASeqPreprocess as ComoRNASeqPreprocess,
    RNASeqGen as ComoRNASeqGen,
    Proteomics as ComoProteomics,
    DataMerging as ComoDataMerging,
    CreateContextSpecific as ComoGenerateModelJSON,
)
from .context.como_config import initialize_config
from .context.context_utils import (
	context_valid_checkbox, initialize_testing
)
from .context.como_inputs import ComoInputs
from .schemas import KineticBody, PbpkBody, ContextBody, DrugAnalyzerBody, DrugSolverBody, KineticExportBody
from .utils import json_to_sbml, json_to_pbpk_antimony, sbml_to_pbpk_json, convert_json_to_sbml
from .utils.sbml_document_util import (
  sbml_to_json as util_sbml_to_json
)

from .utils.string import safe_decode

from .utils.sbml import (
      addKB
)

from .metabolic.analyse import analyse

from .context.como_zipfile import (
    ComoZipfile
)

from .drug_identification.drug_perform import perform_diff_gene
from .drug_identification.knockout.knock_out_simulation import main as perform_scores

from .context.como_test import como_test_biodbnet
from .config.settings import UPLOADS_EXPORTS_DIR
from .utils.hashing import generate_hash

cobra.Configuration().solver = "glpk"

app = FastAPI()
app.add_middleware(
  CORSMiddleware,
  allow_origins=['*'],
  allow_credentials=True,
  allow_methods=['*'],
  allow_headers=['*'],
)


@app.get('/')
def index():
  return {
    'message': "Welcome"
  }

@app.get('/test')
def test():
    df = como_test_biodbnet()
    return {'message': 'Tested!'}

@app.post('/kinetic')
def kinetic(body: KineticBody):
  try:        
				# the first fucntion also contains methods to fetch metadata and notes for species and other elements 
        # but that information is not currently contained in the JSON model. I am preserving this code for 
        # future use when we have more information in the JSON model. currently just use convert_json_to_sbml
        
        # sbml_model_str = json_to_sbml(body.model)
        
        sbml_model_str = convert_json_to_sbml(body.model)
        
        
        try:
          model = te.loadSBMLModel(sbml_model_str)
        except Exception as load_error:
          print("Error during model loading:", load_error)
          return {"error": f" Error loading model: {str(load_error)}"} 

        selections = ['time'] + model.getBoundarySpeciesIds() + model.getFloatingSpeciesIds()
        
				# Dynamic timeframe calculation
        reaction_rates = model.getReactionRates()
        
        print("Reaction Rates:", reaction_rates)  # Log the reaction rates
        
        # num_timesteps = body.parameters.num_timesteps
        # print num_timesteps 100 (0, 100, 1000)
        # print("Number of timesteps:", num_timesteps)  # Cant see this log after selections
        
        try:
          print("Starting simulation...")
          results = model.simulate(0, 100, 100, selections)
          print("Simulation completed.")
        except Exception as e:
          print(f"Simulation failed with error: {e}")
          return {"error": f"Simulation failed: {str(e)}"}

        data = []
  
        for result in results:
            for i, selection in enumerate(selections[1:], start=1):
                data_entry = {"time": result[0], "species": selection, "value": result[i]}
                print("Data Entry:", data_entry)  # Log each entry
                data.append(data_entry)
                    
        return data
  except Exception as e:
        return {"error": str(e)}


@app.post('/pbpk')
def pbpk(body: PbpkBody):
    antimony_model_str = json_to_pbpk_antimony(body.model, simulation_length=body.parameters.num_timesteps)
    print(antimony_model_str)
    model = te.loada(antimony_model_str)
    print(model.getFloatingSpeciesIds(), model.getBoundarySpeciesIds())
    # selections specifies the output variables in a simulation
    selections = ['time'] + model.getBoundarySpeciesIds() + model.getFloatingSpeciesIds()

  # prepare results dict structure
    results = {k: {"time": [], "value": []} for k in selections[1:]}
    for parameter in model.getGlobalParameterIds():
        results[parameter] = []
     
    for x in range(body.parameters.population_size):
        for name, value in zip(model.getGlobalParameterIds(), model.getGlobalParameterValues()):
            results[name].append(value)
        
        result = model.simulate(0, body.parameters.num_timesteps, int(body.parameters.num_timesteps/body.parameters.step_size), selections)
        for i, selection in enumerate(selections[1:], start=1):
            results[selection]["time"] = result[:, 0].tolist()
            results[selection]["value"].append(result[:, i].tolist())
        model.resetToOrigin()
    return results

@app.post('/context')
def contextSpecific(body: dict):
        print(body)
        
        # body = initialize_testing()
        config = initialize_config(conf=body)
        
        body_replacer = ComoInputs(conf=body, config=config)
        body = body_replacer.initialize()

        invoker = ComoInvoker(body, config=config)

				# Generate files at: CONTEXT_FOLDER/data_matrices/{CONTEXT_FOLDER}/gene_counts_total
        invoker.add(ComoRNASeqPreprocess(analysis_type='bulk_rna'))

        # Generate files at: CONTEXT_FOLDER/results/{CONTEXT_FOLDER}/total/
        for analysis_type in ['bulk_rna', 'bulk_polya_rna', 'bulk_cell_rna']:
            if context_valid_checkbox(analysis_type, body):
                invoker.add(ComoRNASeqGen(analysis_type=analysis_type))
                
        # Generate file:  CONTEXT_FOLDER/results/{CONTEXT_FOLDER}/ActiveGenes_CONTEXT_Merged.csv
        invoker.add(ComoDataMerging())

        invoker.add(ComoGenerateModelJSON())

        invoker.run()

        result_context_model = f"{invoker.getConf('contextDir')}/results/{invoker.getConf('contextName')}/{invoker.getConf('contextName')}_SpecificModel_{invoker.getAlgorithm()}.json"
        print(f"Context model at {result_context_model}")
        results = {
            "fileName": f"{invoker.getConf('contextName')}_SpecificModel",
            "context": body['contextName'],
            "files": [
                f"{result_context_model}",
                f"{invoker.getConf('contextDir')}/config_sheets/trnaseq_data_inputs_auto.xlsx",
                f"{invoker.getConf('contextDir')}/gene_info.csv",
                f"{invoker.getConf('contextDir')}/results/{invoker.getConf('contextName')}/ActiveGenes_{invoker.getConf('contextName')}_Merged.csv"
            ],
            "modelPath": result_context_model
            }

        # Save the zip file for future downloads of the results
        zip_result = ComoZipfile(f"{invoker.getConf('contextDir')}/results")
        zip_result.execute(results['files'])

        return results

@app.post('/pharmacokinetic/import')
def pbpk_import(file: UploadFile = File(...)):
    file_contents = file.file.read().decode('utf-8')
    json_dict = sbml_to_pbpk_json(file_contents)

    model = te.loadSBMLModel(file_contents)

    return json_dict

@app.post('/kinetic/export')
def kinetic_export(body: KineticExportBody):
    print(body)      
    if body.type == 'sbml':	
        print('Kinetic: Converting JSON data to SBML...')
        sbml_model_str = json_to_sbml(body.model)
        model = te.loadSBMLModel(sbml_model_str)
        with open(body.resultPath, 'w+') as json_file:
            json_file.write('')
                                                
        model.exportToSBML(body.resultPath)

    if body.type == 'json':
        print('Kinetic: Creating JSON file...')
        with open(body.resultPath, 'w+') as json_file:
            json.dump(body.model, json_file, indent=4)

    print(f'Kinetic: Model exported: {body.resultPath}')
    json_dict = {
      "path": body.resultPath
    }
    return json_dict

@app.post('/kinetic/import')
async def kinetic_import(file: UploadFile = File(...), file_type: str = Form(...), result_path: str = Form(...)):
    print(f"Loading SBML file ({file_type}): {file.filename}...")

    file_content = await file.read()
    sbml_doc = libsbml.readSBMLFromString(file_content.decode('utf-8'))

    print(f"Converting SBML content to JSON content...")
    output = util_sbml_to_json(sbml_doc)
    
    if not os.path.exists("/uploads/imports"):
        os.makedirs("/uploads/imports", exist_ok=True) 
    
    with open(result_path, 'w') as json_file:
        json_file.write(output)

    json_dict = {
       "message": f"Result at {result_path}"
    }

    return json_dict


@app.post('/metabolic/import')
async def metabolic_import(file: UploadFile = File(...), file_type: str = Form(...), output_type: str = Form(...), result_path: str = Form(...)):
    print(f"Loading SBML file ({file_type}): {file.filename}...")

    file_content = await file.read()

    model = None

    if file_type == "sbml":
        doc = libsbml.readSBMLFromString(file_content.decode('utf-8'))
        model = util_sbml_to_json(doc)
    elif file_type == "json":
        model = cobra.io.from_json(file_content.decode('utf-8'))
    elif file_type == "yaml":
        model = cobra.io.from_yaml(file_content.decode('utf-8'))
    elif file_type == "matlab":
      with tempfile.NamedTemporaryFile() as f:
        f.write(file_content)
        model = cobra.io.load_matlab_model(f.name)
    else:
        raise TypeError(
            "Invalid input type %s for model type metabolic." % (file_type)
        )

    if model:
      if output_type == "sbml":
          json_data = json.loads(file)
          model = addKB(model, json_data)
          cobra.io.write_sbml_model(model, result_path)
      elif output_type == "json":
        return model
      elif output_type == "yaml":
          cobra.io.save_yaml_model(model, result_path)
      elif output_type == "matlab":
          cobra.io.save_matlab_model(model, result_path)
      else:
          raise TypeError(
              "Invalid output type %s for model type metabolic." % (output_type)
          )

    json_dict = {
       "message": f"Result at {result_path}"
    }

    return json_dict

@app.post('/export')
async def model_export(body: dict):
    
    output = None
    export_dir = None
    model_data = body["model_data"]
    output_type = body["output_type"]
    
    if body.get("export_dir"):
        export_dir = body["export_dir"]    

    model = cobra.io.from_json(model_data)
    model_data = json.loads(model_data)
    
    if output_type == "sbml":
        with tempfile.NamedTemporaryFile() as f:
          model = addKB(model, model_data)
          cobra.io.write_sbml_model(model, f.name)
          f.seek(0)
          bytes_ = f.read()
          output = safe_decode(bytes_)
    elif output_type == "json":
        with tempfile.NamedTemporaryFile() as f:
            cobra.io.save_json_model(model, f.name, allow_nan = True)
            f.seek(0)
            bytes_ = f.read()
            string = safe_decode(bytes_)

            dict_  = json.loads(string)

            output = json.dumps(dict_)
    elif output_type == "yaml":
        output	= cobra.io.to_yaml(model)
    elif output_type == "matlab":
        with tempfile.NamedTemporaryFile() as f:
            cobra.io.save_matlab_model(model, f.name)
            
            f.seek(0)
            bytes_ = f.read()

            output = safe_decode(bytes_)
    else:
          raise TypeError(
              "Invalid output type %s for model type metabolic." % (output_type)
          )

    result_dir = os.path.join(UPLOADS_EXPORTS_DIR, output_type) if export_dir is None else export_dir
    result_path = f"{result_dir}/{generate_hash()}.{output_type}"

    if not os.path.exists(result_dir):
        os.makedirs(result_dir, exist_ok=True)

    with open(result_path, 'w+') as f:
        f.write(output)

    return {
        "extension": output_type,
        "result_path": result_path
		}

@app.post('/kinetic/analyze')
async def kinetic_analyze(model_data: str = Form(...), input_type: str = Form(...), parameters: str = Form(...)):
      json_data = json.loads(model_data)
      parameters = json.loads(parameters or r"{}")

      timesteps = int(parameters.get("num_timesteps", 100))
      if input_type != "json":
          raise TypeError(
              "Invalid input type %s for model type kinetic." % (input_type)
          )

      sbml_model_str = json_to_sbml(json_data)
      model = te.loadSBMLModel(sbml_model_str)
      selections = ['time'] + model.getBoundarySpeciesIds() + model.getFloatingSpeciesIds()
      results = model.simulate(0, timesteps, 2*timesteps, selections)
      data = []
      if results.any():
          for result in results:
              for i, selection in enumerate(selections[1:], start=1):
                  data.append({ "time": result[0], "species": selection, "value": result[i] })

      return data

@app.post('/metabolic/analyze/drug')
async def metabolic_analyze(model_data: str = Form(...)):
      data: dict[str,str] = perform_diff_gene(model_data)
      return data

@app.post('/metabolic/analyze/drug_solver')
async def metabolic_analyze(model_data: str = Form(...)):
      data: dict[str,str] = perform_scores(model_data)
      return data

@app.post('/metabolic/analyze/gimme')
async def metabolic_analyze(model_data: str = Form(...)):
      model = None
      model = cobra.io.from_json(model_data)
      m_gimme = analyse("gimme", model)
      output = json.dumps({"reactions": m_gimme})
      return output

@app.post('/metabolic/analyze/imat')
async def metabolic_analyze(model_data: str = Form(...)):
      model = None
      geneKnockOuts = [ ]
      objective			= [ ]
      geneKnockOuts_ = [ ]
      model_json = json.loads(model_data)
      objective = model_json.get("objective", objective)
      geneKnockOuts = list(map(lambda g: g["id"], filter(lambda x: x.get("knockOut"), model_json["genes"])))
      model = cobra.io.from_json(model_data)
      if objective:
          model.objective = objective
      if geneKnockOuts:
          for gene in model.genes:
              if gene.id in geneKnockOuts:
                  gene.knock_out()
      if model:
        solution = model.optimize()
        data     = dict(
            geneKnockOuts_ = geneKnockOuts_,
            geneKnockouts = geneKnockOuts,
            objective_value = solution.objective_value,
            status = solution.status,
            fluxes = solution.fluxes.to_dict(),
            show_prices = solution.shadow_prices.to_dict()
        )
      
      return json.dumps(data)

@app.post('/metabolic/analyze/gfba')
async def metabolic_analyze(model_data: str = Form(...)):
      model = None
      geneKnockOuts = [ ]
      objective			= [ ]

      model_json = json.loads(model_data)
      objective = model_json.get("objective", objective)
      geneKnockOuts = list(map(lambda g: g["id"], filter(lambda x: x.get("knockOut"), model_json["genes"])))
      model = cobra.io.from_json(model_data)
      if objective:
          model.objective = objective
      if geneKnockOuts:
          for gene in model.genes:
              if gene.id in geneKnockOuts:
                  gene.knock_out()
      if model:
        solution = model.optimize()
        solution = cobra.flux_analysis.geometric_fba(model)
        data     = dict(
                        objective_value = solution.objective_value,
                        status = solution.status,
                        fluxes = solution.fluxes.to_dict(),
                        show_prices = solution.shadow_prices.to_dict()
                    )
      
      return json.dumps(data)

@app.post('/metabolic/analyze/pfba')
async def metabolic_analyze(model_data: str = Form(...)):
      model = None
      geneKnockOuts = [ ]
      objective			= [ ]

      model_json = json.loads(model_data)
      objective = model_json.get("objective", objective)
      geneKnockOuts = list(map(lambda g: g["id"], filter(lambda x: x.get("knockOut"), model_json["genes"])))
      model = cobra.io.from_json(model_data)
      if objective:
          model.objective = objective
      if geneKnockOuts:
          for gene in model.genes:
              if gene.id in geneKnockOuts:
                  gene.knock_out()
      if model:
        solution = model.optimize()
        solution = cobra.flux_analysis.pfba(model)
        data     = dict(
                        objective_value = solution.objective_value,
                        status = solution.status,
                        fluxes = solution.fluxes.to_dict(),
                        show_prices = solution.shadow_prices.to_dict()
                    )
      
      return json.dumps(data)


@app.post('/metabolic/analyze/fba')
async def metabolic_analyze(model_data: str = Form(...)):
      model = None
      geneKnockOuts = [ ]
      objective			= [ ]
      geneKnockOuts_ = [ ]

      model_json = json.loads(model_data)
      objective = model_json.get("objective", objective)
      geneKnockOuts = list(map(lambda g: g["id"], filter(lambda x: x.get("knockOut"), model_json["genes"])))
      model = cobra.io.from_json(model_data)
      if objective:
          model.objective = objective
      if geneKnockOuts:
          for gene in model.genes:
              if gene.id in geneKnockOuts:
                  gene.knock_out()
      if model:
        solution = model.optimize()
        data     = dict(
            geneKnockOuts_ = geneKnockOuts_,
            geneKnockouts = geneKnockOuts,
            objective_value = solution.objective_value,
            status = solution.status,
            fluxes = solution.fluxes.to_dict(),
            show_prices = solution.shadow_prices.to_dict()
        )
     

@app.post('/metabolic/analyze/fva')
async def metabolic_analyze(model_data: str = Form(...)):
      model = None
      geneKnockOuts = [ ]
      objective			= [ ]

      model_json = json.loads(model_data)
      objective = model_json.get("objective", objective)
      geneKnockOuts = list(map(lambda g: g["id"], filter(lambda x: x.get("knockOut"), model_json["genes"])))
      model = cobra.io.from_json(model_data)
      if objective:
          model.objective = objective
      if geneKnockOuts:
          for gene in model.genes:
              if gene.id in geneKnockOuts:
                  gene.knock_out()
      if model:
        parameters = json.loads(parameters or r"{}")

        params = dict()

        if "optimum" in parameters:
            params["fraction_of_optimum"] = parameters.get("optimum")

        solution = cobra.flux_analysis.flux_variability_analysis(model, model.reactions, **params)
        data = solution.to_dict()
      
      return json.dumps(data)


@app.post('/drug/perform-solver')
def drug_perform_solver(jsonReq: DrugSolverBody):
    print('Performin Drug Identification JSON: \n', jsonReq)		
    return perform_scores(jsonReq)