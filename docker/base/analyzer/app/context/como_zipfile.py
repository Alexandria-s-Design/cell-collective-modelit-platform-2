import zipfile
import os
from typing import List

class ComoZipfile:
		def __init__(self, dir_result):
			self.zip_result_path = dir_result
			self.result_name = "como_result.zip"

		def execute(self, files: List[str]):
			if not os.path.exists(self.zip_result_path):
				raise ValueError("Please define a valid directory for COMO results.")

			with zipfile.ZipFile(f"{self.zip_result_path}/{self.result_name}", 'w') as zip_ref:
				for file_path in files:
						zip_ref.write(file_path)