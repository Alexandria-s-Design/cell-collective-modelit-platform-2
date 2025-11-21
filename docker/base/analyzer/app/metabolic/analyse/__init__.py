from .context.imat import init_context_imat
from .context.gimme import init_context_gimme
from .context.fastcore import init_context_fastcore

def analyse(type_, kwargs):
    if type_ == "gimme":
        return init_context_gimme(kwargs)
    elif type_ == "imat":
        return init_context_imat(kwargs)
    elif type_ == "fcore":
        return init_context_fastcore(kwargs)
    else:
        raise ValueError("Incorrect analysis type %s" % type_)