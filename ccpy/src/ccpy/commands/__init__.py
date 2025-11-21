# imports - standard imports
import sys, os, os.path as osp
import re
import json
import multiprocessing as mp
from functools import partial
import tempfile

# imports - third-party imports
import cobra
import tellurium as te
import libsbml
from cobra.core.gene import parse_gpr
from cobra.flux_analysis import flux_variability_analysis
from libsbml import SBMLDocument, readSBMLFromFile, parseL3Formula, writeSBMLToString, writeSBMLToFile
from ccpy.util.sbml import restoreComparmentsAtCBM, addKB
import xml.etree.ElementTree as ET


# imports - module imports
from ccpy.util.system import environment
from ccpy.util.string import safe_decode
from ccpy import cli, log
from ccpy.metabolic.analyse import analyse
from ccpy.metabolic.analyse.drug_identification import perform_diff_gene
from ccpy.util.knockout.knock_out_simulation import main as drug_scores

logger = log.get_logger(level=log.DEBUG)


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



            if kind == "molar per second":
                # Create second unit
                unit = unit_definition.createUnit()
                unit.setKind(libsbml.UNIT_KIND_SECOND)
                unit.setMultiplier(1)
                unit.setExponent(-1)
                unit.setScale(0)


def sbml_to_json(doc: SBMLDocument) -> str:
    model = doc.getModel()

    # Create a dictionary to store the JSON representation of the model
    json_dict = {}

    # Add the model id and name to the dictionary
    json_dict["id"] = model.getId()
    json_dict["name"] = model.getName()

    def get_references_from_notes(notes):
      root = ET.fromstring(notes)
      text_content = ''.join(it.text.strip() for it in root.iter() if it.text is not None)
      model_references = ''.join(text_content.splitlines())
      return model_references
    
    def parse_xml(xml_string):
      root = ET.fromstring(xml_string)
      result = []

			# Define the namespace (as per the provided XML)
      ns = {'xhtml': 'http://www.w3.org/1999/xhtml'}

			# Iterate over all <p> elements
      for p in root.findall('.//xhtml:p', ns):
				# Check for <contentrefs> within the <p> tag
        content_ref = p.find('xhtml:contentrefs', ns)
        if content_ref is not None:
					# Extract content and refs from <contentrefs>
          content = content_ref.find('xhtml:content', ns).text
          refs_text = content_ref.find('xhtml:refs', ns).text if content_ref.find('xhtml:refs', ns) is not None else ''
          refs = [str(ref) for ref in refs_text.split(',')] if refs_text else []
          result.append({'text': content.strip(), 'references': refs})
        else:
					# Check if the text contains pageReferences
          text = p.text.strip() if p.text is not None else ''
          if 'pageReferences:' in text:
            refs_text = text.split('pageReferences:', 1)[1]
            refs = [str(ref) for ref in refs_text.split(',')] if refs_text else []
            result.append({'pageReferences': refs})
      return result
    
    # Add model references from model notes
    notes_xml = model.getNotesString()
    if notes_xml:
      json_dict["modelReferences"] = get_references_from_notes(notes_xml)

    # Add the list of compartments to the dictionary
    compartments = []
    for compartment in model.getListOfCompartments():
        compartments.append({"id": compartment.getId(), "name": compartment.getName(), "size": compartment.getSize()})
    json_dict["compartments"] = compartments

    # Add the list of species to the dictionary
    species = []
    for sp in model.getListOfSpecies():
        initial_concentration = sp.getInitialConcentration()
        if not sp.isSetInitialConcentration():
            compartment = next(filter(lambda c: c["id"] == sp.getCompartment(), json_dict["compartments"]))
            initial_concentration = sp.getInitialAmount() / compartment["size"]
        sp_notes_xml = sp.getNotesString()
        if sp_notes_xml:
          notes = parse_xml(sp_notes_xml)
          species.append({
							"id": sp.getId(),
							"name": sp.getName(),
							"compartment": sp.getCompartment(),
							"initial_concentration": initial_concentration,
							"unit": sp.getSubstanceUnits(),
							"notes": notes
						})
        else:
          species.append({
								"id": sp.getId(),
								"name": sp.getName(),
								"compartment": sp.getCompartment(),
								"initial_concentration": initial_concentration,
								"unit": sp.getSubstanceUnits()
						})
    json_dict["species"] = species

    # Add the list of reactions to the dictionary
    reactions = []
    for reaction in model.getListOfReactions():
        reactants = [{"species": sr.getSpecies(), "stoichiometry": sr.getStoichiometry()} for sr in reaction.getListOfReactants()]
        products = [{"species": sr.getSpecies(), "stoichiometry": sr.getStoichiometry()} for sr in reaction.getListOfProducts()]
        modifiers = [{"species": sr.getSpecies()} for sr in reaction.getListOfModifiers()]

        kinetic_law = reaction.getKineticLaw()
        kinetic_law_dict = {}
        local_parameters = []
        if kinetic_law != None:
          kinetic_law_dict = {"formula": kinetic_law.getFormula()}
            
          annotation_str = kinetic_law.getAnnotationString()
          if annotation_str:
              root = ET.fromstring(annotation_str)
              type_element = root.find(".//type")
              if type_element is not None:
                  kinetic_law_dict["type"] = int(type_element.text)
              else:
                  kinetic_law_dict["type"] = 1   

          for parameter in kinetic_law.getListOfParameters():
            unit = parameter.getUnits()
            sanitized_unit = " ".join(unit.split("_"))
            if sanitized_unit == "per second":
                sanitized_unit = "second^-1"
            local_parameters.append({
                "id": parameter.getId(),
                "value": parameter.getValue(),
                "unit": sanitized_unit 
            })
        kinetic_law_dict["parameters"] = local_parameters

        reactions.append({"id": reaction.getId(), "name": reaction.getName(), "reactants": reactants, "products": products, 
        "modifiers": modifiers, "kinetic_law": kinetic_law_dict})
    json_dict["reactions"] = reactions

    print(json_dict)
    # Return the JSON representation as a string
    return json.dumps(json_dict)


