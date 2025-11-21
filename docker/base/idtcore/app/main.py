import json
from fastapi import FastAPI, HTTPException, File, UploadFile, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core import initialize_folder
from .core.core_petridish import exec_simulation, load_json_file
from .req_params import RunSimulationRequest, GenerateConfigFileRequest
from .utils.http_response import HttpResponse
from .core.core_config_generator import ( main as main_generate_config_file )

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
    'message': "Welcome to the IDT Core API"
  }

@app.post('/simulation/run')
def run_simulation(body: RunSimulationRequest):
  print("Simulation Request: ", body)  
  exec = None
  result_dir = initialize_folder(body.input_dir)
  try:
    exec = exec_simulation(body, result_dir)
  except Exception as err:
    print("Failed to execute", err)
    return HttpResponse(f"{str(err)}", status.HTTP_400_BAD_REQUEST).toJSON()
  
  return HttpResponse({
    "result": exec.get("result"),
    "result_dir": result_dir,
    "result_content": load_json_file(exec.get("result"))
  }, status.HTTP_200_OK).toJSON()

@app.post('/generate/config')
def generate_config(body: GenerateConfigFileRequest):
  exec = None
  result_dir = initialize_folder(body.input_dir)
  try:
    exec = main_generate_config_file(body, result_dir)
  except Exception as err:
    return HttpResponse(f"{str(err)}", status.HTTP_400_BAD_REQUEST).toJSON()
  return HttpResponse({
    "result": exec.get("result"),
    "result_dir": result_dir
  }, status.HTTP_200_OK).toJSON()