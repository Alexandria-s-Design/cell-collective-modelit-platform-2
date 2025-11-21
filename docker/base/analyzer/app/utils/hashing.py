import hashlib
import uuid

def generate_hash(string=None, hash_type="sha1"):    
    string = string if string else str(uuid.uuid4())    
    algo = hashlib.new(hash_type)
    algo.update(string.encode('utf-8'))    
    digest = algo.hexdigest()    
    return digest