def json_to_sbml(json_dict: dict) -> SBMLDocument:
    # Create a new SBML document
    doc = SBMLDocument(2, 4)

    # Create a new model and set its id and name
    model = doc.createModel()
    model.setId(json_dict["id"])
    model.setName(json_dict["name"])

    # Create default unit definitions
    create_default_unit_definitions(model)

    # Create compartments
    for compartment_dict in json_dict["compartments"]:
        compartment = model.createCompartment()
        compartment.setId(compartment_dict["name"])
        compartment.setSize(compartment_dict.get("size", 1))
        # compartment.setConstant(True)

    # Create species
    for species_dict in json_dict["species"]:
        species = model.createSpecies()
        species.setId(species_dict["species_id"])
        species.setName(species_dict["name"])
        species.setInitialConcentration(float(species_dict["initial_concentration"]))
        species.setCompartment(str(species_dict["compartment"]))

        species_unit = str(species_dict["unit"])
        species.setSubstanceUnits(species_unit)

    # Create reactions
    for reaction_dict in json_dict["reactions"]:
        reaction = model.createReaction()
        reaction.setId(reaction_dict["reaction_id"])
        reaction.setName(reaction_dict["name"])

        # Create reactants
        for reactant in reaction_dict["reactants"]:
            species_ref = reaction.createReactant()
            species_ref.setSpecies(reactant)
            # species_ref.setStoichiometry(reactant_dict["stoichiometry"])

        # Create products
        for product in reaction_dict["products"]:
            species_ref = reaction.createProduct()
            species_ref.setSpecies(product)
            # species_ref.setStoichiometry(product_dict["stoichiometry"])

        # Create kinetic law
        kinetic_law = reaction.createKineticLaw()
        math_ast = parseL3Formula(reaction_dict["kinetic_law"]["formula"])  # K1*mA^n * (1 - Gamma/Keq)
        kinetic_law.setMath(math_ast)

        # Create local parameters
        for parameter_dict in reaction_dict["kinetic_law"]["parameters"]:
            parameter = kinetic_law.createParameter()
            parameter.setId(parameter_dict["id"])
            parameter.setValue(float(parameter_dict["value"]))
            parameter.setUnits("_".join(str(parameter_dict["unit"]).split(' ')))

    # Convert the SBML document to a string and return it
    return writeSBMLToString(doc)


def load_model(path):
    with open(path) as f:
        data = json.load(f)

    model = cobra.io.load_json_model(path)

    for gene in data["genes"]:
        g = model.genes.get_by_id(gene["id"])

        if "expression" in gene:
            g._m_expr = 0 if gene["expression"] else -1
        else:
            g._m_expr = -1

    return model


