import libsbml
import pint
import numpy as np
from libsbml import SBMLDocument, readSBMLFromFile, parseL3Formula, writeSBMLToString, readSBMLFromString
from collections import defaultdict


UREG = pint.UnitRegistry()


def create_default_unit_definitions(model) -> dict:
    quantity_dict = dict() 

    for scale, prefix in enumerate(["", "mili", "micro", "nano", "pico", "femto", "atto"]):
        for kind in ["molar", "molar per second"]:
            # Create molar
            unit_definition = model.createUnitDefinition()
            unit_definition.setId(f"{prefix}{'_'.join(kind.split(' '))}")
            unit_definition.setName(f"{prefix}{kind}")
            
            # Create mole unit
            unit = unit_definition.createUnit()
            unit.setKind(libsbml.UNIT_KIND_MOLE)
            unit.setMultiplier(1)
            unit.setExponent(1)
            unit.setScale(-3*scale)

            # Create litre unit
            unit = unit_definition.createUnit()
            unit.setKind(libsbml.UNIT_KIND_LITRE)
            unit.setMultiplier(1)
            unit.setExponent(-1)
            unit.setScale(0)

            quantity = 1 * 10**(-3*scale) * UREG.mole / UREG.litre

            quantity_dict[f"{prefix}{kind}"] = quantity

            if kind == "molar per second":
                # Create second unit
                unit = unit_definition.createUnit()
                unit.setKind(libsbml.UNIT_KIND_SECOND)
                unit.setMultiplier(1)
                unit.setExponent(-1)
                unit.setScale(0)

                quantity_dict[f"{prefix}{kind}"] = quantity / UREG.second
    
    for name in ["second^-1", "dimensionless"]:
        unit_definition = model.createUnitDefinition()
        if name == "second^-1":
            unit_definition.setId("per_second")
        else:
            unit_definition.setId(f"{name}")
        unit_definition.setName(f"{name}")
        
        if name == "second^-1":
            unit = unit_definition.createUnit()
            unit.setKind(libsbml.UNIT_KIND_SECOND)
            unit.setMultiplier(1)
            unit.setExponent(-1)
            unit.setScale(0)
        elif name == "dimensionless":
            unit = unit_definition.createUnit()
            unit.setKind(libsbml.UNIT_KIND_DIMENSIONLESS)

    return quantity_dict

