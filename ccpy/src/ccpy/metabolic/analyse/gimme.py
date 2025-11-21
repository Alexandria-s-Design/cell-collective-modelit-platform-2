import re

from ccpy._compat import iteritems

import numpy as np

from cobra.util.solver import linear_reaction_coefficients
from cobra.util import create_stoichiometric_matrix

from troppo.methods.reconstruction.gimme import GIMME, GIMMEProperties
from troppo.methods.reconstruction.imat import IMAT, IMATProperties

BOOL_TO_ALG_OP = { "and": min, "or": max }

def is_operator(o):
    return o in ("and", "or", "not")

def stack_top(o):
    return o[-1] if o else None

def infix_to_postfix(expr):
    # https://en.wikipedia.org/wiki/Shunting-yard_algorithm
    tokens      = re.findall("[0-9]+|\(|\)|and|or|not", expr)

    output      = [ ] # output queue
    operator    = [ ] # operator stack

    def pop_push():
        if operator:
            o = operator.pop()
            output.append(o)

    while tokens:
        token = tokens.pop(0)
        
        if token.isdigit():
            output.append(token)
        elif is_operator(token):
            while is_operator(stack_top(operator)) and (True or (True and True)) and stack_top(operator) != "(":
                pop_push()
            operator.append(token)
        elif token == "(":
            operator.append(token)
        elif token == ")":
            while stack_top(operator) != "(":
                pop_push()
            if stack_top(operator) == "(":
                operator.pop()

    while operator:
        pop_push()

    return output

def evaluate_postfix(postfix):
    stack = [ ]

    for token in postfix:
        if token.isdigit():
            stack.append(int(token))
        elif is_operator(token):
            a = stack.pop()
            b = stack.pop()

            o = BOOL_TO_ALG_OP[token]

            value = o(a, b)

            stack.append(value)

    return stack_top(stack)

def evaluate_grr(expr):
    postfix = infix_to_postfix(expr)
    value   = evaluate_postfix(postfix)
    return value

def gene_to_reaction_expr(model):
    expr_vector = dict()

    for reaction in model.reactions:
        gene_reaction_rule = reaction.gene_reaction_rule
        expr_vector[reaction.id] = -1

        if gene_reaction_rule:
            gene_reaction_rule_value = gene_reaction_rule

            for gene in reaction.genes:
                value = gene._m_expr
                gene_reaction_rule_value = gene_reaction_rule_value.replace(gene.id, str(gene._m_expr))

            expr_value = evaluate_grr(gene_reaction_rule_value)

            expr_vector[reaction.id] = expr_value

    return expr_vector

def get_model_bounds(model):
    lb, ub = list(zip(*[(r.lower_bound, r.upper_bound) for r in model.reactions]))
    return lb, ub

def get_model_objectives(model):
    objectives = linear_reaction_coefficients(model)
    o = { }

    for r, c in iteritems(objectives):
        index = model.reactions.index(r.id)
        o[index] = c

    return o

def get_model_prop(model):
    lb, ub = get_model_bounds(model)
    matrix = create_stoichiometric_matrix(model)

    expr_vector = gene_to_reaction_expr(model)

    objectives = get_model_objectives(model)

    return { "lb": lb, "ub": ub, "matrix": matrix, "objectives": objectives, "expr_vector": expr_vector }

def gimme(model):
    params = get_model_prop(model)
    lb, ub, matrix, objectives = params["lb"], params["ub"], params["matrix"], params["objectives"]

    expr_vector = params["expr_vector"]

    properties  = GIMMEProperties(
        exp_vector = np.array(list(expr_vector.values())),
        objectives = [ objectives ],
        preprocess = True,
        obj_frac = 0.8,
        flux_threshold = 0.8
    )
    algorithm   = GIMME(matrix, lb, ub, properties)

    solution    = algorithm.run()

    ids         = [ ]

    for i, value in enumerate(solution):
        if value:
            reaction = model.reactions[i]
            ids.append(reaction.id)

    return ids