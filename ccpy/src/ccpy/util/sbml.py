from cobra.core.model  import Model
from libsbml import SBMLDocument, Model as SBMLModel

def restoreComparmentsAtCBM(sbml_doc: SBMLDocument):
		model_doc = sbml_doc.getModel()
		for i in range(model_doc.getNumCompartments()):
				compartment = model_doc.getCompartment(i)
				compartment_id: str = compartment.getId()
				compartment.setName(getSpecieNameByCompartment(model_doc, compartment_id))
		return sbml_doc

def getSpecieNameByCompartment(model_doc: SBMLModel, compartment: str):
    for species_idx in range(model_doc.getNumSpecies()):
        species = model_doc.getSpecies(species_idx)
        if species.getCompartment() == compartment:
            return "c" + species.getName()
    
    return None

def addKB(model: Model, data):
    section_map = data['sectionMap']
    content_map = data['contentMap']
    page_map = data['pageMap']
    reference_map = data['referenceMap']
    content_reference_map = data['contentReferenceMap']
    page_reference_map = data['pageReferenceMap']
    model_reference_ids = data['modelReferenceIds']
    
    def create_model_notes(model_reference_ids):
      references = [
        reference_map_dict[ref_id].get('doi') or reference_map_dict[ref_id].get('pmid')
        for ref_id in model_reference_ids
      ]
      value = ','.join(references) if references else "without references"
      model.notes["references"] = value
    
    def create_ids_name_map(data, key):
        return {str(item[key]): item['name'] for item in data}
    
    def create_page_ids_map(page_map, key):
        return {item['pageId']: str(item[key]) for item in page_map if item[key] is not None}
    
    def create_section_map_dict(section_map, page_ids_dict, prefix):
        section_map_dict = {}
        for item in section_map:
            key = f"{prefix}{ids_name_map_dict.get(page_ids_dict.get(item['pageId'], ''), '')}"
            if key not in section_map_dict and item['pageId'] in page_ids_dict:
                section_map_dict[key] = item['sectionId']
        return section_map_dict
    
    def create_content_map(content_map):
        content_map_dict = {}
        content_ids_map_dict = {}
        for item in content_map:
            content_map_dict.setdefault(item['contentId'], []).append(item['text'])
            content_ids_map_dict.setdefault(item['sectionId'], []).append(item['contentId'])
        return content_map_dict, content_ids_map_dict

    def create_reference_map(reference_map):
        return {item['referenceId']: {'pmid': item['pmid'], 'doi': item['doi'], 'text': item['text']} for item in reference_map}
      
    def create_page_reference_map(page_reference_map):
      page_reference_map_dict = {}
      for item in page_reference_map:
        page_reference_map_dict.setdefault(item['pageId'], []).append(item['referenceId'])
      return page_reference_map_dict

    def create_content_reference_map(content_reference_map):
        content_reference_map_dict = {}
        for item in content_reference_map:
            content_reference_map_dict.setdefault(item['contentId'], []).append(item['referenceId'])
        return content_reference_map_dict
    
    def extract_page_references(entity, prefix):
      prefix_dict_map = {
        "M": (page_ids_metabolites_dict, "metaboliteId"),
        "R": (page_ids_reactions_dict, "reactionId"),
        "G": (page_ids_genes_dict, "geneId")
    	}
      
      if prefix not in prefix_dict_map:
        return []
      
      page_dict, entity_attr = prefix_dict_map[prefix]
      entity_id = getattr(entity, entity_attr)
        
      for page_id, id_value in page_dict.items():
        if id_value == entity_id:
          references = page_reference_map_dict.get(page_id,[])
          refTexts = []
          for ref in references:
            if reference_map_dict[ref].get('pmid') is not None:
              refTexts.append(reference_map_dict[ref].get('pmid'))               
            if reference_map_dict[ref].get('doi') is not None:
              refTexts.append(reference_map_dict[ref].get('doi')) 
          return ','.join(refTexts) if refTexts else []
      return []  
    
    def update_notes(entity, prefix):
      name = entity.name
      section_id = section_map_dict.get(f"{prefix}{name}")
      
      page_reference_value = extract_page_references(entity, prefix)
      if page_reference_value:
        entity.notes['pageReferences'] = page_reference_value
      
      if section_id:
          content_ids = content_ids_map_dict.get(section_id, [])

          for content_id in content_ids:
              description = content_map_dict.get(content_id)
              if not description:
                  continue
              
              content_reference_ids = content_reference_map_dict.get(content_id, [])
              references = [
                  reference_map_dict[ref_id].get('doi') or reference_map_dict[ref_id].get('pmid')
                  for ref_id in content_reference_ids
              ]
              value = ','.join(references) if references else "without references"
              entity.notes[description[0]] = value


    ids_name_map_dict = {}
    ids_name_map_dict.update(create_ids_name_map(data.get('metabolites', []), 'metaboliteId'))
    ids_name_map_dict.update(create_ids_name_map(data.get('reactions', []), 'reactionId'))
    ids_name_map_dict.update(create_ids_name_map(data.get('genes', []), 'geneId'))

    page_ids_metabolites_dict = create_page_ids_map(page_map, 'metaboliteId')
    page_ids_genes_dict = create_page_ids_map(page_map, 'geneId')
    page_ids_reactions_dict = create_page_ids_map(page_map, 'reactionId')

    section_map_dict = {}
    section_map_dict.update(create_section_map_dict(section_map, page_ids_reactions_dict, "R"))
    section_map_dict.update(create_section_map_dict(section_map, page_ids_metabolites_dict, "M"))
    section_map_dict.update(create_section_map_dict(section_map, page_ids_genes_dict, "G"))

    content_map_dict, content_ids_map_dict = create_content_map(content_map)
    reference_map_dict = create_reference_map(reference_map)
    page_reference_map_dict = create_page_reference_map(page_reference_map)
    content_reference_map_dict = create_content_reference_map(content_reference_map)
    
    if model_reference_ids:
        create_model_notes(model_reference_ids)

    for metabolite in model.metabolites:
        update_notes(metabolite, "M")
    for reaction in model.reactions:
        update_notes(reaction, "R")
    for gene in model.genes:
        update_notes(gene, "G")

    return model
