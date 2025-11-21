import os.path as osp
from setuptools import setup, find_packages

# try:
#     from pip._internal.req import parse_requirements # pip 10
# except ImportError:
#     from pip.req import parse_requirements # pip 9

# A very awful patch for parse_requirements from pip
def parse_requirements(filename, session = None):
    class FakeRequirement:
        def __init__(self, name):
            self.req = name
            
    def sanitize_line(line):
        line = line.strip()
        return line

    def check_line(line):
        return line and not line.startswith("#")

    return [
        FakeRequirement(sanitize_line(line)) for line in open(filename) if check_line(line)
    ]

def _getattr(o, *attrs):
	for attr in attrs:
		try:
			return getattr(o, attr)
		except AttributeError:
			pass
	raise AttributeError

def get_dependencies(type_ = None):
    path         = osp.realpath("requirements.txt")
    requirements = [str(_getattr(ir, "req", "requirement")) for ir in parse_requirements(path, session = "hack")]
    return requirements

setup(
    name='translator',
    version='0.1.0',
    url='https://gitlab.com/unebraska/lagbh/modelit.git',
    author='ModelIt!',
    author_email='support@cellcollective.org',
    description='Translator for ModelIt!',
    packages=find_packages(where = "src"),
    package_dir={ "": "src" },
    install_requires=get_dependencies(),
    entry_points={
        'console_scripts': [
            'translator = translator.__main__:main'
        ]
    },
    include_package_data=True
)