def json_to_sbml(json_dict: dict) -> SBMLDocument:
    # Create a new SBML document
    doc = SBMLDocument(2, 4)

    # Create a new model and set its id and name
    model = doc.createModel()
    model.setId(json_dict["id"])
    model.setName(json_dict["name"])
    
    model_references = json_dict.get("modelReferences")
    
    # parse notes
    def parse_notes(references):
      value = ','.join(references)
      xmlNode = "<body xmlns='http://www.w3.org/1999/xhtml'><p>references: " +  value + "</p></body>"
      return xmlNode
    # parse text and notes
    def parse_text_and_notes(text,references):
      value = ','.join(references)
      xmlNode = "<body xmlns='http://www.w3.org/1999/xhtml'><p>"+ text + ":"+  value + "</p></body>"
      return xmlNode    
    
    # create model references    
    if model_references:
      xmlNode = parse_notes(model_references)
      if xmlNode:
        model.setNotes(xmlNode)
    
    # create content entity references
    def create_content_entity_notes(contentReferences, entity):
      if contentReferences:
        for contentRef in contentReferences:
          references = contentRef.get("references")
          text = contentRef.get("text")
          if text and references:
            value = ','.join(references)
            xmlNode = "<body xmlns='http://www.w3.org/1999/xhtml'><p><contentrefs><content>"+ text + "</content><refs>"+  value + "</refs></contentrefs></p></body>"
            if xmlNode:
              entity.appendNotes(xmlNode)
          elif text:
            xmlNode = "<body xmlns='http://www.w3.org/1999/xhtml'><p><contentrefs><content>"+ text + "</content></contentrefs></p></body>"
            if xmlNode:
              entity.appendNotes(xmlNode)
  
    # create page entity references
    def create_entity_notes(entity_dict, entity):
      references = entity_dict.get("references")
      text = entity_dict.get("text")
      if text and references:
        xmlNode = parse_text_and_notes(text, references)
        if xmlNode:
          entity.appendNotes(xmlNode)        
      elif references:
        xmlNode = parse_text_and_notes("pageReferences", references)
        if xmlNode:
          entity.appendNotes(xmlNode)
      elif text:
        xmlNode = "<body xmlns='http://www.w3.org/1999/xhtml'><p>"+ text + "</p></body>"
        if xmlNode:
          entity.appendNotes(xmlNode)


    # Create default unit definitions
    unit_to_quantity = create_default_unit_definitions(model)

    # Create compartments
    for compartment_dict in json_dict["compartments"]:
        compartment = model.createCompartment()       
        if json_dict.get("export") == "sbml":
            compartment.setId(compartment_dict["name"])
            compartment.setName(compartment_dict["name"])
        else:
            compartment.setId(compartment_dict["name"])
            
        compartment.setSize(compartment_dict.get("size", 1))
        # compartment.setConstant(True)

    # Create species
    for species_dict in json_dict["species"]:
        species = model.createSpecies()
        species.initDefaults()
        species.setId(species_dict["species_id"])
        species.setName(species_dict["name"])
        
        if species_dict.get("contentReferences"):
          create_content_entity_notes(species_dict.get("contentReferences"), species)
          
        if species_dict.get("pageReferences"):
          create_entity_notes(species_dict.get("pageReferences"), species)
          
        initial_concentration = float(species_dict["initial_concentration"]) 
        species_unit = str(species_dict.get("unit", "molar"))
        if species_unit in unit_to_quantity:
            initial_concentration = (initial_concentration * unit_to_quantity[species_unit]).magnitude 
            species_unit = "molar"
        
        ic = species.setInitialConcentration(initial_concentration)
        name = species_dict["compartment"]
        
        species.setCompartment(name)
        species.setSubstanceUnits(species_unit)
        
		# Create global parameters
    for parameter_dict in json_dict.get("parameters", []):
       parameter = model.createParameter()
       parameter.setId(parameter_dict["id"])
       parameter.setName(parameter_dict.get("name", parameter_dict["id"]))
       value = float(parameter_dict["value"])
       unit = str(parameter_dict.get("unit", "dimensionless"))
       if unit in unit_to_quantity:
           value = (value * unit_to_quantity[unit]).magnitude
       parameter.setValue(value)
       parameter.setUnits("_".join(unit.split(' ')))

    # Create reactions
    for reaction_dict in json_dict["reactions"]:
        reaction = model.createReaction()
        reaction.setId(reaction_dict["reaction_id"])
        reaction.setName(reaction_dict["name"])

        # Create reactants
        for reactant in reaction_dict["reactants"]:
            species_ref = reaction.createReactant()
            species_ref.setSpecies(reactant['species_id'])
            
            # Retrieve Stoichiometry
            stoichiometry_value = reactant.get('stoichiometry', -1)
            stoichiometry_value = int(stoichiometry_value) if stoichiometry_value is not None else -1
            species_ref.setStoichiometry(stoichiometry_value)

        # Create products
        for product in reaction_dict["products"]:
            species_ref = reaction.createProduct()
            species_ref.setSpecies(product['species_id'])
                   
            # Retrieve Stoichiometry
            stoichiometry_value = product.get('stoichiometry', 1)
            stoichiometry_value = int(stoichiometry_value) if stoichiometry_value is not None else 1
            species_ref.setStoichiometry(stoichiometry_value)
            
        # Create kinetic law
        kinetic_law = reaction.createKineticLaw()
        math_ast = parseL3Formula(reaction_dict["kinetic_law"]["formula"])  # K1*mA^n * (1 - Gamma/Keq)
        kinetic_law.setMath(math_ast)
        if law_type := reaction_dict["kinetic_law"].get("type"):
            kinetic_law.setAnnotation(f"<type>{law_type}</type>")

        # Create local parameters
        for parameter_dict in reaction_dict["kinetic_law"]["parameters"]:
            parameter = kinetic_law.createParameter()
            parameter.setId(parameter_dict["id"])
            value = float(parameter_dict["value"])
            unit = str(parameter_dict["unit"])
            if unit == "second^-1":
                unit = "per second"

            if unit in unit_to_quantity:
                value = (value * unit_to_quantity[unit]).magnitude 

            parameter.setValue(float(parameter_dict["value"]))
            parameter.setUnits("_".join(unit.split(' ')))

    # Convert the SBML document to a string and return it
    return writeSBMLToString(doc)

