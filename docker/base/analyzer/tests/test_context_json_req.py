import unittest
import os
import shutil
from utils import get_fixture_content
from app.schemas import ContextBody
from app.context.como_config import initialize_config


class TestContextJsonRequest(unittest.TestCase):
		@classmethod
		def tearDownClass(cls):
				# Remove tested directories
				shutil.rmtree(f"/uploads/context/test_666666_999999999", ignore_errors=True)

		def test_params(self):
			body: ContextBody = get_fixture_content('create_context_req.json', 'JSON')
			body['modelOriginId'] =  f"test_{body['modelOriginId']}"

			# Creating directories for test
			initialize_config(conf=body)

			valid_root_path = f"/uploads/context/{body['modelOriginId']}_{body['id']}"
			valid_directories = ['COMO_input','data_matrices','results']

			self.top_valid_root_path = valid_root_path

			for test_dir in valid_directories:
					# Test
					self.assertTrue(os.path.exists(f"{valid_root_path}/{test_dir}"))


if __name__ == '__main__':
		unittest.main()