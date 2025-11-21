import fs from 'fs';
import path from 'path';
import mkdirp from "mkdirp";
import models from "../../../../models";
import AnalysisService from "../../../../service/analysis";
import { generateHash } from "../../../../util/crypto";
import logger, { loggerHttp } from "../../../../logger";
import { buildKineticModelJSON } from '../../manageModel/MetabolicModelJSON';
import { Seq } from "immutable";
import model from '../../../../model';


function makeExportDir() {
	const pathExport 	= path.join("/uploads", "exports");
	mkdirp(pathExport);
	return pathExport;
}

async function kineticModelJSONRequest(kinetic, type) {
	const data 	= { };
	buildKineticModelJSON(data);

	data['id'] = kinetic.id;
	data['name'] = kinetic.name;
	data['export'] = type;

	// referenceIds mapper to doi or pmid
	const mapRefIdstoDoiOrPmid = (refs) => {
		const references = []
		if(refs && refs.length > 0){
			refs.forEach(r => {
				const ref = kinetic.referenceMap[r]
				const refDoiPmid = ref.pmid ? ref.pmid : ref.doi ;
				references.push(refDoiPmid)
			})
		}		
		return references
	}

	const unitDefinitions = await models.UnitDefinitions.findAll({include: model.Unit});
	const unitDefinitionMap = {};
	unitDefinitions.forEach(unitDef => {
		unitDefinitionMap[unitDef.id] = unitDef.name;
	});

	Seq(kinetic['compartments']).forEach((comp, key) => {
		let compRow = {
			...comp,
			compartment_id: comp.compartment_id || comp.name 
		};
		data['compartments'].push(compRow);
	});

	Seq(kinetic['parameters']).forEach((param, key) => {
		let paramRow = {
			...param,
			id: param.name,
			unit: unitDefinitionMap[param.unit]
		};
		data['parameters'].push(paramRow);
	});

	const contentReferences = kinetic.contentReferenceMap ? Object.values(kinetic.contentReferenceMap) : null
	const contentMap = kinetic.contentReferenceMap ? kinetic.contentMap : null
	
	Seq(kinetic['species']).forEach((spec, key) => {
		const compartment = kinetic.compartments[spec.compartment];
		let speciesReferences = []
		// page references
		const page = kinetic.pageMap ? Object.values(kinetic.pageMap).filter(e => e.metaboliteId == key).shift() : null
		const pageReferences = kinetic.pageReferenceMap ? Object.values(kinetic.pageReferenceMap) :  null
		if(page && pageReferences && pageReferences.length > 0){
			pageReferences.forEach(p => {
				if(p.pageId == page.pageId){
					speciesReferences.push(p.referenceId)
				}
			})
		}
		// map references ids to doi / pmid
		const references = mapRefIdstoDoiOrPmid(speciesReferences)
		let specieRow = {
			...spec,
			name: spec.name,
			species_id: spec.species_id,
			initial_concentration: spec.initial_concentration,
			unit: unitDefinitionMap[spec.unitDefinitionId], 
			compartment: compartment.compartment_id || compartment.name
		};
		if(references && references.length > 0){
			specieRow.pageReferences = {references}
		}
		// content and content references
		let speciesContentReferences = []
		const section = (kinetic.sectionMap && page) ? Object.entries(kinetic.sectionMap).filter(([j,k]) => k.pageId == page.pageId).shift() : null

		if(section && section.length > 0){
			const contents = kinetic.contentMap  ? Object.entries(kinetic.contentMap).filter(([j,k]) => k.sectionId == section[0]) : null
			
			if(contents && contents.length >= 1 ){
				contents.forEach(content => {
					const contentAndRef = { text: [], references: []}
					const contentId = content[0]
					const contentObj = content[1]

					if(contentObj?.text) {
						contentAndRef.text =contentObj.text
					}

					if(contentReferences && contentReferences.length > 0){
						const cRefs = contentReferences.filter(cr => cr.contentId ==  contentId)

						if(cRefs && cRefs.length > 0){
							cRefs.forEach(cRef => {
								contentAndRef.references.push(cRef.referenceId)
							})
						}	
					}		
					speciesContentReferences.push(contentAndRef)
				})
			}
		}

		if(speciesContentReferences && speciesContentReferences.length > 0){
			let updatedSpeciesContentReferences = []
			for( let contRef of speciesContentReferences){
				if( contRef.text ){
					if( contRef.references.length > 0) {
						// map references ids to doi / pmid
						const refsPmidDoi = mapRefIdstoDoiOrPmid(contRef.references)
						updatedSpeciesContentReferences.push({references: refsPmidDoi, text: contRef.text})						
					} else {
						updatedSpeciesContentReferences.push(contRef)
					}
				}
			}
			specieRow.contentReferences = updatedSpeciesContentReferences
		}

		data['species'].push(specieRow);
	});

	Seq(kinetic.reactions).forEach((reaction, id) => {
		const kineticLaw = kinetic.kinetic_laws[reaction.kinetic_law];
		if (kineticLaw) {
		const params = [];
		Object.values(kineticLaw.parameters).forEach((param) => {
			params.push({
				...param,
				id: param.name,
				unit: unitDefinitionMap[param.unit]
			})
		})
		data.reactions.push({
			...reaction,
			reactants: reaction.reactants.map(reactant => ({
				...reactant,
				species_id: kinetic.species[reactant.id].species_id
			})),
			products: reaction.products.map(product => ({
				...product,
				species_id: kinetic.species[product.id].species_id
			})),
			modifiers: reaction.modifiers.map(id => kinetic.species[id].species_id),
			kinetic_law: {
				...kineticLaw,
				parameters: params
			}
		})
		}
	})

	// model references
	const modelReferenceIds = kinetic.modelReferenceIds ? kinetic.modelReferenceIds['referenceIds'] : null
	const modelReferences = mapRefIdstoDoiOrPmid(modelReferenceIds)

	if( modelReferences && modelReferences.length > 0){
		data['modelReferences'] = modelReferences
	}

	return data;
}