def convert_json_to_sbml(json_content):
    """
    Convert JSON content to SBML and return as a string.
    """
    # Create an SBML document
    document = libsbml.SBMLDocument(2, 4)
    model = document.createModel()
    model.setId(json_content.get("id", "default_model"))
    model.setName(json_content.get("name", "Default Model"))
		

    # Add compartments
    for compartment in json_content.get("compartments", []):
        comp = model.createCompartment()
        comp.setId(compartment["name"])
        comp.setName(compartment["name"])

    # Add species
    for species in json_content.get("species", []):
        sp = model.createSpecies()
        sp.setId(species["species_id"])
        sp.setName(species["name"])
        sp.setCompartment(species["compartment"])
        sp.setInitialConcentration(species.get("initial_concentration", 0.0))

    # Add global parameters
    for parameter in json_content.get("parameters", []):
        param = model.createParameter()
        param.setId(parameter["id"])
        param.setValue(parameter.get("value", 0.0))
        param.setConstant(True)

    # Add reactions
    for reaction in json_content.get("reactions", []):
        reac = model.createReaction()
        reac.setId(reaction["reaction_id"])
        reac.setName(reaction["name"])

        # Add reactants
        for reactant in reaction.get("reactants", []):
            if "species_id" in reactant:
                species_ref = reac.createReactant()
                species_ref.setSpecies(reactant["species_id"])

        # Add products
        for product in reaction.get("products", []):
            if "species_id" in product:
                species_ref = reac.createProduct()
                species_ref.setSpecies(product["species_id"])

        # Add kinetic law
        if "kinetic_law" in reaction:
            kinetic_law = reac.createKineticLaw()
            formula = reaction["kinetic_law"].get("formula", "")
            kinetic_law.setMath(libsbml.parseL3Formula(formula))
            for param in reaction["kinetic_law"].get("parameters", []):
                parameter = kinetic_law.createParameter()
                parameter.setId(param["id"])
                parameter.setValue(param.get("value", 0.0))

    # Write SBML to string
    sbml_string = libsbml.writeSBMLToString(document)
    return sbml_string

def sbml_to_pbpk_json(sbml_str: str):
    sbml_doc = readSBMLFromString(sbml_str) 
    json_dict = {}
    model = sbml_doc.getModel()

    compartments = []
    parameters = []

    json_dict['name'] = model.getName()
    
    # Add the list of compartments to the dictionary
    for compartment in model.getListOfCompartments():
        compartments.append({
            "id": compartment.getId(),
            "name": compartment.getName(),
        })
        parameters.append({
            "name": f"V{compartment.getName()}",
            "type": "volume",
            "value": compartment.getSize(),
            "compartment": compartment.getName()
        })
    
    # Add the list of species to the dictionary
    species = {} 
    for sp in model.getListOfSpecies():
        species[sp.getId()] = sp.getCompartment()
    
    # Add the list of reactions to the dictionary
    reactions = []
    for reaction in model.getListOfReactions():
        reactant = next(species[sr.getSpecies()] for sr in reaction.getListOfReactants())
        product = next(species[sr.getSpecies()] for sr in reaction.getListOfProducts())

        kinetic_law = reaction.getKineticLaw()
        formula = kinetic_law.getFormula()
        local_parameters = []
        for parameter in kinetic_law.getListOfParameters():
            local_parameters.append({"id": parameter.getId(), "value": parameter.getValue()})

        reactions.append({
            "id": reaction.getId(),
            "name": reaction.getName(),
            "from_compartment": reactant,
            "to_compartment": product, 
            "formula": formula 
        })
        parameters.append({
            "name": f"Fraction{reaction.getName()}",
            "type": "fraction",
            "value": 1,
            "rate": reaction.getName()
        })
        parameters.append({
            "name": f"K{reaction.getName()}",
            "type": "K",
            "value": 1,
            "value_type": "inst",
            "rate": reaction.getName()
        })
    
    json_dict["compartments"] = compartments
    json_dict["parameters"] = parameters
    json_dict["rates"] = reactions

    print(json_dict)
    return json_dict 


def population_distribution_str(distribution: dict) -> str:
    if distribution['type'] == 'normal':
        mean = next(filter(lambda x: x['name'] == 'mean', distribution['parameters']))['value']
        std = next(filter(lambda x: x['name'] == 'sd', distribution['parameters']))['value']
        return f'normal({mean}, {std})'
    elif distribution['type'] == 'uniform':
        min_ = next(filter(lambda x: x['name'] == 'min', distribution['parameters']))['value']
        max_ = next(filter(lambda x: x['name'] == 'max', distribution['parameters']))['value']
        return f'uniform({min_}, {max_})'
    elif distribution['type'] == 'lognormal':
        mean = next(filter(lambda x: x['name'] == 'mean', distribution['parameters']))['value']
        std = next(filter(lambda x: x['name'] == 'sd', distribution['parameters']))['value']
        return f'lognormal({mean}, {std})'


