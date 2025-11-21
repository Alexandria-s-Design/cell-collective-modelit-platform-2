

def imat(model):
    params = get_model_prop(model)
    lb, ub, matrix = params["lb"], params["ub"], params["matrix"]

    expr_vector = params["expr_vector"]

    properties = IMATProperties(
        exp_vector = expr_vector
    )

    algorithm   = IMAT(matrix, lb, ub, properties)

    response    = dict()

    solution    = algorithm.run()

    import json
    return json.dumps(response)