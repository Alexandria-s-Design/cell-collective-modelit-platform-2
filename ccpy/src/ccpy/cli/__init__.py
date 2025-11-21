# imports - module imports
from ccpy.cli.util   import *
from ccpy.cli.parser import get_args
from ccpy.util._dict import merge_dict
from ccpy.util.types import get_function_arguments

def command(fn):
    args    = get_args()
    
    params  = get_function_arguments(fn)

    params  = merge_dict(params, args)
    
    def wrapper(*args, **kwargs):
        return fn(**params)

    return wrapper