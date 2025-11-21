import uuid
import string
    
def verify_param_value_within_route(url):
    param_value = url.rstrip('/').split('/')[-1]
    
    if param_value.isupper():
        return param_value
    
    try:
        uuid.UUID(param_value, version=4)
        return param_value
    except ValueError:
        pass
    
    if len(param_value) > 300:
        return param_value
    
    return None

def verify_valid_auth_route(url):
    return url.startswith('auth/')