export async function exportKineticModel(getModelJSON, id, version, type, EXTENSIONS) {

		if (typeof getModelJSON !== 'function') {
			throw new Error(`Kinetic getModelJSON function was not defined.`);
		}

		const pathExport = makeExportDir();	
		let pathModel = path.join(pathExport, `${generateHash()}${EXTENSIONS[type]}`);
		

		const mModelVersion	= await models.ModelVersion.findOne({
			where: {
				modelid: id, version
			}
		});
	
		if ( !mModelVersion ) {
			throw new Error(`Model Version with ${version} for Base Model ${id} not found.`)
		} else {
			logger.info(`Model Version: ${JSON.stringify(mModelVersion)} found`);
		}
	
		const mKineticBasedModel = await models.KineticModel.findOne({
			where: {
				ModelVersionId: mModelVersion.id
			}
		});
	
		if ( !mKineticBasedModel ) {
			throw new Error(`No Kinetic-Based Model found for Model Version ${version} of Base Model ${id} found.`);
		} else {
			logger.info(`Kinetic-Based Model found for Model Version ${version} `);
		}

		const mBaseModel = await models.BaseModel.findByPk(mModelVersion.modelid);

		if ( !mBaseModel ) {
			throw new Error(`Base Model with ${id} not found.`);
		}  else {
			logger.info(`Base Model found: ${JSON.stringify(mBaseModel)}`);
		}

		const kineticModelJSON = await getModelJSON(mKineticBasedModel.id, {
			BaseModelId: mModelVersion.modelid,
			VersionId: mModelVersion.id,
			slim: true,
			modelType: 'kinetic'
		});

		if ( !kineticModelJSON ) {
			throw new Error(`Kinetic Model JSON not found.`);
		} else {
			logger.info(`Kinetic Model JSON found: ${JSON.stringify(kineticModelJSON)}`);
		}

		kineticModelJSON['id'] = `${mKineticBasedModel.id}`;
		kineticModelJSON['name'] = mBaseModel.name;

		// log kineticModelJSON 
		loggerHttp.info(`Kinetic Model JSON: ${JSON.stringify(kineticModelJSON)}`);

		const kineticReq = {
			type,
			model: await kineticModelJSONRequest(kineticModelJSON, type),
			resultPath: pathModel
		}

		try {
			await AnalysisService.request.post(`kinetic/export`, kineticReq, {
				timeout: 30000
			});
		} catch(err) {
			let errMsg =`Exporting model at Analysis Service failed.`; 
			err.message = `${errMsg}. ${err.message}`;
			logger.error(err);
			throw err;
		}

		return pathModel;
}