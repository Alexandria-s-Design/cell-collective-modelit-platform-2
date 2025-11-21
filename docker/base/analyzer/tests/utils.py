import os
import json
from enum import Enum

class ContentType(Enum):
	TEXT = 'TEXT'
	JSON = 'JSON'

def get_fixture_content(fixt_fname: str, rtype: ContentType = 'TEXT'):
	fixt_path = os.path.join(os.path.dirname(__file__), 'fixtures', fixt_fname)
	
	if not os.path.exists(fixt_path):
		raise ValueError('Suite test error occurred while looking for the Fixture file.')
	
	fixt_content = ''
	with open(fixt_path, 'r') as f:
		fixt_content = f.read()
	
	if (rtype == ContentType.JSON.value):
		return json.loads(fixt_content)
	
	return fixt_content