def variability_distribution_str(value: str, distribution: dict) -> str:
    if distribution['type'] == 'normal':
        std = distribution['parameters'][0]['value']
        value = f'normal({value}, {std})'
    elif distribution['type'] == 'lognormal':
        std = distribution['parameters'][0]['value']
        value = f'lognormal({value}, {std})'
    return value


def covariate_function_str(value: str, function: dict, extra_args: list = []) -> str:
    if function['type'] == 'allometry':
        return f'power({value}, 0.75)'
    elif function['type'] == 'power':
        theta = function["parameters"][0]["value"]
        return f'power({value}, {theta})'
    elif function['type'] == 'linear':
        return f'linear({value}, 1, 0)'
    elif function['type'] == 'exponential':
        coeff = function["parameters"][0]["value"]
        return f'{coeff} * exp({value})'


def json_to_pbpk_antimony(model_json: dict, simulation_length: int = 100):

    map_rate_id_to_param = defaultdict(list)
    map_compartment_id_to_param = defaultdict(list) 
    map_param_id_to_covariates = defaultdict(list)

    map_param_id_to_dosing = {}
    map_param_id_to_variability = {}
    parameter_init_lines = []
    event_lines = []
    occassions = []

    for population_attr in model_json.get('populations', []):
        # TODO: refactor to use match
        # TODO: implement all population attributes
        attr_type = population_attr.get('type', '')
        if attr_type == 'body-weight':
            distribution = next(filter(lambda x: x['id'] == population_attr['distributionId'], model_json['distributions']))
            dist_str = population_distribution_str(distribution)
            parameter_init_lines.append(
                f'bodyWeight = {dist_str};'
            )
        elif attr_type == 'age':
            distribution = next(filter(lambda x: x['id'] == population_attr['distributionId'], model_json['distributions']))
            dist_str = population_distribution_str(distribution)
            parameter_init_lines.append(
                f'age = {dist_str};'
            )
        elif attr_type == 'creatine':
            distribution = next(filter(lambda x: x['id'] == population_attr['distributionId'], model_json['distributions']))
            dist_str = population_distribution_str(distribution)
            parameter_init_lines.append(
                f'creatine = {dist_str};'
            )

    for variability in model_json.get('variabilities', []):
        map_param_id_to_variability[variability['parameterId']] = variability

    for covariate in model_json.get('covariates', []):
        map_param_id_to_covariates[covariate['parameterId']].append(covariate)
    
    for parameter in model_json['parameters']:
        if compartment_id := parameter.get('compartmentId'):
            map_compartment_id_to_param[compartment_id].append(parameter)
        if rate_id := parameter.get('rateId'):
            map_rate_id_to_param[rate_id].append(parameter)
        
        if parameter['type'] == 'dosing':
            continue
        
        name = parameter['name']
        value = parameter['value']
        if parameter['type'] == 'K' and parameter.get('value_type') == 'inst':
            value = 35  # FIXME: this is wrong, use events instead
        
        if parameter['type'] == 'K' or parameter['type'] == 'volume':
            if variability := map_param_id_to_variability.get(parameter['id']):
                distribution = next(filter(lambda x: x['id'] == variability['distributionId'], model_json['distributions']))
                if variability['type'] == 'ind':
                    value = variability_distribution_str(value, distribution)
                    print(value)
                elif variability['type'] == 'occ':
                    occassions.append((name, variability_distribution_str(value, distribution)))
            
            for covariate in map_param_id_to_covariates.get(parameter['id'], []):
                function = next(filter(lambda x: x['id'] == covariate['functionId'], model_json.get('functions', [])))
                # TODO: implement all covariates
                if covariate['type'] == 'body-weight':
                    function_str = covariate_function_str('bodyWeight', function) 
                elif covariate['type'] == 'age':
                    function_str = covariate_function_str('age', function) 
                elif covariate['type'] == 'creatine':
                    function_str = covariate_function_str('creatine', function) 
                value = f'{value} * {function_str}'

            
            parameter_init_lines.append(
                f'{name} = {value};'
            )

    for dosing in model_json['dosings']:
        map_param_id_to_dosing[dosing['parameterId']] = dosing
    
    compartment_lines = []
    compartment_init_lines = []
    species_lines = []
    species_init_lines = []

    
    map_id_to_compartment = {}
    for compartment in model_json['compartments']:
        name = compartment['name']
        map_id_to_compartment[compartment['id']] = compartment

        compartment_params = map_compartment_id_to_param[compartment['id']]

        compartment_volume = next(filter(lambda x: x['type'] == 'volume', compartment_params))
        if compartment['type'] == 'ext' and compartment.get('extType') == 'in':
            compartment_dosing_param = next(filter(lambda x: x['type'] == 'dosing', compartment_params)) 
            compartment_dosing = map_param_id_to_dosing[compartment_dosing_param['id']]
            if compartment_dosing['type'] == 'single':
                if compartment_dosing['route'] == 'od':
                    event_lines.append(
                        f'at (time > 0.001): mg{name} = {compartment_dosing["amount"]};'
                    )
                elif compartment_dosing['route'] == 'iv':
                    duration = int(compartment_dosing['duration'])
                    times = np.arange(0.001, duration, 0.5)
                    dose = float(compartment_dosing['amount']) / len(times) 
                    for i in times:
                        event_lines.append(
                            f'at (time > {i}): mg{name} = mg{name} + {dose}'
                        )

            elif compartment_dosing['type'] == 'multiple':
                print(occassions)
                interval = float(compartment_dosing['interval'])
                times = np.arange(0.001, simulation_length, interval)
                if compartment_dosing['route'] == 'od':
                    for i in times:
                        # resample parameters at occassion
                        for param, val in occassions:
                            event_lines.append(
                                f'at (time > {i}): {param} = {val};'
                            )
                        event_lines.append(
                            f'at (time > {i}): mg{name} = {compartment_dosing["amount"]};'
                        )

                elif compartment_dosing['route'] == 'iv':
                    for i in times:
                        # resample parameters at occassion
                        for param, val in occassions:
                            event_lines.append(
                                f'at (time > {i}): {param} = {val};'
                            )
                        duration = int(compartment_dosing['duration'])
                        iv_times = np.arange(i, i + duration, 0.5)  # FIXME: this should probably be simulation step size
                        dose = float(compartment_dosing['amount']) / len(iv_times) 
                        for i in iv_times:
                            event_lines.append(
                                f'at (time > {i}): mg{name} = mg{name} + {dose};'
                            )
            elif compartment_dosing['type'] == 'custom':
                pass

        compartment_lines.append(
            f'compartment {name};'
        )
        compartment_init_lines.append(
            f'{name} = {compartment_volume["value"]};'
        )
        species_lines.append(
            f'species mg{name} in {name};'
        )
        species_init_lines.append(
            f'mg{name} = 0;'
        )
    
    print(compartment_lines)
    print(compartment_init_lines)
    print(species_lines)
    print(species_init_lines)
    print(parameter_init_lines)
    print(event_lines)

    reaction_lines = []
    for i, rate in enumerate(model_json['rates']):
        from_compartment_name = map_id_to_compartment[rate['fromCompartmentId']]['name']
        to_compartment_name = map_id_to_compartment[rate['toCompartmentId']]['name']

        rate_params = map_rate_id_to_param[rate['id']]
        rate_K = next(filter(lambda x: x['type'] == 'K', rate_params))
        rate_fraction = next(filter(lambda x: x['type'] == 'fraction', rate_params))

        rate_formula = f'{rate_K["name"]} * {from_compartment_name}'
        if rate_K['value_type'] == 'zero':
            rate_formula = f'{rate_K["value"]}'
        elif rate_K['value_type'] == 'mm':
            pass

        reaction_lines.append(
            f'R{i}: mg{from_compartment_name} -> mg{to_compartment_name}; {rate_formula};'
        ) 
        event_lines.append(
            f'at (mg{from_compartment_name} < 0.001): {rate_K["name"]} = 0, mg{from_compartment_name} = 0;'
        )
    
    print(reaction_lines)

    
    return f"""
    // Created by libAntimony v2.12.0
    function linear(x, a, b)
        a * x + b
    end

    function michaelis_menten(x, Vmax, Km)
        Vmax * x / (Km + x)
    end

    model testing()

        // Compartments and Species:
        {" ".join(compartment_lines)}

        {" ".join(species_lines)}

        // Reactions:
        {" ".join(reaction_lines)}

        // Species initializations:
        {" ".join(species_init_lines)}

        // Compartment initializations:
        {" ".join(compartment_init_lines)}

        // Variable initializations:
        {" ".join(parameter_init_lines)}

        // Other declarations:

        // Unit definitions:
        unit substance = 1e-6 mole;
        unit time_unit = 60 second;
        unit volume = 1e-3 litre;

        // Display Names:
        substance is "Mole";
        time_unit is "Minute";
        volume is "Liter";

        // Events:
        {" ".join(event_lines)}
    end
    """