@cli.command
def command(
    action,
    input=None,
    input_type=None,
    model_type=None,
    output_type="json",
    analysis_type="fba",
    parameters=None,
    jobs=None,
    force=False,
    verbose=False,
    *args,
    **kwargs
):
    # if not verbose:
    #     logger.setLevel(log.NOTSET)

    logger.info("Environment: %s" % environment())
    logger.info("Arguments Passed: %s" % locals())

    logger.info("Using %s jobs..." % jobs)

    if action == "read":
        if model_type == "metabolic":
            model = None

            if input_type == "sbml":
                model = cobra.io.read_sbml_model(input, set_missing_bounds=True)
            elif input_type == "json":
                model = cobra.io.load_json_model(input)
            elif input_type == "yaml":
                model = cobra.io.load_yaml_model(input)
            elif input_type == "matlab":
                model = cobra.io.load_matlab_model(input)
            else:
                raise TypeError(
                    "Invalid input type %s for model type %s." % (input_type, model_type)
                )
            
            if model:
                output = None

                if output_type == "sbml":
                    with tempfile.NamedTemporaryFile() as f:
                        with open(input, "r") as fj:
                          data = json.load(fj)
                          model = addKB(model, data)
                        cobra.io.write_sbml_model(model, f.name)
                        f.seek(0)
                        bytes_ = f.read()

                        output = safe_decode(bytes_)
                elif output_type == "json":
                    with tempfile.NamedTemporaryFile() as f:
                        cobra.io.save_json_model(model, f.name, allow_nan = True)
                        
                        f.seek(0)
                        bytes_ = f.read()
                        string = safe_decode(bytes_)

                        dict_  = json.loads(string)

                        output = json.dumps(dict_)
                elif output_type == "yaml":
                    output	= cobra.io.to_yaml(model)
                elif output_type == "matlab":
                    with tempfile.NamedTemporaryFile() as f:
                        cobra.io.save_matlab_model(model, f.name)
                        
                        f.seek(0)
                        bytes_ = f.read()

                        output = safe_decode(bytes_)
                else:
                    raise TypeError(
                        "Invalid output type %s for model type %s." % (output_type, model_type)
                    )

                cli.echo(output)
            else:
                raise ValueError("Error reading model.")
        
        elif model_type == "kinetic":
            if input_type == "sbml":
                doc = readSBMLFromFile(input)
                
            else:
                raise TypeError(
                    "Invalid input type %s for model type %s." % (input_type, model_type)
                )

            if output_type == "sbml":
                raise NotImplementedError()
            elif output_type == "json":
                output = sbml_to_json(doc)
            else:
                raise TypeError(
                    "Invalid output type %s for model type %s." % (output_type, model_type)
                )
        else:
            raise TypeError("Invalid model type %s." % model_type)
    elif action == "analyse":
        if model_type == "metabolic":
            if analysis_type == "drug":
                model = None
                cli.echo(perform_diff_gene(input))
                
            if analysis_type == "drug_solver":
                model = None
                cli.echo(drug_scores(input))
                
            if analysis_type == "gimme":
                model = None
                model = cobra.io.load_json_model(input)                
                m_gimme = analyse("gimme", model)
                output = json.dumps({"reactions": m_gimme})
                cli.echo(output)

            if analysis_type == "fba":
                model = None

                if input_type == "json":
                    geneKnockOuts = [ ]
                    objective			= [ ]
                    geneKnockOuts_ = [ ]

                    with open(input, "r") as f:
                        content = f.read()
                        model_json = json.loads(content)
                        
                        objective = model_json.get("objective", objective)

                        geneKnockOuts = list(map(lambda g: g["id"], filter(lambda x: x.get("knockOut"), model_json["genes"])))

                    model					= cobra.io.load_json_model(input)

                    if objective:
                        model.objective = objective

                    if geneKnockOuts:
                        for gene in model.genes:
                            if gene.id in geneKnockOuts:
                                gene.knock_out()

                    if model:
                        solution = model.optimize()
                        data     = dict(
                            geneKnockOuts_ = geneKnockOuts_,
                            geneKnockouts = geneKnockOuts,
                            objective_value = solution.objective_value,
                            status = solution.status,
                            fluxes = solution.fluxes.to_dict(),
                            show_prices = solution.shadow_prices.to_dict()
                        )
                        # print(solution)

                    output   = json.dumps(data)

                    if output:
                        cli.echo(output)
            elif analysis_type == "pfba":
                model = None

                if input_type == "json":
                    geneKnockOuts = [ ]
                    objective			= [ ]

                    with open(input, "r") as f:
                        content = f.read()
                        model_json = json.loads(content)
                        
                        objective = model_json.get("objective", objective)

                        geneKnockOuts = list(map(lambda g: g["id"], filter(lambda x: x.get("knockOut"), model_json["genes"])))

                    model					= cobra.io.load_json_model(input)

                    if objective:
                        model.objective = objective

                    if geneKnockOuts:
                        for gene in model.genes:
                            if gene.id in geneKnockOuts:
                                gene.knock_out()

                if model:
                    solution = model.optimize()
                    solution = cobra.flux_analysis.pfba(model)
                    data     = dict(
                        objective_value = solution.objective_value,
                        status = solution.status,
                        fluxes = solution.fluxes.to_dict(),
                        show_prices = solution.shadow_prices.to_dict()
                    )
                    # print(solution)

                output   = json.dumps(data)

                if output:
                    cli.echo(output)
            elif analysis_type == "gfba":
                model = None

                if input_type == "json":
                    geneKnockOuts = [ ]
                    objective			= [ ]

                    with open(input, "r") as f:
                        content = f.read()
                        model_json = json.loads(content)
                        
                        objective = model_json.get("objective", objective)

                        geneKnockOuts = list(map(lambda g: g["id"], filter(lambda x: x.get("knockOut"), model_json["genes"])))

                    model					= cobra.io.load_json_model(input)

                    if objective:
                        model.objective = objective

                    if geneKnockOuts:
                        for gene in model.genes:
                            if gene.id in geneKnockOuts:
                                gene.knock_out()

                if model:
                    solution = model.optimize()
                    solution = cobra.flux_analysis.geometric_fba(model)
                    data     = dict(
                        objective_value = solution.objective_value,
                        status = solution.status,
                        fluxes = solution.fluxes.to_dict(),
                        show_prices = solution.shadow_prices.to_dict()
                    )
                    # print(solution)

                output   = json.dumps(data)

                if output:
                    cli.echo(output)
            elif analysis_type == "fva":
                model = None

                if input_type == "json":
                    geneKnockOuts = [ ]
                    objective			= [ ]

                    with open(input, "r") as f:
                        content = f.read()
                        model_json = json.loads(content)
                        
                        objective = model_json.get("objective", objective)

                        geneKnockOuts = list(map(lambda g: g["id"], filter(lambda x: x.get("knockOut"), model_json["genes"])))

                    model					= cobra.io.load_json_model(input)

                    if objective:
                        model.objective = objective

                    if geneKnockOuts:
                        for gene in model.genes:
                            if gene.id in geneKnockOuts:
                                gene.knock_out()

                if model:
                    parameters = json.loads(parameters or r"{}")

                    params = dict()

                    if "optimum" in parameters:
                        params["fraction_of_optimum"] = parameters.get("optimum")

                    solution = flux_variability_analysis(model, model.reactions, **params)
                    data = solution.to_dict()

                    # data     = dict(
                    # 	objective_value = solution.objective_value,
                    # 	status = solution.status,
                    # 	fluxes = solution.fluxes.to_dict(),
                    # 	show_prices = solution.shadow_prices.to_dict()
                    # )
                    # print(solution)

                output   = json.dumps(data)

                if output:
                    cli.echo(output)
        elif model_type == "kinetic":
            if input_type == "json":
                with open(input, "r") as f:
                    content = f.read()
                    model_json = json.loads(content)

                parameters = json.loads(parameters or r"{}")
                params = dict()

                timesteps = int(parameters.get("num_timesteps", 100))

                sbml_model_str = json_to_sbml(model_json)
                # raise Exception(sbml_model_str)
                model = te.loadSBMLModel(sbml_model_str)

                # selections specifies the output variables in a simulation
                selections = ['time'] + model.getBoundarySpeciesIds() + model.getFloatingSpeciesIds()	

                # simulate the model
                results = model.simulate(0, timesteps, 2*timesteps, selections)

                if results.any():
                    data = []
                    for result in results:
                        for i, selection in enumerate(selections[1:], start=1):
                            data.append({ "time": result[0], "species": selection, "value": result[i] })
                    # raise Exception(data)
                    output = json.dumps(data)

                    if output:
                        cli.echo(output)
            else:                
                raise NotImplementedError()
        else:
            raise TypeError("Invalid model type %s." % model_type)