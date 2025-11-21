# imports - standard imports
import sys, os, os.path as osp
import re
import json
import multiprocessing as mp
from functools import partial
import tempfile

# imports - third-party imports
import tellurium as te
import libsbml
from libsbml import SBMLDocument
import xml.etree.ElementTree as ET


def get_unit_definitions(listOfUnit):
    units_info = []
    for i in range(listOfUnit.size()):
        unit_def = listOfUnit.get(i)
        unit_name = unit_def.getId()
        units = []
        for j in range(unit_def.getNumUnits()):
            unit = unit_def.getUnit(j)
            unit_kind_name = libsbml.UnitKind_toString(unit.getKind())
            unit_info = {
                "kind": unit.getKind(),
                "kind_name": unit_kind_name,
                "exponent": unit.getExponent(),
                "scale": unit.getScale(),
                "multiplier": unit.getMultiplier()
            }
            units.append(unit_info)
				
        units_info.append({
            "unit_name": unit_name,
            "units": units
        })
    return units_info


def get_unit_kind_name(unit_definitions, unit_name):
    find_unit_name = next((unit["kind_name"] for unit_def in unit_definitions if unit_def["unit_name"] == unit_name for unit in unit_def["units"]), None)
    return unit_name if find_unit_name is None else find_unit_name


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
    
    def get_unit_name_from_id(model, unit_id):
        unit_def = model.getUnitDefinition(unit_id)
        if unit_def is not None:
           return unit_def.getName() or unit_id
        return "mmol/L"

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

    # unit_definitions = get_unit_definitions(model.getListOfUnitDefinitions())

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
        
        substance_unit_id = sp.getSubstanceUnits()
        substance_unit_name = get_unit_name_from_id(model, substance_unit_id)

        if sp_notes_xml:
          notes = parse_xml(sp_notes_xml)
          species.append({
							"id": sp.getId(),
							"name": sp.getName(),
							"compartment": sp.getCompartment(),
							"initial_concentration": initial_concentration,
							"unit": substance_unit_name,
							"notes": notes
						})
        else:
          species.append({
								"id": sp.getId(),
								"name": sp.getName(),
								"compartment": sp.getCompartment(),
								"initial_concentration": initial_concentration,
								"unit": substance_unit_name
						})
    json_dict["species"] = species
    
		# Add the list of global parameters to the dictionary
    parameters = []
    for parameter in model.getListOfParameters():
        param_unit_id = parameter.getUnits()
        param_unit_name = get_unit_name_from_id(model, param_unit_id)

        parameter_dict = {
            "id": parameter.getId(),
            "name": parameter.getName() or parameter.getId(),
            "value": parameter.getValue(),
            "unit": param_unit_name
        }

    # If the parameter has annotations or notes, you can extract them here if needed

        parameters.append(parameter_dict)
    json_dict["parameters"] = parameters

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

            # sanitized_unit = get_unit_kind_name(unit_definitions, sanitized_unit)
            
            if sanitized_unit == "per second" or sanitized_unit == "second":
                sanitized_unit = "second^-1"
            if sanitized_unit == "mM":
                sanitized_unit = "mmol/L"
            if sanitized_unit == "permin":
                sanitized_unit = "per minute"
            if sanitized_unit == "mMpermin":
                sanitized_unit = "millimolar per minute"
            if sanitized_unit == "mmolepermin":
                sanitized_unit = "millimoles per minute"
            
            local_parameters.append({
                "id": parameter.getId(),
                "value": parameter.getValue(),
                "unit": sanitized_unit 
            })
        kinetic_law_dict["parameters"] = local_parameters

        reactions.append({"id": reaction.getId(), "name": reaction.getName(), "reactants": reactants, "products": products, 
        "modifiers": modifiers, "kinetic_law": kinetic_law_dict})
    json_dict["reactions"] = reactions

    # Return the JSON representation as a string
    return json.dumps(json_dict)
