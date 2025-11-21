import { Op } from 'sequelize';
import { QueryTypes } from 'sequelize';
import json2csv from "json2csv";
//import WebService from "../../service/web";
import AppService from "../../../service/app";
import AnalysisService from "../../../service/analysis";

import mkdirp from "mkdirp";
import tmp from "tmp";
import { query, Router } from "express";
import multer from "multer";
import fs from 'fs';
import path from 'path';
import axios from 'axios';

import express from "express";
import Immutable, { Seq } from "immutable";
import isEmpty from "lodash.isempty"
import sharp from "sharp";

import FormData from "form-data";
import { PATH, PLATFORM } from "../../../const";
import Response from "../../response";
import models from "../../../models";
import { db } from "../../../models";
import { generateHash } from "../../../util/crypto";
import logger, { loggerHttp } from "../../../logger";
import CCPy from "../../../ccpy";
import { AuthRequired } from "../../middlewares/auth";
import cache, { deleteCacheWith } from "../../../cache";
import { notify } from "../../socket/notify";
import { add as addToQueue } from "../../../processes";

import ModelType from "../../../model"
import Publish from "../manageModel/Publish";
import Lesson from "../manageModules/Lesson";
import ModelPermission from "../manageModel/ModelPermission";
import Version from "../manageModel/Version";
import JsonFilter, { doFilterSpecialChar } from "../../../util/JsonFilter";
import ModelConstants from "../manageModel/ModelConstants";
import Metadata, { MetadataDefinition } from "../manageModel/Metadata";
import LearningObjective from "../manageModel/LearningObjective";
import Share from "../manageModel/Share";
import Course from '../manageCourse/Course';
import MODEL from "../../../model";
import Tasks, { StartTaskOptions, TASKS_JOB } from '../manageTasks/Tasks';
import BooleanAnalysis from 'ccbooleananalysis';
import { repeat } from 'lodash';
import ModelMetabolicMap from '../manageModel/JsonMap/ModelMetabolicMap';
import ModelMetabolic from '../manageModel/ModelMetabolic';
import { savePharmacokineticModel, savePharmacokineticJSONModel, getPharmacokineticModelJSON } from './pharmacokinetic';
import { waitSingleLoad, markSingleLoad, getCoverImage } from './utils';
import { parseGeneReactionRule } from '../../../util/reactionRules';
import { buildConditions, buildMetabolicModelJSON } from '../manageModel/MetabolicModelJSON';
import Account from '../manageUser/Account';
import ContextSpecific from '../manageModel/ContextSpecific';
import DrugExperiment, {
	DrugExperimentFields, DrugExperimentStatus, DrugParseScores, DrugPrevExperiment, LIMIT_REQ_ATTEMPT
} from '../manageModel/DrugExperiment';
import { ElementXML, generateXML, XMLParser } from '../../../util/xml';
import DrugIdentification, {
	drugCreateRequiredFolders, drugFileValidation,
	drugMoveListCSVFile, drugRenameModelJSONFile,
	PerformAnalyzeInput, drugWriteLogs, drugMoveRegulatedCSVFile 
} from '../manageModel/DrugIdentification';
import DrugSolver, { PerformSolverInput } from '../manageModel/DrugSolver';
import Experiment from '../manageModel/Experiment';
import { exportKineticModel } from './kinetic';
import ModelKinetic from '../manageModel/ModelKinetic';
import ModelKineticMap from '../manageModel/JsonMap/ModelKineticMap';
import { ReferPmidDoi } from '../../../util/validate/referPmidDoi';
import { request } from 'https';
import SaveModel, { SaveModelSettings } from '../manageModel/SaveModel';

const allValidModelVersions = async (modelId, modelType, userId) => {
	if (!modelId) {
		return [];
	}
	let query =
	`SELECT mv.id AS "modelOriginalId", mv."version", mv.userid AS "userId", mv."name" AS "versionName",
	 m.modeltype AS "modelType", mv.modelid AS "modelId", m."_updatedAt", mv.selected
	FROM public.model_version mv
	INNER JOIN public.model m ON m.id = mv.modelid
	WHERE `;
	if (modelType === ModelConstants.TYPE_METABOLIC) {
		query += `mv.modelid = '${modelId}'`;
	} else {
		query += `mv.id = '${modelId}'`;
	}
	if (modelType) {
		query += ` AND m.modeltype = '${modelType}'`;
	}
	if (userId) {
		query+=` AND mv.userid = '${userId}'`
	}
	query += ` AND mv."_deleted" != true`;

	const results = await db.query(query);	
	return results;
}

const filterModelVersionsForCards = async (modelId, versionsObj, modelType) => {
	const validVersions = await allValidModelVersions(modelId, modelType);
	if (validVersions.length == 0) {
		return versionsObj;
	}
	const newVersionMap = [];
	let firstIdx = -1;
	Object.keys(versionsObj).forEach((mvKey) => {
		const validIdx = validVersions.findIndex(mv => mv.version == versionsObj[mvKey].version);
		if (validIdx > -1) {
			if (firstIdx === -1) {
				firstIdx = mvKey;
				versionsObj[firstIdx].selected = true;				
			} else if (validVersions[validIdx].selected) {
				versionsObj[firstIdx].selected = false;
				versionsObj[mvKey].selected = true;
			}
			versionsObj[mvKey].updatedAt = validVersions[validIdx]._updatedAt;
			newVersionMap.push([versionsObj[mvKey].version, versionsObj[mvKey]]);
		}
	});
	return Object.fromEntries(new Map(newVersionMap));
}

const orderingModelActivities = (listActivities=[], activities) => {
	if (!listActivities || !listActivities.length || !activities) {
		return [];
	}

	const activityPosition = {};
	const newPositions = {};
	const newPositionsOrder = {};
	let hasPosition = false;

	Object.keys(activities).forEach((key) => {
		if ('position' in activities[key]) {
			activityPosition[key] = activities[key];
			hasPosition = true;
		}
	});

	if (!hasPosition) {
		return [];
	}

	listActivities.forEach((activityData) => {
		if (!newPositions[activityData.groupId]) {
			newPositions[activityData.groupId] = [];
		}
		if (!newPositionsOrder[activityData.groupId]) {
			newPositionsOrder[activityData.groupId] = [];
		}
		if (!activityPosition[activityData.id]) {
			newPositions[activityData.groupId].push(activityData.id);
		} else {
			newPositionsOrder[activityData.groupId].push(activityData.id);
		}
	});

	const ordered = [];
	const keysGroup = Object.keys(newPositions);

	keysGroup.forEach((groupId) => {	
		newPositionsOrder[groupId]
			.forEach((key) => {
				const nPos = activityPosition[key].position;
				newPositions[groupId].splice(nPos, 0, key);
			});			
	});

	keysGroup.forEach((groupId) => {
		newPositions[groupId].forEach((id, pos) => ordered.push({id, pos}));
	});

	return ordered;
}

const listModelActivities = async (modelId, versionId) => {
	const queryListActivities =
	`SELECT la.id, la."position", la.groupid AS "groupId"
	 FROM public.learning_activity la
	 WHERE la.masterid = ${parseInt(modelId)} AND la."version" = ${parseInt(versionId)}
	 ORDER BY la."position", la.groupid ASC`;
	return (await db.query(queryListActivities)) || [];
}

const updateActivity = async (modelId, activityId, position) => {
	await db.query(
		`UPDATE public.learning_activity SET "position"=${position} WHERE id=${activityId} and masterid = ${modelId}`);	
}

const saveModelActivity = async (modelId, versionId, activities) => {	
	const listActivities = await listModelActivities(modelId, versionId);
	const orderActivities = orderingModelActivities(listActivities, activities);
	
	for (const activityData of orderActivities) {
		await updateActivity(modelId, activityData.id, activityData.pos);
	}
}

const router = new Router();

const formatAnnotations = (mAnnotations, { slim = false, negateId = false } = { }) => {
	const annotations  = slim ? { } : [ ];

	for ( let i = 0 , n = mAnnotations.length ; i < n ; ++i ) {
		const mAnnotation				= mAnnotations[i];
		const annotation  			= { };

		annotation.source 			= mAnnotation.source;
		annotation.annotations 	= mAnnotation.annotations;
		
		if ( slim ) {
			annotations[_negateId(mAnnotation.id, negateId)] = annotation;
		} else {
			annotation.id	= _negateId(mAnnotation.id, negateId);
			
			annotation._createdAt		= mAnnotation._createdAt;
			annotation._createdBy		= mAnnotation._createdBy;
			annotation._updatedAt		= mAnnotation._updatedAt;
			annotation._updatedBy		= mAnnotation._updatedBy;

			annotations.push(annotation);
		}
	}

	return annotations;
}


const getConstraintBasedModelJSON = async (mConstraintBasedModel, {
	slim = false,
	negateId = false,
	BaseModelId
}) => {
	const data = {};
	logger.info(`Fetching Metabolites...`);
 
	const mMetabolites = await mConstraintBasedModel.getMetabolites({
		include: [{
			model: models.Species
		}, {
			model: models.Compartment
		}]
	});

	const mAnnotations = await models.Annotation.findAll({
		where: {
			MetaboliteId: mMetabolites.map(m => m.id)
		}
	});

	const metabolites			= slim ? { } : [ ];
	let 	annotations			= slim ? { } : [ ];
	const mCompartmentMap = { };

	for ( let i = 0, a = mMetabolites.length ; i < a ; ++i ) {
		const mMetabolite = mMetabolites[i];
		const metabolite 	= { };
		
		// const mSpecies		= await models.Species.findByPk(mMetabolite.SpeciesId);

		// if ( !mSpecies ) {
		// 	throw new Error(`Unable to find Species with ID: ${mMetabolite.SpeciesId}.`);
		// }

		// logger.info(`Fetching Compartment...`);
		// const mCompartment	= await models.Compartment.findByPk(mMetabolite.CompartmentId);

		if ( mMetabolite.Compartment ) {
			const mMetaboliteKey = _negateId(mMetabolite.Compartment.id, negateId);
			metabolite.compartment = mMetaboliteKey;
			
			if ( ! (mMetabolite.Compartment.id in mCompartmentMap) ) {
				mCompartmentMap[mMetaboliteKey] = { };
				mCompartmentMap[mMetaboliteKey].name = mMetabolite.Compartment.name;
				mCompartmentMap[mMetaboliteKey].compartmentId = mMetabolite.Compartment.compartmentId;
				
				if ( !slim ) {
					mCompartmentMap[mMetaboliteKey].id = mMetaboliteKey;
					mCompartmentMap[mMetaboliteKey]._createdAt = mMetabolite.Compartment._createdAt;
					mCompartmentMap[mMetaboliteKey]._createdBy = mMetabolite.Compartment._createdBy;
					mCompartmentMap[mMetaboliteKey]._updatedAt = mMetabolite.Compartment._updatedAt;
					mCompartmentMap[mMetaboliteKey]._updatedBy = mMetabolite.Compartment._updatedBy;
				}
			}
		}

		metabolite.name	 			= mMetabolite.Species.name;
		metabolite.speciesId 	= mMetabolite.Species.speciesId;
		metabolite.formula		= mMetabolite.formula;
		metabolite.charge			= mMetabolite.charge;

		const tAnnotations = mAnnotations.filter(a => a.MetaboliteId == mMetabolite.id);

		if ( tAnnotations && tAnnotations.length !== 0 ) {
			const lAnnotations 			= formatAnnotations(tAnnotations, { slim, negateId });
			metabolite.annotations	= slim ? Object.keys(lAnnotations) : lAnnotations.map(a => a.id);

			if ( slim ) {
				annotations = { ...annotations, ...lAnnotations }
			} else {
				annotations = [].concat(annotations, lAnnotations);
			}
		}
		
		if ( slim ) {
			metabolites[_negateId(mMetabolite.id, negateId)] = metabolite
		} else {
			metabolite.id	= _negateId(mMetabolite.id, negateId);
			metabolite._createdBy	= mMetabolite._createdBy;
			metabolite._createdBy	= mMetabolite._createdAt;
			metabolite._updatedBy	= mMetabolite._updatedBy;
			metabolite._updatedAt	= mMetabolite._updatedAt;
			metabolites.push(metabolite);
		}
	}

	data.metabolites = metabolites;
	
	if ( !isEmpty(mCompartmentMap) ) {
		const compartments	= slim ? mCompartmentMap : Object.values(mCompartmentMap)
		data.compartments 	= compartments;
	}

	logger.info(`Fetching Genes...`);

	const genes  = slim ? { } : [ ];
	const mGenes = await mConstraintBasedModel.getGenes({
		include: [{
			model: models.Species
		}]
	});
	const gAnnotations = await models.Annotation.findAll({
		where: {
			GeneId: mGenes.map(g => g.id)
		}
	});

	for ( let j = 0, b = mGenes.length ; j < b ; ++j ) {
		const mGene = mGenes[j]
		const gene = { }

		const tAnnotations = gAnnotations.filter(a => a.GeneId == mGene.id);

		if ( tAnnotations && tAnnotations.length !== 0 ) {
			const lAnnotations = formatAnnotations(tAnnotations, { slim, negateId });
			gene.annotations	= slim ? Object.keys(lAnnotations) : lAnnotations.map(a => a.id);

			if ( slim ) {
				annotations = { ...annotations, ...lAnnotations }
			} else {
				annotations = [].concat(annotations, lAnnotations);
			}
		}

		gene.speciesId 	= mGene.Species.speciesId;
		gene.name 			= mGene.Species.name;

		if ( slim ) {
			genes[_negateId(mGene.id, negateId)] = gene
		} else {
			gene.id = _negateId(mGene.id, negateId);
			gene._createdBy = mGene._createdBy;
			gene._createdAt = mGene._createdAt;
			gene._updatedBy = mGene._updatedBy;
			gene._updatedAt = mGene._updatedAt;

			// ensure that the gene id does not conflict with existing gene in genes array
			// check if another gene already exists with the same id
			const geneIsDuplicate = genes.some(g => g.id === gene.id);
			if (!geneIsDuplicate) {
        genes.push(gene)
      }
		}
	}

	logger.info(`Fetching Reactions...`);
	const mReactions = await mConstraintBasedModel.getReactions({
		include: [{
			model: models.SubSystem
		}]
	});

	const mReactionIds = mReactions.map(r => r.id);
	const mReactionCoefficients = await models.ReactionCoefficient.findAll({
		where: {
			ReactionId: mReactionIds,
			MetaboliteId: {[models.Sequelize.Op.ne]: null}
		},
		include: [{
			model: models.Metabolite
		}]
	});
	const mReactionGenes = await models.ReactionGene.findAll({
		where: {
			ReactionId: mReactionIds
		}
	});
  
  // Knowledge base
  data.pageMap = {};
  data.sectionMap = {};
  data.contentMap = {};
	data.objectives = {};
	data.objectiveReactions = {};
	data.drugEnvironmentMap = {};
	data.contentReferenceMap = {};	
	data.referenceMap = {};
	data.pageReferenceMap = {};

  
	const modelMetabolic = new ModelMetabolic(models);
	data.pageMap = ModelMetabolicMap.buildMapToResults(await modelMetabolic.getPagesByConstraintModel(mConstraintBasedModel.id));
	data.sectionMap = ModelMetabolicMap.buildMapToResults(await modelMetabolic.getSectionsByConstraintModel(mConstraintBasedModel.id));
	data.contentMap = ModelMetabolicMap.buildMapToResults(await modelMetabolic.getContentsByConstraintModel(mConstraintBasedModel.id));
	data.objectives = ModelMetabolicMap.buildMapToResults(await modelMetabolic.getObjectivesFuncByConstraintModel(mConstraintBasedModel.id));
	data.objectiveReactions = ModelMetabolicMap.buildMapToResults(await modelMetabolic.getObjectivesReaction(mReactionIds));
	data.subsystems = ModelMetabolicMap.buildMapToResults(await modelMetabolic.getSubsystemsByConstraintModel(mConstraintBasedModel.id));
		data.drugEnvironmentMap = ModelMetabolicMap.buildMapToResults(await modelMetabolic.getDrugEnvironmentByConstraintModel(mConstraintBasedModel.id));
	data.contentReferenceMap = ModelMetabolicMap.buildMapToResults(await modelMetabolic.getContentReferenceMapByConstraintModel(mConstraintBasedModel.id));
	data.referenceMap = ModelMetabolicMap.buildMapToResults(await modelMetabolic.getReferenceMapByConstraintModel(mConstraintBasedModel.id, BaseModelId));
	data.pageReferenceMap = ModelMetabolicMap.buildMapToResults(await modelMetabolic.getPageModelReferenceMapByConstraintModel(mConstraintBasedModel.id));
	const modelIdsArr = await modelMetabolic.getModelReferenceMapByConstraintModel(BaseModelId);
	data.modelReferenceIds = modelIdsArr[0]
	
	const mRegulators  	= await models.Regulator.findAll({
		where: {
			ReactionGeneId: mReactionGenes.map(r => r.id)
		},
		// include: [{
		// 	model: models.Condition,
		// 	as: "Conditions"
		// }]
	});
	const mConditions  = await models.Condition.findAll({
		where: {
			regulator_id: mRegulators.map(r => r.id)
		}
	});
	const mConditionSpecies = await models.ConditionSpecies.findAll({
		where: {
			condition_id: mConditions.map(c => c.id)
		}
	});
	const mSubConditions  = await models.SubCondition.findAll({
		where: {
			condition_id: mConditions.map(r => r.id)
		}
	});
	const mSubConditionSpecies = await models.SubConditionSpecies.findAll({
		where: {
			sub_condition_id: mSubConditions.map(c => c.id)
		}
	});
	const rAnnotations = await models.Annotation.findAll({
		where: {
			ReactionId: mReactionIds
		}
	});

	const reactions			= slim ? { } : [ ];
	const conditions		= slim ? { } : [ ];
	const subConditions	= slim ? { } : [ ];
	const mSubSystemMap	= { };
	const regulators    = slim ? { } : [ ];
	const objectives		= slim ? { } : [ ];
	
	data.reactionMetabolites = slim ? { } : [ ];

	for ( let k = 0, b = mReactions.length ; k < b ; ++k ) {
		const mReaction     = mReactions[k];
		const reaction			= { };
		reaction.boundary = mReaction.boundary;
		reaction.reactionId = mReaction.reactionId;
		reaction.name		= mReaction.name;
		reaction.subsystem	= _negateId(mReaction.SubSystem?.id, negateId);
		reaction.lowerBound = mReaction.lowerBound;
		reaction.upperBound	= mReaction.upperBound;
		reaction.objectiveCoefficient = mReaction.objectiveCoefficient;

		if ( mReaction.SubSystem ) {
			reaction.subsystem = mReaction.SubSystem.id;
			
			if ( ! (mReaction.SubSystem.id in mSubSystemMap) ) {
				mSubSystemMap[_negateId(mReaction.SubSystem.id, negateId)] = {
					name: mReaction.SubSystem.name
				};

				if ( !slim ) {
					mSubSystemMap[_negateId(mReaction.SubSystem.id, negateId)].id = _negateId(mReaction.SubSystem.id, negateId)
				}
			}
		}

		reaction.metabolites = { };
		const tmReactionCoefficients = mReactionCoefficients
			.filter(r => r.ReactionId == mReaction.id);
		
		for ( const mReactionCoefficient of tmReactionCoefficients ) {
			reaction.metabolites[_negateId(mReactionCoefficient.Metabolite.id, negateId)] = mReactionCoefficient.coefficient;
			data.reactionMetabolites[_negateId(mReactionCoefficient.id, negateId)] = {
				reaction: mReactionCoefficient.ReactionId,
				metabolite: mReactionCoefficient.MetaboliteId,
				coefficient: mReactionCoefficient.coefficient
			}
		}

		const tmReactionGenes = mReactionGenes
			.filter(r => r.ReactionId == mReaction.id);
		for ( const mReactionGene of tmReactionGenes ) {
			const tmRegulators = mRegulators
				.filter(r => r.ReactionGeneId == mReactionGene.id)

			for ( let m = 0 , d = tmRegulators.length ; m < d ; ++m ) {
				const mRegulator		= tmRegulators[m];
				const regulator 		= { };

				regulator.type 			= mRegulator.type;
				regulator.reaction 	= _negateId(mReactionGene.ReactionId, negateId);
				regulator.gene			= _negateId(mReactionGene.GeneId, negateId);
				regulator.conditionRelation = mRegulator.conditionrelation;

				if ( slim ) {
					regulators[_negateId(mRegulator.id, negateId)] = regulator;
				} else {
					regulator.id 	= _negateId(mRegulator.id, negateId);
					regulator._createdBy = regulator._createdBy;
					regulator._createdAt = regulator._createdAt;
					regulator._updatedBy = regulator._updatedBy;
					regulator._updatedAt = regulator._updatedAt;
					regulators.push(regulator);
				}

				const tmConditions = mConditions
					.filter(c => c.regulator_id == mRegulator.id)
				
				for ( let n = 0 , e = tmConditions.length ; n < e ; ++n ) {
					const mCondition = tmConditions[n];
					const mConditionGenes = mConditionSpecies
						.filter(c => c.condition_id == mCondition.id);
					const geneIds = mConditionGenes.map(c => _negateId(parseInt(c.GeneId), negateId));

					const condition = {
						type: 						mCondition.type,
						state: 						mCondition.state,
						regulator: 				_negateId(parseInt(mRegulator.id), negateId),
						speciesRelation: 	mCondition.speciesrelation,
						subConditionRelation: mCondition.subconditionrelation,
						genes: 						geneIds
					};

					buildConditions(subConditions,
						'condition_id', 'conditionId', 'sub_condition_id',
						mCondition, mSubConditions, mSubConditionSpecies, negateId, slim);

					if ( slim ) {
						conditions[_negateId(mCondition.id, negateId)]	= condition;
					} else {
						condition.id 					= _negateId(parseInt(mCondition.id), negateId);
						condition._createdBy 	= condition._createdBy;
						condition._createdAt	= condition._createdAt;
						condition._updatedAt	= condition._updatedAt;
						condition._updatedBy	= condition._updatedBy;
						conditions.push(condition);
					}
				}
			}
		}
		
		const tAnnotations = rAnnotations.filter(a => a.ReactionId == mReaction.id);

		if ( tAnnotations && tAnnotations.length !== 0 ) {
			const lAnnotations 		= formatAnnotations(tAnnotations, { slim, negateId });
			reaction.annotations 	= slim ? Object.keys(lAnnotations) : lAnnotations.map(a => a.id);

			if ( slim ) {
				annotations = { ...annotations, ...lAnnotations }
			} else {
				annotations = [].concat(annotations, lAnnotations);
			}
		}

		if ( slim ) {
			reactions[_negateId(mReaction.id, negateId)] = reaction;
		} else {
			reaction.id					= _negateId(mReaction.id, negateId);
			reaction._createdBy	= mReaction._createdBy;
			reaction._createdAt = mReaction._createdAt;
			reaction._updatedBy	= mReaction._updatedBy;
			reaction._updatedAt	= mReaction._updatedAt;

			reactions.push(reaction);
		}

		if ( reaction.objectiveCoefficient > 0 ) {
			const objective 		= { };

			objective.name			= reaction.name
			objective.reactions	= {
				[_negateId(mReaction.id, negateId)]: reaction.objectiveCoefficient
			}
			objective.default		= true;

			if ( slim ) {
				objectives[0]	= objective
			} else {
				objectives.push(objective);
			}
		}
	}

	if ( !isEmpty(mSubSystemMap) ) {
		const subsystems	= slim ? mSubSystemMap : Object.values(mSubSystemMap)
		data.subsystems 	= {...data.subsystems, ...subsystems};
	}

	data.genes 					= genes;
	data.reactions			= reactions;
	//data.objectives		= objectives;
	data.regulators 		= regulators;
	data.conditions			= conditions;
	data.subConditions 	= subConditions;
	data.annotations		= annotations;

	return data;
}


const getKineticModelJSON = async (model, {
	slim = false,
	negateId = false,
	BaseModelId
}) => {
	const data = {};
	let kineticModelId = null;
	logger.info(`Fetching Metabolites...`);

	const modelSpecies = await model.getKineticSpecies({
		include: [{
			model: models.KineticCompartment
		}]
	});

	const species			= slim ? { } : [ ];
	const 	annotations			= slim ? { } : [ ];
	const mCompartmentMap = { };

	// build species and compartments
	modelSpecies.forEach((speciesItem) => {
		kineticModelId = speciesItem.KineticModelId;
		let newSpecies = {};

		if (speciesItem.KineticCompartment) {
			newSpecies.compartment = _negateId(speciesItem.KineticCompartment.id, negateId);

			// adding compartment if not yet present
			if (!(speciesItem.KineticCompartment.id in mCompartmentMap)) {
				const compartment = speciesItem.KineticCompartment;
				
				mCompartmentMap[newSpecies.compartment] = {
					name: compartment.name,
					volume: compartment.volume
				};


				if (!slim) {
					mCompartmentMap[newSpecies.compartment] = {
						...mCompartmentMap,
						id: newSpecies.compartment,
						_createdAt: compartment._createdAt,
						_createdBy: compartment._createdBy,
						_updatedAt: compartment._updatedAt,
						_updatedBy: compartment._updateBy
					}
				}
			}


		}
		
		newSpecies = {
			...newSpecies,
			name: speciesItem.name,
			species_id: speciesItem.species_id,
			initial_concentration: speciesItem.initial_concentration,
			unitDefinitionId: speciesItem.unit_definition_id,
			metabolite_id: speciesItem.id
		}

		// TODO: annotations here
		
		const newSpeciesId = _negateId(speciesItem.id, negateId);
		if (slim) {
			species[newSpeciesId] = newSpecies;
		} else {
			species.push({
				...newSpecies,
				id: newSpeciesId,
				_createdBy: speciesItem._createdBy,
				_createdAt: speciesItem._createdAt,
				_updatedBy: speciesItem._updatedBy,
				_updatedAt: speciesItem._updatedAt
			});
		}
	});

	logger.info(`Fetching Global Parameters...`);

	const modelGlobalParameters = await model.getKineticGlobalParams({
		include: [{
			model: models.KineticModel
		}]
	});

	// build global parameters
	const globalParameters = slim ? { } : [ ];
	modelGlobalParameters.forEach((globalParameter) => {
		const newGlobalParameter = {
			name: globalParameter.name,
			value: globalParameter.value,
			unit: globalParameter.unit_definition_id
		}

		const newGlobalParameterId = _negateId(globalParameter.id, negateId);
		if (slim) {
			globalParameters[newGlobalParameterId] = newGlobalParameter;
		} else {
			globalParameters.push({
				...newGlobalParameter,
				id: newGlobalParameterId,
				_createdBy: globalParameter._createdBy,
				_createdAt: globalParameter._createdAt,
				_updatedBy: globalParameter._updatedBy,
				_updatedAt: globalParameter._updatedAt
			});
		}
	});

	logger.info(`Fetching Reactions...`);
	
	const modelReactions = await model.getKineticReactions({
		include: [{
			model: models.KineticLaw,
			include: [{
				model: models.KineticLocalParams
			}]
		}, {
			model: models.KineticSpecies,
			as: 'reactants',
			through: {
        attributes: ['stoichiometry']
      }
		}, {
			model: models.KineticSpecies,
			as: 'products',
			through: {
        attributes: ['stoichiometry']
      }
		}, {
			model: models.KineticSpecies,
			as: 'modifiers'
		}]
	});

	const reactions	= slim ? { } : [ ];
	const kineticLaws = slim ? { } : [ ];

	modelReactions.forEach((reaction) => {
		const newReactionId = _negateId(reaction.id, negateId);

		const newReaction = {
			name: reaction.name,
			reaction_id: reaction.reaction_id,
			reversible: reaction.reversible,
			reactants: reaction.reactants.map(r => { 
				return {
					id: _negateId(r.id, negateId),
					stoichiometry: r.KineticReactants.dataValues.stoichiometry
				}
			}),
			products: reaction.products.map(p => { 
				return {
					id: _negateId(p.id, negateId),
					stoichiometry: p.KineticProducts.dataValues.stoichiometry
				}
			}),
			modifiers: reaction.modifiers.map(m => _negateId(m.id, negateId))
		}

		if (reaction.KineticLaw) {
			const newKineticLawId = _negateId(reaction.KineticLaw.id, negateId);
			newReaction.kinetic_law = newKineticLawId;

			const parameters = {}
			reaction.KineticLaw.KineticLocalParams.forEach(p => {
				parameters[p.id] = {
					name: p.name,
					value: p.value,
					unit: p.unit_definition_id
				}
			});

			const newKineticLaw = {
				formula: reaction.KineticLaw.formula,
				type: reaction.KineticLaw.KineticLawTypeId,
				reaction: newReactionId,
				parameters: parameters,
				description: reaction.KineticLaw.description || ""
			}

			if (slim) {
				kineticLaws[newKineticLawId] = newKineticLaw;
			} else {
				kineticLaws.push({
					...newKineticLaw,
					id: newKineticLawId,
					_createdBy: reaction.KineticLaw._createdBy,
					_createdAt: reaction.KineticLaw._createdAt,
					_updatedBy: reaction.KineticLaw._updatedBy,
					_updatedAt: reaction.KineticLaw._updatedAt
				});
			}
		}

		if (slim) {
			reactions[newReactionId] = newReaction;
		} else {
			reactions.push({
				...newReaction,
				id: newReactionId,
				_createdBy: reaction._createdBy,
				_createdAt: reaction._createdAt,
				_updatedBy: reaction._updatedBy,
				_updatedAt: reaction._updatedAt
			});
		}
	});

	// Knowledge base
	data.pageMap = {};
	data.sectionMap = {};
	data.contentMap = {};
	data.referenceMap = {};
	data.pageReferenceMap = {};
	data.contentReferenceMap = {};	

	if (slim && kineticModelId) {
		const modelKinetic = new ModelKinetic(models);
		data.pageMap = ModelKineticMap.buildMapToResults(await modelKinetic.getPagesByKineticModel(kineticModelId));
		data.sectionMap = ModelKineticMap.buildMapToResults(await modelKinetic.getSectionsByKineticModel(kineticModelId));
		data.contentMap = ModelKineticMap.buildMapToResults(await modelKinetic.getContentsByKineticModel(kineticModelId));
		data.referenceMap = ModelKineticMap.buildMapToResults(await modelKinetic.getReferenceMapByKineticModel(kineticModelId, BaseModelId));
		data.pageReferenceMap = ModelKineticMap.buildMapToResults(await modelKinetic.getPageModelReferenceMapByKineticModel(kineticModelId));
		data.contentReferenceMap = ModelKineticMap.buildMapToResults(await modelKinetic.getContentReferenceMapByKineticModel(kineticModelId));
		const modelIdsArr = await modelKinetic.getModelReferenceMapByKineticModel(BaseModelId);
		data.modelReferenceIds = modelIdsArr[0]
	}

	ModelKineticMap.addReferencesToPages('contentReferenceMap', 'pageMap', data);

	data.species = species;
	data.compartments = slim ? mCompartmentMap : Object.values(mCompartmentMap);
	data.reactions = reactions;
	data.globalParameters = globalParameters;
	data.kinetic_laws = kineticLaws;

	logger.info(`logging data: ${JSON.stringify(data)}`);

	return data;
}

const loadDataFromCache = async (key) => {
	const dataString  = await cache.call("JSON.GET", key);
	return JSON.parse(dataString);
}

const saveDataToCache = async (key, data, ttl) => {
	const dataString 	= JSON.stringify(data);
	await cache.call("JSON.SET", key, ".", dataString);
	await cache.expire(key, ttl);
}



const getModelJSON = async (id, {
	BaseModelId = null,
	VersionId = null,
	slim = false,
	negateId = false,
	modelType = null,
} = { }) => {
	let data = { };
	const dbModelClass = MODEL[modelType].dbModelClass;

	const model = await models[dbModelClass].findByPk(id);

	if ( !model ) {
		throw new Error(`No ${modelType} Model found for Base Model ${BaseModelId} \
			and Model Version ${VersionId}`);
	}

	logger.info(`Fetching Model JSON for Model: ${id}...`);
	// cache key
	const k = `model:${BaseModelId}:version:${VersionId}:slim:${slim}`;

	const loadFromCache = async () => {
		const dataString  = await cache.call("JSON.GET", k);
		data = JSON.parse(dataString);
	}
	if ( (await cache.exists(k)) ) {
		await loadFromCache();
	}else{
		await waitSingleLoad(k);
		await markSingleLoad(k, async () => {
			if ( (await cache.exists(k)) ) {
				await loadFromCache();
			} else {
				if (modelType === 'metabolic') {
					data = await getConstraintBasedModelJSON(model, {
						slim: slim,
						negateId: negateId,
						BaseModelId
					});
				} else if ( modelType === 'kinetic') {
					logger.info(`Fetching Kinetic Model 2...`);
					data =  await getKineticModelJSON(model, {
						slim: slim,
						negateId: negateId,
						BaseModelId
					}); 
				} else if (modelType === 'pharmacokinetic') {
					data = await getPharmacokineticModelJSON(model, {
						slim: slim,
						negateId: negateId
					});
				}
				const dataString 	= JSON.stringify(data);
				await cache.call("JSON.SET", `model:${BaseModelId}:version:${VersionId}:slim:${slim}`, ".", dataString);

			}
		});
	}
	
	return data;
}

const getModelVersionJSON = async (id, {
	version	 	= null,
	shallow 	= false,
	slim			= false,
	negateId  = false
} = { }) => {
	const mBaseModel = await models.BaseModel.findByPk(id);

	if ( !mBaseModel ) {
		throw new Error(`Unable to find Base Model with ID: ${id}.`);
	}

	const versions 				= [ ];
	
	logger.info(`Fetching Model Versions for Model: ${id}...`);
	const condition 			= { modelid: id };
	if ( version ) {
		condition.version  	= version
	}

	const mModelVersions 	= await models.ModelVersion.findAll({ where: condition });

	if ( isEmpty(mModelVersions) && [null, "boolean"].includes(mBaseModel.modelType) ) { // ID mismatch
		try {
			const appResponse = await AppService.request.get(`/model/get/${id}?version=${version}`);
			let versionMeta = { }
			
			versionMeta.default	= true;

			versionMeta 	  		= { ...versionMeta, ...Object.values(appResponse.data)[0] }

			versions.push(versionMeta);
		} catch (e) {
			logger.info(`Base Model ID found, ID mismatch.`);
			throw new Error(`Base Model ${id} not found.`);
		}
	} else {
		for ( let i = 0 ; i < mModelVersions.length ; ++i ) {
			const mModelVersion = mModelVersions[i];
	
			let versionMeta 		= { };
	
			versionMeta.id					= _negateId(parseInt(mModelVersion.id), negateId);
			versionMeta.version			= _negateId(parseInt(mModelVersion.version), negateId);
	
			versionMeta.name				= mModelVersion.name || mBaseModel.name;
	
			if (i === 0 || mModelVersion.selected) {
				versionMeta.default	= true;
			}

			versionMeta._createdBy 	= mModelVersion._createdBy;
			versionMeta._createdAt 	= mModelVersion._createdAt;
			versionMeta._updatedBy 	= mModelVersion._updatedBy;
			versionMeta._updatedAt 	= mModelVersion._updatedAt;
	
			// if ( shallow ) {
			versionMeta.modelType		= mBaseModel.modelType;
			// }
	
			if ( ["boolean", null].includes(mBaseModel.modelType) ) {
				try {
					const appResponse = await AppService.request.get(`/model/get/${id}?version=${mModelVersion.version}`);
					versionMeta = { ...versionMeta, ...Object.values(appResponse.data)[0] }
				} catch (e) {
					logger.info(`Base Model ID found, ID mismatch.`);
					throw new Error(`Base Model ${id} not found.`);
				}
			} else {
				const dbModelClass = MODEL[mBaseModel.modelType].dbModelClass;

				const model = await models[dbModelClass].findOne({
					where: {
						ModelVersionId: mModelVersion.id
					}
				});

	
				if ( !model ) {
					throw new Error(`No ${mBaseModel.modelType} Model found for Base Model ${mBaseModel.id} \
						and Model Version ${mModelVersion.id}`);
				}

	
				if ( shallow ) {
					if (mBaseModel.modelType === 'metabolic') {
						const {nmetabolites, nreactions, ngenes} = (await models.sequelize.query(
							"SELECT "+
							'	(SELECT COUNT(*) FROM "MetaboliteConstraintBasedModel" WHERE "MetaboliteConstraintBasedModel"."ConstraintBasedModelId" = "ConstraintBasedModels"."id") nmetabolites,  '+
							'	(SELECT COUNT(*) FROM "ReactionConstraintBasedModel" WHERE "ReactionConstraintBasedModel"."ConstraintBasedModelId" = "ConstraintBasedModels"."id") nreactions,  '+
							'	(SELECT COUNT(*) FROM "GeneConstraintBasedModel" WHERE "GeneConstraintBasedModel"."ConstraintBasedModelId" = "ConstraintBasedModels"."id") ngenes										'+
							'	FROM "ConstraintBasedModels" '+
							'	WHERE "ConstraintBasedModels"."id"= :id '
								, { 
												type: QueryTypes.SELECT, 
												replacements: { id: model.id },
								} 
						))[0];

						
						versionMeta.n_metabolites = parseInt(nmetabolites);
						versionMeta.n_reactions		= parseInt(nreactions);
						versionMeta.n_genes				= parseInt(ngenes);
					}
				} else {
					versionMeta	= { ...versionMeta, ...await getModelJSON(model.id, {
						BaseModelId: mBaseModel.id,
						VersionId: mModelVersion.id,
						slim,
						negateId,
						modelType: mBaseModel.modelType,
					}) };
				}
			}
			// }
	
			versionMeta.experimentMap = await (new Experiment(models)).getExperimentMap(mBaseModel.id, 'DRUG');
			versions.push(versionMeta);
		}

	}

	return versions;
}

const getBaseModelByVersionJSON = async (versionId, ...rest) => {
	const modelVersion = await models.ModelVersion.findByPk(versionId);
	if ( !modelVersion ) {
		throw new Error(`Unable to find Base ModelVersion with ID: ${versionId}.`);
	}
	return await getBaseModelJSON(modelVersion.modelid, ...rest);
}

const _negateId = (id, negateId) => (negateId ? parseInt(id) * -1 : id)

export const getBaseModelJSON = async (id, { version = null, shallow = true, slim = false, negateId = false } = { }) => {
		logger.info("Fetching Model JSON...");

		const mBaseModel = await models.BaseModel.findByPk(id+"");

		if ( !mBaseModel || mBaseModel._deleted ) {
			throw new Error(`Unable to find Base Model with ID: ${id}.`);
		}

		const versions					= await getModelVersionJSON(id, { version, shallow, slim, negateId });
		const defaultVersion	 	= versions.find(v => v.default);
		
		const coverImage = await getCoverImage(`${id}`);

		return {
			id:							_negateId(parseInt(mBaseModel.id), negateId),
			name:						mBaseModel.name,
			description:		mBaseModel.description,
			domainType:			mBaseModel.type,
			modelType:			mBaseModel.modelType,
			versions:				versions,
			defaultVersion:	defaultVersion ? _negateId(parseInt(defaultVersion.id), negateId) : null,
			_createdBy: 		mBaseModel._createdBy,
			_createdAt: 		mBaseModel._createdAt,
			_updatedBy: 		mBaseModel._updatedBy,
			_updatedAt: 		mBaseModel._updatedAt,

			coverImage:			coverImage,

			// extras...
			tags:						mBaseModel.tags,
			public:					mBaseModel.published,
			hash: 					(new Date()).getTime()+'003'
		};
}

router.get('/teach-catalog', AuthRequired, async (req, res) => {
	const response 	= new Response();

	try {
		const requestCategory = async category => {
			const appResponse = await AppService.requestWithToken(req).get(`/model/get`, {
				params: {
					category,
					domain: "learning",
					modelTypes: "boolean&metabolic",
					cards: 999,
				}
			})

			const data = appResponse.data;

			return data.reduce((prev, next) => ({ ...prev, [next.model.id]: next.model.name }), {})
		}

		const data = {
			my: await requestCategory("my"),
			published: await requestCategory("published"),
			shared: await requestCategory("shared")
		}
		
		// response.data = data;
		res.status(200).json(data)
	} catch (e) {
		logger.error(`Error while fetching models...`, e);
		response.setError(Response.Error.INTERNAL_SERVER_ERROR, `Internal Server Error: ${e}`);
	}

	res.status(response.code)
		 .json(response.json);
});


router.get("/:id", async (req, res) => {
	const response 	= new Response();
	
	const { id } 	= req.params;

	try {
		response.data = await getBaseModelJSON(id);
	} catch (e) {
		logger.error(e.message);

		response.setError(Response.Error.INTERNAL_SERVER_ERROR, `Unable to fetch Base Model with ID: ${id}: ${e.message}`)
	}

	res.status(response.code)
		.json(response.json);
});

path.extnameAll		= filename => {
	let extension   = null;

	if ( filename ) {
		extension = `.${filename.split(".").slice(1).join(".")}`;
	}

	return extension;
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const target = path.join(PATH.PRIVATE, "model", "uploads");
		mkdirp.sync(target);
	
		cb(null, target);
	},
	filename: (req, file, cb) => {
		const extension = path.extname(file.originalname);
		const filename	= `${generateHash()}${extension}`;

		logger.info(`Uploading File ${filename}...`);

		cb(null, filename);
	}
});

const storageConf = (type='', addPath=[], prefix='', root) => multer.diskStorage({
	destination: (req, file, cb) => {
		const target = path.join(!root ? PATH.PRIVATE : root, ...addPath);
		mkdirp.sync(target);	
		cb(null, target);
	},
	filename: (req, file, cb) => {
		const extension = path.extname(file.originalname);
		const filename	= `${prefix}${generateHash()}${extension}`;
		logger.info(`Uploading a ${type} File ${filename}...`);
		cb(null, filename);
	}
});

const upload = multer({ storage: storage });
const uploadTmp = multer({ storage: storageConf('Temporay', ['tmp', 'uploads'], 'tmp_') });
const uploadContext = multer({ storage: storageConf('Context Specific', ['context','inputs'], '', '/uploads') });

const getNewMAnnotationArr	= (annotation, attrs) => {
	const ret = [];
	for ( const source in annotation ) {
		const annotations = annotation[source];

		ret.push({
			source: source,
			annotations: Array.isArray(annotations) ? annotations : [annotations],
			...attrs
		});
	}
	return ret;
};

const getLastModelVersion = async (modelId) => {
	let lastModelVersion = await models.ModelVersion.findOne({
		where: {
			modelid: modelId
		},
		order: [ [ '_createdAt', 'DESC' ] ]
	});

	if ( !lastModelVersion ) {
		const allModelVersions = await models.ModelVersion.findAll({
			where: {
				modelid: modelId
			}
		});
		
		const version = 1;

		for ( const mModelVersion of allModelVersions ) {
			if ( mModelVersion.version > version ) {
				lastModelVersion = mModelVersion
			}
		}
	}

	return lastModelVersion
}

const _objectify	= (arr, fn) => {
	const objekt = { };

	for ( let i = 0, n = arr.length ; i < n ; ++i ) {
		const o 			= arr[i]; 
		const result 	= fn(o, i);

		for ( const key in result ) {
			objekt[key] = result[key];
		}
	}

	return objekt
}

const saveJSONModel 	= async (modelType, model, user) => {
	const settings = new SaveModelSettings({
		user,
		model,
		modelType,
		enableCache: true,
		enableLogging: true,
		enablePublish: false
	});
	let saveData = new SaveModel(models, null, settings);
	saveData = await saveData.saveJSON();
	return saveData.toJSON();
}

const ACCEPTED_MODEL_TYPES = ["boolean", "metabolic", "kinetic", "pharmacokinetic"];

router.get("/import/status", async (req, res) => {
	const response	= new Response();
	const { id } = req.query;
	try {
		const importData = await (new Tasks(models)).checkTask(id);
		if (importData.state == 'ERROR') {
			throw new Error(importData.failureMessage);
		}
		response.data	= {status: importData.state, id, result: JSON.parse(importData.resultData)};
	} catch(err) {
		response.setError(Response.Error.BAD_REQUEST, err.message);
	}
	return res.status(response.code).json(response.json);
});

router.post(
	"/import",
	upload.array("file"),
	async (req, res, next) => {
		logger.info(`Validating Files...`);

		const response	= new Response();

		const files			= req.files;

		if ( isEmpty(files) ) {
			logger.warn(`No files found while importing.`);
			response.setError(Response.Error.UNPROCESSABLE_ENTITY, `No files found. 
				Please upload valid model files using the parameter - file.`);
		}

		if ( !response.ok ) {
			res.status(response.code)
			   .json(response.json);
		} else {
			next();
		}
	},
	async (req, res) => {
		const response 	= new Response();

		const type	 		= req.body.type || "boolean";
		const { slim } 	= req.body;

		const user  		= req.user;

		logger.info(`Attempting to import model of type ${type}...`);

		if ( !ACCEPTED_MODEL_TYPES.includes(type) ) {
			response.setError(Response.Error.UNPROCESSABLE_ENTITY, `Unknown model type ${type}. 
				Must be either one of ${ACCEPTED_MODEL_TYPES}.`);
		} else {
			const files	= req.files;

			logger.info(`Files Found: ${files.map(f => f.originalname)}`);

			const importTask = new Tasks(models);
			let taskCreatedData = {name: null, id: null, state: null};
			try {
				const taskOptions = new StartTaskOptions();
				taskOptions.addJob = TASKS_JOB.IMPORT_SBML;
				taskOptions.addName = "Importing SBML file";
				taskOptions.addFiles = files.map(f => f.path);
				taskOptions.addExecutedBy = user.id;
				taskCreatedData = await importTask.startTask(taskOptions);
				response.data = { status: taskCreatedData.state, id: taskCreatedData.id };
			} catch(err) {
				response.setError(Response.Error.BAD_REQUEST, "Error on creating task: "+err.message);
			}

			new Promise( async (resolve, reject) => {
			const data = [];
			for ( const file of files ) {
				const result = { file: file.originalname,  modelType: type};
				try {
					if ( type == "boolean" ) {
						const form   = new FormData();
						const buffer = fs.createReadStream(file.path);

						// wait for buffer to load
						await new Promise((resolve, reject) => {
							buffer.on('ready', () => {
								resolve();
							});
							buffer.on('error', err => {
								reject(err);
							});
						});

						form.append("upload", buffer);

						try {
							const contentLength = await new Promise((resolve, reject) => {
								form.getLength((err, length) => {
									if (err) { reject(err) } else { resolve(length)}
								})
							});
							const appResponse = await AppService.requestWithToken(req).post("model/import", form, {
								headers: {
									...form.getHeaders(),
									"Content-Length": contentLength,
								}
							});
							if ( appResponse.status == 200 ) {
								result.status = "success";
								result.data		= appResponse.data;
								result.modelId = '-1/-1';
							} else {
								result.status	= "error";
							}
						} catch (e) {
							const appResponse 	= e.response;
							
							logger.error(`Importing model from App Service failed.`);
							logger.error(`Response from App: ${JSON.stringify(appResponse.data)}`);

							// TODO: Display Error Response
							result.status 		= "error";
							result.error		= appResponse.data;
						}
					} else
					if (["metabolic", "kinetic"].includes(type)) {
						logger.info(`Notifying User...`);

						notify(`model:import`, {
							type: "info",
							message: `Importing ${file.originalname} in progress. We will notify you once it's available in your account.`
						}, { user });

						const doTask = async (done) => {
							try {
								let	  filePath  = file.path;
								const	  extension = path.extname(file.originalname);
								let   fileType	= null;
								
								logger.info(`Importing Model of extension type: ${extension}`);
		
								if ( filePath.endsWith(".gz") || filePath.endsWith(".gzip") ) {
									logger.info(`Reading File ${filePath}...`);
									const buffer	 = fs.readFileSync(filePath);
									const tempFile = tmp.fileSync();
									logger.info(`Unzipping File ${filePath}...`);
									const data		 = pako.ungzip(buffer, { to: "string" });
		
									logger.info(`Writing File to disk...`);
									fs.writeFileSync(tempFile.name, data);
		
									filePath       = tempFile.name;
								}
								
								if ( [".xml", ".sbml"].map(e => extension.includes(e)).some(Boolean) ) {
									fileType = "sbml";
								} else
								if ( extension.includes(".json") ) {
									fileType = "json";
								} else
								if ( [".yml", ".yaml"].map(e => extension.includes(e)).some(Boolean) ) {
									fileType = "yaml";
								} else
								if ( extension.includes(".mat") ) {
									fileType = "matlab";
								} else {
									logger.error(`Unknown file extension ${extension} while attempting to process a metabolic model.`);
									
									result.status = "error";
									result.error  = `Unknown file type provided for type ${type}. Must be .xml, .sbml, .json, .yaml or .mat`;
								}
		
								logger.info(`File Type found: ${fileType}`)
								logger.info(`File Path: ${filePath}`);

								result.fileType = fileType;
		
								if ( fileType ) {
									try {
										const sanitizeOutput = (output) => {
											output = output.replace( /: Infinity/g,  ': "Infinity"');
											output = output.replace(/: -Infinity/g, ': "-Infinity"');
											
											// if JSON attributes contain single qoutes replace them with double qoutes
											// to comply with syntax
											const regex = /('(?=(,\s*')))|('(?=:))|((?<=([:,]\s*))')|((?<={)')|('(?=}))|(?<=\[)'|'(?=\])/g;
											output = output.replace(regex, '"');

											// Attempt to hide unncessary string buffers...
											const index = output.indexOf("{");
		
											if ( index !== -1 ) {
												output = output.substring(index);
											}
											return output;
										};
		
									
										let output = "{}"
										let parsed = {name: "unnamed"}

										if (type == 'metabolic') {
												const form   = new FormData();
												const buffer = fs.createReadStream(filePath);
												const resultPath = path.join("/uploads/imports", generateHash()+".json" );
												await new Promise((resolve, reject) => {
													buffer.on('ready', () => {
														resolve();
													});
													buffer.on('error', err => {
														reject(err);
													});
												});
												form.append("file", buffer);
												form.append("file_type", fileType);
												form.append("output_type", "json");
												form.append("result_path",  resultPath);												
												output = await AnalysisService.request.post(`metabolic/import`, form, {
													headers: form.getHeaders()
												}).then(res => {
													const dict_dump = sanitizeOutput(res.data);
													const dict_dump_without_nan = dict_dump.replace(/NaN/g, 'null');
													const final_dict = JSON.parse(dict_dump_without_nan)
													return final_dict
												});

												parsed 	= output

												const modelNameWithoutFileExt = result.file.substring(0, result.file.lastIndexOf("."))
												parsed.name		= parsed.name || modelNameWithoutFileExt;
										} else if (type == 'kinetic') {
												const kineticForm   = new FormData();
												const kineticBuffer = fs.createReadStream(filePath);
												const kineticResultPath = path.join("/uploads/imports", generateHash()+".json" );
												await new Promise((resolve, reject) => {
													kineticBuffer.on('ready', () => {
														resolve();
													});
													kineticBuffer.on('error', err => {
														reject(err);
													});
												});
												kineticForm.append("file", kineticBuffer);
												kineticForm.append("file_type", fileType);
												kineticForm.append("result_path",  kineticResultPath);

												await AnalysisService.request.post(`kinetic/import`, kineticForm, {
													headers: kineticForm.getHeaders()
												});

												output = fs.readFileSync(kineticResultPath, (err) => {
													logger.error(err)
												});

												parsed 	= JSON.parse(output.toString('utf8'));
												const modelNameWithoutFileExt = result.file.substring(0, result.file.lastIndexOf("."))
												parsed.name		= parsed.name || modelNameWithoutFileExt;
										}

										logger.info(`Saving JSON model ${parsed.name} to DataBase...`);
										const mBaseModel = await saveJSONModel(type, parsed, req.user);
										// const mBaseModel = {}
										// logger.info("Fetching Base Model JSON...");
										// const data		= await getBaseModelJSON(model.id, { shallow: false, slim, negateId: false });

										result.modelId = mBaseModel.id;
										notify('model:import', { type: "success", message: `${file.originalname} is now avaialble.`,
											data: { id: mBaseModel.id } }, { user });
									} catch (e) {
										let errorMessage = `Unable to import model ${file.originalname}: ${e}`;										
										result.error = errorMessage;
										result.status = "error";
										logger.info(errorMessage);
										notify('model:import', { type: "error", message: errorMessage}, { user });
									}
									importTask.finishTask(taskCreatedData.id, [result], result.status == "error" ? result.error : null, result.error == "success" && true);
								}
							} catch (e) {
								logger.info(`Unable to import model: ${e}`);
			
								notify('model:import', { type: "error", message: `Unable to import model: ${e}`}, { user })
							} finally {
								done();
							}
						}

						// doTask();
						addToQueue(doTask);

						// result.status = "success";
					} else if (["pharmacokinetic"].includes(type)) {
						logger.info('Notifying user...')
						
						notify(`model:import`, {
							type: "info",
							message: `Importing ${file.originalname} in progress. We will notify you once it's available in your account.`
						}, { user });

						const importTask = async (done) => {
							try {
								const form   = new FormData();
								const buffer = fs.createReadStream(file.path);

								// wait for buffer to load
								await new Promise((resolve, reject) => {
									buffer.on('ready', () => {
										resolve();
									});
									buffer.on('error', err => {
										reject(err);
									});
								});

								form.append("file", buffer);

								try {
									const response = await AnalysisService.request.post(`${type}/import`, form, {
										headers: form.getHeaders()
									});
									
									if ( response.status == 200 ) {
										result.status 	= "success";
										result.data		= response.data;
										const mBaseModel = await saveJSONModel(type, response.data , req.user);
										result.modelId = mBaseModel.id;
										notify('model:import', { type: "success", message: `${file.originalname} is now avaialble.`,
											data: { id: mBaseModel.id } }, { user });
									} else {
										result.status	= "error";
									}
								} catch (e) {
									const appResponse 	= e.response;
									
									logger.error(`Importing model from Analysis Service failed.`);
									logger.error(`Response from App: ${JSON.stringify(appResponse.data)}`);
									result.status 		= "error";
									result.error		= appResponse.data;
								}
								importTask.finishTask(taskCreatedData.id, [result], result.status == "error" ? result.error : null, result.error == "success" && true);
							} catch(e) {
								logger.info(`Unable to import model: ${e}`);
			
								notify('model:import', { type: "error", message: `Unable to import model: ${e}`}, { user })
							} finally {
								done();
							}
						}

						addToQueue(importTask)

						// result.status = "success"
					}
				} catch (e) {
					logger.error(`Unable to import model file ${file.path} of type ${type}: ${e}`);

					result.status 	= "error";
					result.error	= e.message;
				}

				data.push(result);
			}

			const isError = data.map(r => r.status == "error").every(Boolean);
	
			if ( isError ) {
				return reject(`Unable to read any file provided.`);
			}
			resolve(data);
			}).then(success => {
				if (type == "boolean") {
					importTask.finishTask(taskCreatedData.id, success, null, true);
				}				
			}).catch(err => {
				logger.error(err);
				importTask.finishTask(taskCreatedData.id, null, `${err}`);
			});
		}

		res.status(response.code)
		   .json(response.json);
});

// end import

// export

const EXPORT_FILE_EXTENSIONS = Seq(ModelType)
	.map(modelValue =>
		Seq(modelValue.exportTypes)
			.map((exportValue, exportType) => ({
				type: exportType,
				extension: exportValue.defaultExtension
			}))
			.toArray()
	)
	.toArray()
	.flat()
	.reduce((prev, next) => ({ ...prev, [next.type]: next.extension }))

const constraintBasedModelJSONtoCobraPyJSON = (metabolic, id) => {
	const data 	= { };
	buildMetabolicModelJSON(metabolic);
	
	if (id) {
		data.id = `${id}`;
	} else {
		data.id	= `${metabolic.id}`;
	}

	if ( metabolic.name ) {
		data.name	= metabolic.name;
	}

	function arrayToObject(arr) {
		return arr.reduce((acc, obj) => {
			acc[obj.id] = obj;
			return acc;
		}, {});
	}

	const annotationsObj = metabolic.annotations  ? arrayToObject(metabolic.annotations) : {}
	const compartments = { };
	let subsystemsIdNameMap = {};
	if(metabolic.subsystems.size > 0){
		for(const s of Object.values(metabolic.subsystems)) {
			subsystemsIdNameMap = {...subsystemsIdNameMap ,[`${s.id}`] : s.name}
		}		
	}


	const mapIdToCompartment = {};
	for ( const c of metabolic.compartments ) {
		mapIdToCompartment[`${c.id}`] = c.compartmentId || c.name;
		compartments[`${c.compartmentId || c.name}`] = c.name;
	}
	data.compartments = compartments;

	const pageObj = JSON.parse(JSON.stringify(metabolic.pageMap));
	const pageMap = Object.keys(pageObj).map(key => {
		return {
			pageId: key,
			...pageObj[key]
		};
	});
	data.pageMap = pageMap;

	const sectionObj = JSON.parse(JSON.stringify(metabolic.sectionMap));
	const sectionMap = Object.keys(sectionObj).map(key => {
		return {
			sectionId: key,
			...sectionObj[key]
		};
	});
	data.sectionMap = sectionMap;

	const contentObj = JSON.parse(JSON.stringify(metabolic.contentMap));
	const contentMap = Object.keys(contentObj).map(key => {
		return {
			contentId: key,
			...contentObj[key]
		};
	});
	data.contentMap = contentMap;

	const referenceMapObj = JSON.parse(JSON.stringify(metabolic.referenceMap));
	const referenceMap = Object.keys(referenceMapObj).map(key => {
		return {
			referenceId: key,
			...referenceMapObj[key]
		};
	});
	data.referenceMap = referenceMap;

	const pageReferenceMapObj = JSON.parse(JSON.stringify(metabolic.pageReferenceMap));
	const pageReferenceMap = Object.keys(pageReferenceMapObj).map(key => {
		return {
			pageReferenceId: key,
			...pageReferenceMapObj[key]
		};
	});
	data.pageReferenceMap = pageReferenceMap;

	data.modelReferenceIds = metabolic.modelReferenceIds.referenceIds

	const contentReferenceMapObj = JSON.parse(JSON.stringify(metabolic.contentReferenceMap));
	const contentReferenceMap = Object.keys(contentReferenceMapObj).map(key => {
		return {
			referenceId: key,
			...contentReferenceMapObj[key]
		};
	});
	data.contentReferenceMap = contentReferenceMap;

	const metabolites = [];
	for ( const m of metabolic.metabolites ) {
		const metabolite = {
			metaboliteId:   `${m.id}`,
			id:           m.speciesId || `${m.id}`, // speciesId is missing in models created on cellcollective
			name:					m.name,
			formula:			m.formula,
			compartmentId:	`C_${m.compartment}`,
			compartment:	mapIdToCompartment[`${m.compartment}`],
			charge:				m.charge
		};
		
		if ( m.annotations ) {
			metabolite.annotation = { };
			for ( const annotation of m.annotations ) {
				if(typeof annotation == 'number'){
					const annotationObj = annotationsObj[`${annotation}`];
					metabolite.annotation[`${annotationObj.source}`] = annotationObj.annotations;					
				} else {
					metabolite.annotation[annotation.source] = annotation.annotations;
				}
			}
		}

		metabolites.push(metabolite);
	}

	data.metabolites 	= metabolites;

	const reactions		= [ ];

	for ( const r of metabolic.reactions ) {
		const reaction 	= {
			id:											r.reactionId || r.name, // reactionId is only defined for imported models TODO: user should be probably able to set this?
			reactionId: 						r.id,
			name:										r.name,
			lower_bound:						parseFloat(r.lowerBound || '0'),
			upper_bound:						parseFloat(r.upperBound || '0'),
			objective_coefficient: 	r.objectiveCoefficient,
			subsystem:							subsystemsIdNameMap[r.subsystem]
		};

		reaction.metabolites = { };
		for ( const metabolite in r.metabolites ) {
			const stoichiometry = r.metabolites[metabolite];
			const rMetabolite = metabolic.metabolites.find(m => `${m.id}` == `${metabolite}`)
			const rMetaboliteId = rMetabolite.speciesId || rMetabolite.id // speciesId is not defined for models created in cellcollective
			reaction.metabolites[`${rMetaboliteId}`] = stoichiometry;
		}

		if ( r.annotations ) {
			reaction.annotation = { };
			for ( const annotation of r.annotations ) {
				if(typeof annotation == 'number'){
					const annotationObj = annotationsObj[`${annotation}`];
					reaction.annotation[`${annotationObj.source}`] = annotationObj.annotations;					
				} else {
					reaction.annotation[annotation.source] = annotation.annotations;					
				}
			}
		}

		const regulators 		= metabolic.regulators
			.filter(regulator => `${regulator.reaction}` == `${r.id}`);
		const regulatorIds	= regulators.map(r => `${r.id}`)
		const conditions 		= metabolic.conditions
			.filter(condition => regulatorIds.includes(`${condition.regulator}`));

		const conditionIds	= conditions.map(c => `${c.id}`)

		const subConditions  = metabolic.subConditions
		  .filter(subcondition => conditionIds.includes(`${subcondition.conditionId}`));

		const geneIds				= regulators
			.map(regulator => `${regulator.gene}`)

		// include genes in conditions  of the regulator
		conditions.forEach(c => {
			const ids= c.genes.map(g => `${g}`)
			geneIds.push(...ids ) 
		})
		// include genes in subConditions of the condition
		subConditions.forEach(c => {
			const ids= c.genes.map(g => `${g}`)
			geneIds.push(...ids ) 
		})
		
		const genes					= metabolic.genes
			.filter(gene => geneIds.includes(`${gene.id}`))

		const constructs 	= { absentState: false };
		constructs.components	= genes
		.reduce((prev, next) => ({ ...prev, [`${next.id}`]: { name: `${next.speciesId}` }}), { })
		constructs.regulators	= regulators
			.reduce((prev, next) => {
				const id					= `${next.id}`

				const rConditions	= conditions
					.filter(({ regulator }) => `${regulator}` == `${id}`)
					.map(({ id, state, type, speciesRelation, subConditionRelation, genes }) => {
						const sSubConditions = subConditions.filter(({conditionId}) => `${conditionId}` == `${id}`)
						return {
              state: state == "ON" ? true : false,
              type: type == "IF_WHEN" ? true : false,
              componentRelation: speciesRelation == "AND" ? true : false,
              components: genes.map(g => `${g}`),
							subConditionRelation:  subConditionRelation == "AND" ? true : false,
              conditions: sSubConditions.map(({state, type, speciesRelation, genes}) => ({
								state: state == "ON" ? true : false,
								type: type == "IF_WHEN" ? true : false,
								componentRelation: speciesRelation == "AND" ? true : false,
								components: genes.map(g => `${g}`),
							}) )
            };
					})

				const regulator		= {
					component: `${next.gene}`,
					type: next.type == "POSITIVE" ? true : false,
					conditionRelation: next.conditionRelation == "AND" ? true : false,
					conditions: rConditions
				}

				return { ...prev, [id]: regulator }
			}, { })
		let gene_reaction_rule = BooleanAnalysis.fromBiologicalConstructs(constructs);
		gene_reaction_rule = gene_reaction_rule.replace(/\*/g, " and ")
		gene_reaction_rule = gene_reaction_rule.replace(/\+/g, " or ")
		gene_reaction_rule = gene_reaction_rule.replace(/\~/g, " not ")

		reaction.gene_reaction_rule = gene_reaction_rule;

		reactions.push(reaction);
	}

	data.reactions	 	= reactions;

	const genes				= [ ];

	for ( const g of metabolic.genes ) {
		const gene = {
			id: 			`${g.speciesId}`,
			geneId:		g.id,
			name: 		g.name,
			knockOut: g.knockOut || false
		}

		if (g.annotations) {
			gene.annotation = {};
			for (const annotation of g.annotations) {
				if (typeof annotation == 'number') {
					const annotationObj = annotationsObj[`${annotation}`];
					gene.annotation[`${annotationObj.source}`] = annotationObj.annotations;
				} else {
					gene.annotation[annotation.source] = annotation.annotations;
				}
			}
		}

		genes.push(gene);
	}

	data.genes				= genes;

	data.objective		= metabolic.objective || [ ];

	return data;
}

const makeExportDir = () => {
	const pathExport 	= path.join(PATH.PRIVATE, "model", "exports");
	mkdirp(pathExport);

	return pathExport;
}

const exportModel 		= async (id, version, type, exportDir) => {

	let pathModel;
	const mBaseModel		= await models.BaseModel.findByPk(id);

	if ( !mBaseModel ) {
		throw new Error(`Base Model with ${id} not found.`);
	}

	const mModelVersion	= await models.ModelVersion.findOne({
		where: { modelid: mBaseModel.id, version: version }
	});

	if ( !mModelVersion ) {
		throw new Error(`Model Version with ${version} for Base Model ${id} not found.`)
	}

	const mConstraintBasedModel = await models.ConstraintBasedModel.findOne({
		where: { ModelVersionId: mModelVersion.id }
	});

	if ( !mConstraintBasedModel ) {
		throw new Error(`No Constraint-Based Model found for Model Version ${version} of Base Model ${id} found.`);
	}

	const metabolic	= await getModelJSON(mConstraintBasedModel.id, {
		modelType: 'metabolic',
		BaseModelId: id,
		VersionId: mModelVersion.id
	});


	if (['sbml','json'].includes(type) ) {
		if ('genes' in metabolic) {
			const genesCbm = Seq(metabolic.genes);
			let genesNum = 1;
			genesCbm.forEach((g, k) => {
				const equalSpecies = genesCbm
						.filter(vl => vl.id != g.id && vl.speciesId == g.speciesId).count();
				if (equalSpecies) {
					metabolic.genes[k].speciesId = `${g.speciesId}${genesNum}`;
					genesNum++;
				}
			})
		}
	}

	const modelData = constraintBasedModelJSONtoCobraPyJSON(metabolic, id);

	try {
		const analysisResponse = await AnalysisService.request.post("export", {
			model_data: JSON.stringify(modelData, null, 2),
			output_type: type,
			export_dir: exportDir
		});
		pathModel = analysisResponse.data.result_path;
	} catch(err) {
		logger.error(`Unable to export with the provided arguments: ${[type, modelData].join(' ')}: ${err}`);
		err.message = `Error exporting. ${err.message}`;
		throw err;
	}

	if (!pathModel) {
		throw new Error("Exported file does not have a valid path");
	}

	return pathModel;
}

router.get("/:id/export/version/:version",
	async (req, res) => {
		const response = new Response();

		const { id, version }	= req.params;

		let sent = false;
		let pathModel = null;

		try {
			const type 			= req.query.type || "sbml";
			const modelType = req.query.modeltype;
			
			if (!modelType) {
				throw "Model type is required!";
			}

			const mVersion = await models.ModelVersion.findOne({
				where: ['metabolic', 'kinetic'].includes(`${modelType}`.toLowerCase()) ? { modelid: id, version} : {id, version}
			});
			if ( !mVersion ) {
				const errStr =`Cannot find model version information for Model ID ${id} (ver. ${version}).`;
				response.setError(Response.Error.NOT_FOUND, errStr)
			} else {
				const mBaseModel 	= await models.BaseModel.findByPk(mVersion.modelid);
				if ( !mBaseModel ) {
					logger.info(`Base Model with ID: ${id} not found.`);
					response.setError(Response.Error.NOT_FOUND, `Model ID ${id} not found.`)
				} else 
				if ( type == "KB" ) {
					logger.info(`Exporting Knowledge Base for model ${id}...`);

					const modelJSON 	= await getBaseModelJSON(id, { version });
					const versionData = modelJSON.versions[0];

					const sanitizeText = t =>
						t.replace(/<[^>]*>?/gm, "") // html 
						 .replace(/(\\r\\n|\\n|\\r)/gm, " ") // \r\n -> "\n"
						 .replace(/\t/gm, " ") // \t -> " "
						 .replace(/&nbsp;/gm, " ") // &nbsp; -> " "
						 .replace(/&amp;/gm, "&") // &amp; -> "&"
						 .replace(/  +/g, " ") // "     " -> " "
						 .trim()

					const data = Object.entries(versionData.speciesMap)
						.reduce((prev, [speciesId, speciesMeta]) => ({
							...prev,
							[speciesMeta.name]:
								Object.entries(versionData.sectionMap)
									.filter(([_, sectionMeta]) => versionData.pageMap[sectionMeta.pageId].speciesId == speciesId)
									.reduce((prev, [sectionId, sectionMeta], i) => ([
										...prev,
										{
											name: "References",
											position: Number.MAX_VALUE,
											data:
												Object.values(versionData.pageReferenceMap)
													.filter(o => versionData.pageMap[o.pageId].speciesId == speciesId)
													.map(		o => versionData.referenceMap[o.referenceId])
													.map(		o => o.pmid || o.doi)
										},
										{
											name: sectionMeta.type,
											position: sectionMeta.position,
											data:
												Object.entries(versionData.contentMap)
													.filter(([contentId, contentMeta]) => contentMeta.sectionId == sectionId)
													.map(	  ([contentId, contentMeta]) => ({ title: sanitizeText(contentMeta.title || ""), contentId: parseInt(contentId), position: contentMeta.position, text: sanitizeText(contentMeta.text) }))
													.sort((a, b) => a.position - b.position)
													.map(   v => ({
														title: v.title || sectionMeta.title,
														text: v.text,
														references:
															Object.values(versionData.contentReferenceMap)
																.filter(o => o.contentId == v.contentId)
																.map(o => {
																	const  reference = versionData.referenceMap[`${o.referenceId}`]
																	return reference.pmid || reference.doi;
																})
																.filter(o => o)
													}))
											},
									]), [])
									.sort((a, b) => a.position - b.position)
									.reduce((prev, { name, data }) => ({
										...prev,
										[name]: name == "References" ? [data.join(", ")] : prev[name]? [].concat(prev[name], data) : data
									}), {})
						}), {});

					const components = Object
						.keys(data)
						.sort((a, b) => a.localeCompare(b));

					const results = 
						Object.entries(
							Object.entries(
								Object.entries(data)
									.reduce((prev, [componentName, componentMeta]) => ({
										...prev,
										...Object.entries(componentMeta)
												.reduce((prev, [entryName, entryMeta]) => ({
													...prev,
													[`${componentName}__SEP__${entryName}`]: entryMeta
												}), {})
									}), {})
							)
							.reduce((prev, [entryName, entryMeta], i) => ({
								...prev,
								...entryMeta
										.reduce((prev, next, i) => ({
											...prev,
											[`${entryName}__SEP__${i}`]: next
										}), {})
							}), {})
						)
						.map(([key, componentMeta]) => {
							const [componentName, sectionName, position] = key.split("__SEP__");
							let row = { Component: componentName } // [sectionName]: componentMeta.text || componentMeta, position: parseInt(position) }

							if ( componentMeta.title ) {
								row = { ...row, [`title:${sectionName}`]: componentMeta.title }
							}

							row = { ...row, [sectionName]: componentMeta.text || componentMeta, position: parseInt(position) }

							if ( !isEmpty(componentMeta.references) ) {
								const references = componentMeta.references.join(", ")
								row = { ...row, [`references:${sectionName}`]: references }
							} else {
								if ( sectionName !== "References" ) {
									row = { ...row, [`references:${sectionName}`]: "__BLANK__" }
								}
							}

							return row;
						})

					const fields = new Set();
					const rows 	 = [ ];

					for ( const component of components ) {
						const componentsMeta = results
							.filter(e => e.Component == component)
							.sort((a, b) => a.position - b.position);

						if ( componentsMeta.length ) {
							const maxPosition = componentsMeta[componentsMeta.length - 1].position;
							
							let row = { }

							for ( let i = 0 ; i <= maxPosition ; ++i ) {
								const positionsMeta = componentsMeta
									.filter(e => e.position == i);
	
								for ( const positionMeta of positionsMeta ) {
									row = { ...row, ...positionMeta }
									delete row.position;
	
									for ( const field of Object.keys(row) ) {
										fields.add(field);
									}
								}
	
								rows.push(row);
							}
						}
					}

					const final  	= [ ];
					const textMap = { };

					for ( const row of rows ) {
						for ( const key in row ) {
							const value = row[key];

							if ( key in textMap ) {
								const values = textMap[key];

								if ( values.includes(value) ) {
									if ( !key.startsWith("references") ) {
										row[key] = ""
									}
								} else {
									textMap[key].push(value);
								}
							} else {
								textMap[key] = new Array();
								textMap[key].push(value);
							}

							if ( row[key] == "__BLANK__" ) {
								row[key] = ""
							}
						}

						final.push(row);
					}

					const parser = new json2csv.Parser({ fields: Array.from(fields) });
					const csv    = parser.parse(final);
					
					res.status(response.code)
						.send(Buffer.from(csv));

					sent = true;
				} else
				if ( mBaseModel.modelType == "metabolic" ) {
					pathModel = await exportModel(id, version, type);
					logger.info(`Successfully exported model. Dispatching ${pathModel}.`)
				} else
				if ( mBaseModel.modelType == "kinetic" ) {
					pathModel = await exportKineticModel(getModelJSON, id, version, type, EXPORT_FILE_EXTENSIONS);
					logger.info(`Successfully exported Kinetic Model. Dispatching ${pathModel}.`)
				}
				else {
					const pathExport = '/uploads/exports/sbml';
					if (!fs.existsSync(pathExport)) {
						fs.mkdirSync(pathExport, { recursive: true });
					}
					pathModel = path.join(pathExport, `${generateHash()}${EXPORT_FILE_EXTENSIONS[type]}`);

					let exportingAsync = new Promise(async (done, exportReject) => {
						try {
							const appResponse = await AppService.requestWithToken(req).get(`model/export/${id}?version=${version}&type=${`${type}`.toUpperCase()}`, {
								responseType: "stream"
							});

							const writeStream = fs.createWriteStream(pathModel);
							appResponse.data.pipe(writeStream);

							await new Promise((resolve, reject) => {
								writeStream.on('finish', resolve);
								writeStream.on('error', reject);
							});
							done(true);
						} catch(err) {
							exportReject(err);
						}
					});
					const pingSbmlName = `${pathModel}`.split('/')[4];
					exportingAsync.then(() => {
						fs.writeFileSync(`${pathExport}/ok_${pingSbmlName}.txt`, `Model:${id};Type:${type}`, 'utf8');
						logger.info(`File ${type} generated during model export: ${id}`);
					}).catch((exportError) => {
						logger.error(`Unable generate file ${type} during model export ${id}: ${exportError}`);
					});
					return res.status(response.code).json({ping: pingSbmlName});
				}

				if ( !sent ) {
					res.status(response.code)
						 .sendFile(pathModel);
				}
			}
		} catch (e) {
			logger.error(`Unable to export model ${id}: ${e}.`);
			response.setError(Response.Error.INTERNAL_SERVER_ERROR, `Unable to export model ${id}: ${e}.`);
		}

		if ( !response.ok ) {
			res.status(response.code)
			   .json(response.json);
		}
});

// router.put("/:id", AuthRequired,
// 	async (req, res) => {
// 		const response 	= new Response();
// 		const { id } 		= req.params;
// 		const { model } = req.body;

// 		try {
			
// 		} catch (e) {
// 			logger.info(`Unable to save model.`);
// 		}

// 		res.status(response.code)
// 			 .json(response.json);
// 	}
// )

// end export
router.post("/analyse",
	async (req, res) => {
	const response 	= new Response();

	const { type: analysisType, model, parameters } = req.body;

	if (["metabolic", "kinetic"].includes(model.modelType)) {
		try {
			const tempfile = tmp.fileSync();

			let data = {};
			let res = null;
			switch (model.modelType) {
				case "metabolic":
					data = constraintBasedModelJSONtoCobraPyJSON(model);
					res = await AnalysisService.request.post(`/metabolic/analyze/${analysisType}`, {
						model: data,
						parameters: parameters
					});
					break;
				case "kinetic":
					res = await AnalysisService.request.post(`/kinetic`, {
						model: model,
						parameters: parameters
					});
					break;
				default:
					break;
			}

			logger.info(`Writing Metabolic Model JSON to temporary file...`);

			fs.writeFileSync(tempfile.name, JSON.stringify(data), "utf8");

			logger.info(`Response recieved from CCPy...`)
			
			if(res.status == 200){
				const result = res.data;
				response.data = result;
			}
			else{
				response.setError(Response.Error.INTERNAL_SERVER_ERROR, res.data);
			}
			
		} catch (e) {
			logger.info(`Error performing analysis: ${e}`);
			response.setError(Response.Error.INTERNAL_SERVER_ERROR, e);
		}
	} else {
		response.setError(Response.Error.UNPROCESSABLE_ENTITY, `Invalid argument for type ${type}`);
	}

	res.status(response.code)
	   .json(response.json);
});

/**
 * @route /api/model/cards/teaching
 */
 router.get("/cards/:domain", async (req, res) => {
	//	const appResponse = (await AppService.request.get(`/model/cards/${req.params.domain}`, {
		const domain = req.params.domain === "teaching" ? "learning" : req.params.domain;
		//const onlyPublic = req.query.onlyPublic == 'false' ? false : true;
		let isAdmin = false;
		if (req.user) {
			isAdmin = (await models.authority.findOne({
				where: {
					user_id: req.user && req.user.id,
					role_id: 4 /* ADMIN */
				}
			})) !== null;
		}

		if (req.query.id && !parseInt(req.query.id)) {
			req.query.id = null;
		}

		if (req.query && req.query.category === "published" && !req.query.id) {
			const key = `cards:${domain}:published:${req.query.modelTypes}:${req.query.cards}:${req.query.orderBy}:${isAdmin}`
			if (cache.exists(key)) {
				const cachedData = await loadDataFromCache(key);
				if (cachedData) {
					res.status(200).json(cachedData);
					return;
				}
			}
		}


		if(req.query && (req.query.category === "my" || req.query.category === "shared") && !req.user) {
			//  user is  not authenticated
			const response = new Response()
			response.setError(Response.Error.UNAUTHORIZED, "Sign In required.");
							res.status(response.code)
								.json(response.json);
      return;
		}
	
		try{
			let appResponse = (await AppService.requestWithToken(req).get(`/model/get`, {
				params: {
					...req.query,
					domain,
					mCourseId: req.query.courseId
				}
			})).data;
	
			const modelversion = {key: 0};

			for (const [index, {model: {id, modelVersionMap, modelType}}] of appResponse.entries()) {
				const newVersionMap = await filterModelVersionsForCards(id, modelVersionMap, modelType);		
				Seq(newVersionMap).forEach((v, k) => {
					if (v.selected == true) {
						appResponse[index].model.biologicUpdateDate = v.updatedAt || null;
						modelversion.key = appResponse[index].model.selectedVersion = k;
					}
				});
				appResponse[index].model.modelVersionMap = newVersionMap;
				await (new Metadata(models)).defineMetadataValues(appResponse, index, id, modelversion.key);
			}

			//map data
			appResponse = await Promise.all(appResponse.map(async (data, key) => {
				const {model: {modelType, id}} = data;
				const isSubLesson = await isSubmittedLesson(id, modelversion.key);
				if (isSubLesson) {
					data.modelPermissions = {
						delete: true,
						edit: false,
						publish: false,
						share: false,
						view: true
					};
				}
	
				if(modelType !== undefined && modelType === "boolean"){
					req.query.id && (data.requestedId = req.query.id);
					return data;
				}
				return await getBaseModelByVersionJSON(id, { shallow: true });
			}));
	
			//add cover images
			appResponse = await Promise.all(
				appResponse.map(async e => {
					e.coverImage = await getCoverImage(`${e?.id || e?.model?.id}`)
					return e;
				})
			)
			if (req.query && req.query.category === "published" && !req.query.id) {
				const key = `cards:${domain}:published:${req.query.modelTypes}:${req.query.cards}:${req.query.orderBy}:${isAdmin}`
				await saveDataToCache(key, appResponse, 3600);
			}
			res.status(200).json(appResponse);
		}	catch (e) {
			const response 	= new Response();
			response.setError(Response.Error.INTERNAL_SERVER_ERROR, new Error(e.toString()));
			res.status(response.code)
						.json(response.json);
			logger.info(`Error performing error: ${e}`);
		}
	
});

router.get("/", async (req, res) => {
	const response 	  = new Response();
	const user        = req.user || { };
	const { minimal } = req.body;

	try {
		const appResponse 	= await AppService.requestWithToken(req).get("/model/get");
		let data						= [ ];

		if ( appResponse.data ) {
			let boolean				= appResponse.data;
			
			boolean						= await Promise.all(boolean.map(async m => {
				m.modelType 		= "boolean";

				m.coverImage = await getCoverImage(`${m.model.id}`);

				return m
			}));

			data = data.concat(boolean);

			const conditions 	= { or: { } };

			if ( !isEmpty(user) ) {
				conditions.or._createdBy = user.id;
			}
			
			const mModels			= await models.BaseModel.findAll({
				where: {
					[Op.and]: {
						modelType: ["metabolic", "Specieskinetic"],
						 _deleted: [false, null]
					},
					[Op.or]: {
						published: true,
						...conditions.or
					}
				}
			});

			for ( const m of mModels ) {
				try {
					data = data.concat(await getBaseModelJSON(m.id, { shallow: true }))
				} catch (e) {
					logger.error(`Error fetching Base Model: ${m.id}`);
				}
			}
		} else {
			// TODO: Error
		}

		response.data = data;
	} catch (e) {
		logger.error(`Error while fetching models...`, e);
		response.setError(Response.Error.INTERNAL_SERVER_ERROR, `Internal Server Error: ${e}`);
	}

	res.status(response.code)
		 .json(response.json);
});

router.get("/:id/version/:version", async (req, res) => {
	const response = new Response();
	const user = req.user;
	const { id, version, hash } = req.params;
	const { slim, domain, modeltype, courseId } = req.query;

	if (version == undefined) {
		response.setError(Response.Error.NOT_FOUND, `No such version ${id}:${version}`);
		res.status(response.code).json(response.json);
		return;
	}

	const mversion = await models.ModelVersion.findOne({
		where: domain === 'research' && ['metabolic', 'kinetic', 'pharmacokinetic'].includes(modeltype) ? { modelid: id, version} : {id, version}
	});

	if (mversion === null) {
		response.setError(Response.Error.NOT_FOUND, `No such model ${id}:${version}`);
		res.status(response.code).json(response.json);
		return;
	}

	const mBaseModel = await models.BaseModel.findByPk(mversion.modelid);
	if (!mBaseModel || mBaseModel._deleted) {
		response.setError(Response.Error.NOT_FOUND, `No such model by PK ${id}:${version}`);
		res.status(response.code).json(response.json);
		return;
	}

	const mCourseId = Number(courseId || 0);

	if (!mBaseModel.published && !mCourseId) {
		if (user && parseInt(mBaseModel.userid, 10) !== user.id && parseInt(mBaseModel._createdBy, 10) !== user.id) {
			let notAllowed = true;
			if (mBaseModel.type == 'learning') {
				const checkCourse = await (new Course(models).getCoursesByModelLearning(mBaseModel.id, user.id));
				notAllowed = checkCourse.length ? false : true;
			}
			if (notAllowed) {
				const checkShared = await (new ModelPermission(models)).isSharedModel(mBaseModel.id, user.id);
				notAllowed = checkShared ? false : true;
			}
			if (notAllowed) {
				response.setError(Response.Error.FORBIDDEN, 'Access to this model is forbidden.');
				res.status(response.code).json(response.json);
				return;
			}
		}
	}

	try {
		let appResponse = null;
		
		if ( !mBaseModel ) {
			try {
				appResponse = await AppService.requestWithToken(req).get(`/model/get/${id}?version=${version}&${hash}`);
			} catch (e) {
				logger.info(`Base Model ID found, ID mismatch.`)
				response.setError(Response.Error.NOT_FOUND, `Base Model with ID ${id} not found.`)
			}
		}
		
		if ( (mBaseModel && [null, "boolean"].includes(mBaseModel.modelType)) || appResponse ) {
			let model_data = null;
			if ( !appResponse ) {
				try {
					appResponse = await AppService.requestWithToken(req).get(`/model/get/${id}?version=${version}&${hash}&mCourseId=${mCourseId}`);
				} catch(e) {
					console.error(e.response.data);
					res.status(500).json(null);
					return;
				}
			}

			model_data = appResponse.data;

			for (const model in model_data) {
				const parts = model.split('/');
				const id = parseInt(parts[0]);
				const version = parseInt(parts[1]);
				if (isNaN(id) || isNaN(version)) continue;
				try {
					if (model_data[model].hasOwnProperty('modelVersionMap')) {
						const newVersionMap = await filterModelVersionsForCards(id, model_data[model].modelVersionMap, model_data[model].modelType);
						model_data[model].modelVersionMap = newVersionMap;
					}
					await (new Metadata(models)).defineMetadataValues(model_data, model, id, version);
					if (await isSubmittedLesson(id, version)) {
						logger.info(`Is Submitted Lesson`, model_data);

						model_data[model].permissions.edit = false;
						model_data[model].permissions.delete = false;
						model_data[model].permissions.share = false;
						model_data[model].permissions.publish = model_data[model].published || false;
					}
					if (model_data[model].hasOwnProperty('survey')
						&& !model_data[model].survey.surveyQuestionTextMap) {
						model_data[model].survey.surveyQuestionTextMap = {};
					}
				} catch (e) {
					logger.error(`Error while setting data: ${e.message}...`);
					throw e;
				}

				model_data[model].permissions.publish = model_data[model].published || false;
				model_data[model].permissionsMap = {'1': {...model_data[model].permissions}};
			}

			response.data   	= model_data;
		} else {
				const modelJSON = await getModelVersionJSON(id, { version, slim });
				response.data		= modelJSON[0];
		}
	} catch (e) {
		logger.error(`Error while fetching model version...`, e);
		response.setError(Response.Error.INTERNAL_SERVER_ERROR, `Internal Server Error: ${e}`);
	}

	res.status(response.code)
		 .json(response.json);
});


router.post('/merge', async (req, res) => {
	const user = req.user;
	// 0. notify user models are being merged
	notify(`model:merge`, {
					type: "info",
					message: `Your models are being Merged. We will notify you once it's available in your account.`
	}, { user });
	// 1. fetch models

	const models = [];
	const mergeResponse = new Response();
		logger.info(`Merging models...`);

	try {
		for (const modelId of req.body.selectedModels) {
			const retModel = await getModel('research',  'boolean', modelId, 1, true, null, null, user, res, req);
			models.push(retModel.json);
		}
	} catch (error) {
		logger.info(`Merge Models failed at fetch: ${error}`);
		mergeResponse.setError(Response.Error.INTERNAL_SERVER_ERROR, `Merge Models failed at fetch.`);
		res.status(mergeResponse.code).json(mergeResponse.json);
	}

	// 2. merge models
	const mergedModel = {
		modelType: 'boolean',
		components: 0,
		interactions: 0,
		speciesMap: {},
		regulatorMap: {},
		dominanceMap: {},
		modelVersionMap: {
			'-1': {
				name: '1.0',
			},
		},
		name: 'Merged',
		type: 'research', // req.query.domain todo: replace research with req.body.domain
	};

	const mergeBooleanModels = arrayOfModels => {
		let customIntIds = 1;

		const propExtract = (map, mModel, modelProps) => {
			const negateIds = (arr, obj) => {
				const updatedIds = {};
				arr.forEach(el => {
					updatedIds[el] = `-${obj[el]}`;
				});
				return { ...obj, ...updatedIds };
			};

			const currMap = {};

			if (Object.keys(modelProps[map.name]).length > 0) {
				Object.keys(modelProps[map.name]).forEach(k => {
					if (['modelReferenceMap'].includes(map.name)) {
						currMap[`-${k}`] = { ...modelProps[map.name][k] };
					} else if (['pageReferenceMap'].includes(map.name)) {
						currMap[`-${k}`] = { ...modelProps[map.name][k], pageId: `-${modelProps[map.name][k].pageId}` };
					} else if (['dominanceMap', 'conditionSpeciesMap'].includes(map.name)) {
						currMap[`-${++customIntIds}`] = { ...negateIds(map.ids, modelProps[map.name][k]) };
					} else {
						currMap[`-${k}`] = { ...negateIds(map.ids, modelProps[map.name][k]) };
					}
				});
			}

			if (Object.keys(currMap).length > 0) {
				mModel[map.name] = {...mModel[map.name], ...currMap};
			}
		};

		for (const model of arrayOfModels) {
			const modelProps = Object.values(model.data)[0];
			// basic
			mergedModel.components += modelProps.components;
			mergedModel.interactions += modelProps.interactions;
			mergedModel.name += `_${modelProps.name}`;

			// speciesMap
			Object.keys(modelProps.speciesMap).forEach(k => {
				mergedModel.speciesMap[`-${k}`] = { name: modelProps.speciesMap[k].name + '_' + modelProps.name, external: modelProps.speciesMap[k].external };
			});
			// other maps
			const modelMaps = [
				{ name: 'regulatorMap', ids: ['speciesId', 'regulatorSpeciesId'] },
				{ name: 'dominanceMap', ids: ['negativeRegulatorId', 'positiveRegulatorId'] },
				{ name: 'conditionMap', ids: ['regulatorId'] },
				{ name: 'conditionSpeciesMap', ids: ['conditionId', 'speciesId'] },
				{ name: 'pageMap', ids: ['speciesId'] },
				{ name: 'sectionMap', ids: ['pageId'] },
				{ name: 'contentMap', ids: ['sectionId'] },
				{ name: 'modelReference', ids: [] },
				{ name: 'modelReferenceMap', ids: ['referenceId'] },
				{ name: 'referenceMap', ids: [] },
				{ name: 'pageReferenceMap', ids: ['referenceId', 'pageId'] },
			];
			for (const map of modelMaps) {
				propExtract(map, mergedModel, modelProps);
			}
		}
		return mergedModel;
	};
	mergeBooleanModels(models);
  // 3. save mergeModel
  const saveResponse = await saveModel(user, res, null, null, { '-3/-1': mergedModel }, req);
	const modelId = saveResponse._data['-3/-1'].id;
  // 4. notify users model merged successfully :TODO finish notify
	notify(`model:merge`, {
					type: "success",
					message:  `Your Merged model has been created. To view it or go to My Models.`,
					data: { id: modelId }}, { user });
        
  res.status(saveResponse.code).json(saveResponse.json);
});

/**
 * @param {string} domain (research, teach, learn)
 * @param {string} modeltype (boolean, metabolic)
 * @param {number} id 
 * @param {number} version 
 * @param {string} slim (true)
 * @param {string} hash 
 * @param {number} courseId 
 * @param {{id: number}} user 
 * @param {object} res
 */
const getModel = async (domain, modeltype, id, version, slim, hash, courseId, user, res) => {
  const response = new Response();
        const mversion = await models.ModelVersion.findOne({
                where: domain === 'research' && ['metabolic', 'kinetic', 'pharmacokinetic'].includes(modeltype) ? { modelid: id, version} : {id, version}
        });

        if (mversion === null) {
                response.setError(Response.Error.NOT_FOUND, `No such model ${id}:${version}`);
                res.status(response.code).json(response.json);
                return;
        }

        const mBaseModel = await models.BaseModel.findByPk(mversion.modelid);
        if (!mBaseModel || mBaseModel._deleted) {
                response.setError(Response.Error.NOT_FOUND, `No such model by PK ${id}:${version}`);
                res.status(response.code).json(response.json);
                return;
        }

        const mCourseId = Number(courseId || 0);

        if (!mBaseModel.published && !mCourseId) {
                if (user && parseInt(mBaseModel.userid, 10) !== user.id && parseInt(mBaseModel._createdBy, 10) !== user.id) {
                        let notAllowed = true;
                        if (mBaseModel.type == 'learning') {
                                const checkCourse = await (new Course(models).getCoursesByModelLearning(mBaseModel.id, user.id, onlyPublic));
                                notAllowed = checkCourse.length ? false : true;
                        }
                        if (notAllowed) {
                                const checkShared = await (new ModelPermission(models)).isSharedModel(mBaseModel.id, user.id);
                                notAllowed = checkShared ? false : true;
                        }
                        if (notAllowed) {
                                response.setError(Response.Error.FORBIDDEN, 'Access to this model is forbidden.');
                                res.status(response.code).json(response.json);
                                return;
                        }
                }
        }
        try {
					let appResponse = null;

					if ( !mBaseModel ) {
									try {
													appResponse = await AppService.request.get(`/model/get/${id}?version=${version}&${hash}`);
									} catch (e) {
													logger.info(`Base Model ID found, ID mismatch.`)
													response.setError(Response.Error.NOT_FOUND, `Base Model with ID ${id} not found.`)
													return res.status(response.code).json(response.json);
									}
					}

					if ( (mBaseModel && [null, "boolean"].includes(mBaseModel.modelType)) || appResponse ) {
									let model_data = null;
									if ( !appResponse ) {
													try {
															appResponse = await AppService.request.get(`/model/get/${id}?version=${version}&${hash}&mCourseId=${mCourseId}`);
													} catch(e) {
															if ('response' in e) {
																console.error(e.response.data);
															}
															response.setError(Response.Error.NOT_FOUND, `Error finding model by PK ${id}:${version}. ${new String(e)}`);
                							return res.status(response.code).json(response.json);
													}
									}

									model_data = appResponse.data;

									for (const model in model_data) {
													const parts = model.split('/');
													const id = parseInt(parts[0]);
													const version = parseInt(parts[1]);
													if (isNaN(id) || isNaN(version)) continue;
													try {
																	if (model_data[model].hasOwnProperty('modelVersionMap')) {
																					const newVersionMap = await filterModelVersionsForCards(id, model_data[model].modelVersionMap, model_data[model].modelType);
																					model_data[model].modelVersionMap = newVersionMap;
																	}
																	await (new Metadata(models)).defineMetadataValues(model_data, model, id, version);
																	if (await isSubmittedLesson(id, version)) {
																					logger.info(`Is Submitted Lesson`, model_data);

																					model_data[model].permissions.edit = false;
																					model_data[model].permissions.delete = false;
																					model_data[model].permissions.share = false;
																					model_data[model].permissions.publish = model_data[model].published || false;
																	}
																	if (model_data[model].hasOwnProperty('survey')
																					&& !model_data[model].survey.surveyQuestionTextMap) {
																					model_data[model].survey.surveyQuestionTextMap = {};
																	}
																	model_data[model].name = mBaseModel.name;
													} catch (e) {
																	logger.error(`Error while setting data: ${e.message}...`);
																	throw e;
													}
													model_data[model].permissions.publish = model_data[model].published || false;
													model_data[model].permissionsMap = {'1': {...model_data[model].permissions}};
									}

									response.data           = model_data;
					} else {
													const modelJSON = await getModelVersionJSON(id, { version, slim });
													response.data           = modelJSON[0];
					}
	} catch (e) {
					logger.error(`Error while fetching model version...`, e);
					response.setError(Response.Error.INTERNAL_SERVER_ERROR, `Internal Server Error: ${e}`);
	}

// res.status(response.code).json(response.json);
return response;
};

const saveModel = async (user, res, actionType, courseId, body, req) => {
	const response = new Response();
	if (!user) {
					response.setError(Response.Error.UNAUTHORIZED, 'Please try to Sign In first');
					return res.status(response.code).json(response.json);
	}

	if (actionType === ModelConstants.ACTION_LESSON.START) {
					try {
									await (new Lesson(models)).isAllowedToStartLesson(body, user.id);
					} catch(err) {
									response.setError(Response.Error.FORBIDDEN, err.message);
									return res.status(response.code).json(response.json);
					}
	}


	const isAdmin = (await models.authority.findOne({
					where: {
									user_id: req.user && req.user.id,
									role_id: 4 /* ADMIN */
					}
	})) !== null;

	try {
					if (!isAdmin) {
									await (new ModelPermission(models)).preparingAllowedModels(body, user.id, ["removeVersions"]);
					}
	} catch(err) {
					response.setError(Response.Error.BAD_REQUEST, 'Model with not valid data. '+err.message);
					return res.status(response.code).json(response.json);
	} 

	let modelsBoolean = Seq(body)
					.filter(m => m && (m.modelType == "boolean"))
					.toJSON();
	const modelsMetabolic = Seq(body)
					.filter(m => m && (m.modelType == "metabolic"))
					.toJSON();


	const modelsKinetic = Seq(body)
					.filter(m => m && (m.modelType == "kinetic"))
					.toJSON();

	const modelsPharmacokinetic = Seq(body)
					.filter(m => m && (m.modelType == "pharmacokinetic"))
					.toJSON();


const modelsActivity = Seq(body)
					.filter(m => m && (typeof m === 'object') && ('learningActivityMap' in m))
					.toJSON();

const modelsRemoveVersion = Seq(body)
					.filter((m, k) => m && k == 'removeVersions')
					.toArray();

	let learningObjectiveIds = Seq();
	Seq(modelsBoolean).forEach((v, k) => {
					const modelId = k.split('/')[0];
					v.metadataValueMap && (learningObjectiveIds = learningObjectiveIds.concat(Seq(v.metadataValueMap).filter(meta => meta.definitionId == 7).map((_, k) => [parseInt(k), modelId])));
	});

	// Trigger error if any originid is negative.
	let error = null;
	Seq(modelsBoolean).concat(Seq(modelsMetabolic)).some(model => {
					const origin = parseInt(model.originId);
					if (isNaN(origin)) return false;
					else if (origin < 0) {
									error = "Model with invalid origin model ID has been saved. Please reload the page and try again.";
					}
					return error !== null;
	});

	if (error !== null) {
					response.setError(Response.Error.UNPROCESSABLE_ENTITY, error);
					res.status(response.code).json(response.json);
					return;
	}

	let learningObjectiveAssoc = Seq(body).find((_, k) => k === "learningObjectiveAssoc");
	if (learningObjectiveAssoc) {
					// verify that the mappings here actually reflect metadata values in the models
					// this is important to prevent arbitrary data insertion
					learningObjectiveAssoc = Seq(learningObjectiveAssoc).filter(v => learningObjectiveIds.find(lov => lov[0] == v)).filter((v, k) => parseInt(v) > 0 && parseInt(k) > 0);
					await Promise.all(Seq(learningObjectiveAssoc).map((v, k) => {
									const modelid = learningObjectiveIds.find(lov => lov[0] == v)[1];
									return models.LearningObjectiveAssoc.create({
													origin: k,
													sub: v,
													modelid
									});
					}));
	}

	let data = { };

	profiler.snapshot();

	try{
					//remove model image cache
					await Promise.all(Seq(body).keySeq().map(key => {
									const keys = key.split("/");
									const modelId = parseInt(keys[0]);
//                      const versionId = parseInt(keys[1]);

									return new Promise((resolve) => {
													const filename = path.join("/cache", "model_images", `${modelId}.png`);

													fs.unlink(filename, err => {
																	resolve(err);
													})
									});
					}));
	}catch(e){
					console.error(e)
	}

	profiler.snapshot('Image cache removal:');

	let listModelIds = [], listSelectedVersions = [], listLearningObjective = [];

	// prevent saving if model is a student's lesson which has been turned in
	for (const key in modelsBoolean) {
					const parts = key.split('/');
					modelsBoolean[key].userId = user.id;

					// parseInt sanitizes values to prevent SQL injection
					const id = parseInt(parts[0]);
					const version = parseInt(parts[1]);
					if (isNaN(id) || isNaN(version)) continue;

					listModelIds.push(id);

					if (modelsBoolean[key].modelVersionMap) {
									Seq(modelsBoolean[key].modelVersionMap).forEach((v,k) => {
													listSelectedVersions.push({id, version: k, selected: ('selected' in v ? v.selected : null )})
									});
					} else {
									listSelectedVersions.push({id, version, selected: null});
					}

					if (await isSubmittedLesson(id, version)) {
									response.setError(Response.Error.FORBIDDEN, "You cannot save a lesson "+id+" that you have already submitted!");
									res.status(response.code).json(response.json);
									return;
					}

					try {
									const learningObjective = new LearningObjective(models);
									if (modelsBoolean[key].hasOwnProperty('metadataValueMap')) {
													listLearningObjective.push({
																	[id]: Seq(modelsBoolean[key].metadataValueMap)
																					.filter(meta => meta && 'definitionId' in meta && meta.definitionId == MetadataDefinition.LearningObjective)
																					.toObject()
													});
													const metadataObj = new Metadata(models);
													const modelVersions = await (new Version(models)).getBooleanVersions([id]);
													const oldObjectives = await metadataObj.getEntityModelsByVersions(modelVersions, MetadataDefinition.LearningObjective);
													const objectiveData = await learningObjective.preparingToSave(modelsBoolean, key, id, version, modelVersions, oldObjectives);
													await metadataObj.saveMetadataText(objectiveData);
                        }
                        await learningObjective.defineObjectiveSurvey(modelsBoolean, key, id, version);
                } catch(err) {
                        response.setError(Response.Error.INTERNAL_SERVER_ERROR, "Error saving metadata. "+ err.message ? err.message : err.toString());
                        return res.status(response.code).json(response.json);
                }

        }

        profiler.snapshot('Checking for submitted lessons:');

        try {
                listModelIds = [...new Set(listModelIds)];

                const shareModel = new Share(models);
                const sharedData = [];
                Seq(body).forEach((m, key) => {
                        const parts = key.split('/');
                        const id = parseInt(parts[0]);
                        const version = parseInt(parts[1]);
                        if (!isNaN(id) || !isNaN(version)) {
                                m && (sharedData.push(shareModel.preparingToSave(body, key, id, version)));
                        }
                });

                if ( !isEmpty(modelsBoolean) ) {
                        // loop through models, check if there are any intial lesson saves among them

                        let isStudent = false;

                        if (req.headers.domain === ModelConstants.DOMAINS.LEARNING) {
                                isStudent = (await models.authority.findOne({
                                        where: {
                                                user_id: user && user.id,
                                                role_id: 2 /* STUDENT */
                                        }
                                })) !== null;
                        }


                        if (isStudent) {
													let originids = new Immutable.Map(modelsBoolean).map(modelData => modelData.originId).filter((e, k) => {
																	if (!e) return false;
																	return +(k.split('/')[0]) < 0;
													});
													originids =(await asyncMap(originids, async v => {
																	return await getOriginalLesson(v);
													}));

													const startedLessons = {};

													originids = originids.map((v, k) => [k, v]).valueSeq();

													// loop through initial lesson saves, check for ones which have already been started
													for (const entry of originids) {
																	const lessonId = entry[0];
																	const originId = entry[1];
																	const startedLesson = await (new Lesson(models)).getOneStartedLessonByStudent(user.id, originId, courseId);
																	if (startedLesson !== null) {
																					startedLessons[lessonId] = originId;
																	}
													}

													profiler.snapshot('Checking for started lessons:');

													if (Seq(startedLessons).size > 0 && !body.confirm) {
																	const response = new Response();
																	response.code = Response.HTTP.ACCEPTED.code;
																	response.data = {
																					message: "You have already started this module. Go to “My Modules” to continue your work.",
																					fallback: Seq(modelsBoolean).first().originId,
																					discard: Seq(modelsBoolean).mapEntries(([k, v]) => [k, k]).toIndexedSeq().first().split('/')[0]
																	};
																	res.status(response.code).json(response.json);

																	return;
													} else if (Seq(startedLessons).size > 0) {
																	// need to patch boolean models - deleting the previous attempt
																	// will break the origin ID chain, so we need to directly link the
                                        // new models to the origin model.
                                        modelsBoolean = Seq(modelsBoolean).map((model, key) => {
																					if (key in startedLessons) {
																									return Immutable.Map(model).set("originId", startedLessons[key]).toObject();
																					} else {
																									return model;
																					}
																	}).toJSON();
													}

													// delete all lesson attempts
													const basemodels = await models.BaseModel.findAll({
																	attributes: ['id'],
																	where: {
																					[Op.and]: [
																									models.sequelize.where(models.sequelize.fn('get_original_model', models.sequelize.col('id')), {
																													[Op.in]: originids.map(entry => entry[1]).toArray()
																									}),
																									{
																													userid: user.id,
																													type: 'learning'
																									}
																					]
																	}
													});

													const modelids = Seq(basemodels).map(model => model.id).toArray();

													const versions = Seq(await models.ModelVersion.findAll({
																	attributes: ['id', 'version'],
																	where: {
																					modelid: {
																									[Op.in]: modelids
																					}
																	}
													})).map(mv => `${mv.id}/${mv.version}`).toKeyedSeq().mapEntries(([k, v]) => [v, null]).toObject();

													data.deleted = Seq(versions).keySeq().toArray();

													// delete models request
                                // try {
                                //      await AppService.request.post("/model/save", versions);
                                // } catch(e) {
                                //      const response = new Response();
                                //      response.setError(Response.Error.INTERNAL_SERVER_ERROR, "Failed to delete existing models; lesson restart failed.");
                                //      res.status(response.code).json(response.json);
                                //      return;
                                // }
															}

															profiler.snapshot('Deleting previous attempts:');
			
															try {
																			// const versionObj = new Version(models);
																			// await versionObj.removeVersions(modelsRemoveVersion[0], user.id);                            
																			// const modelVersions = await versionObj.getBooleanVersions(listModelIds);
																			// const dataPost = (new JsonFilter(modelsBoolean)).toFilter(doFilterSpecialChar).getJson();
																			// const appResponse = await AppService.request.post("/model/save", dataPost, {
																			//      headers: {
																			//              "Content-Type": "application/json",
																			//              "Content-Length": Buffer.byteLength(dataPost)
																			//      }
																			// });
			
																			// await versionObj.updateVersions(modelVersions, listSelectedVersions, user.id);
																			// data = { ...data, ...appResponse.data }
			
																			////////////
																			const versionObj = new Version(models);
																			const metadataObj = new Metadata(models);
																			await versionObj.removeVersions(modelsRemoveVersion[0], user.id);
																			const modelVersions = await versionObj.getBooleanVersions(listModelIds);
																			const dataPost = (new JsonFilter(modelsBoolean)).toFilter(doFilterSpecialChar).getJson();
																			const appResponse = await AppService.requestWithToken(
																				req, Buffer.byteLength(dataPost)
																			).post("/model/save", dataPost);
																			await metadataObj.setModelMetadata(modelVersions, listLearningObjective);
																			await versionObj.updateVersions(modelVersions, listSelectedVersions, user.id);
																			data = { ...data, ...appResponse.data }
																			if (req.headers.domain === ModelConstants.DOMAINS.LEARNING) {
																							await versionObj.relocateProps(modelsBoolean, data, ['startLesson'],['originId']);
																							await (new Lesson(models)).registeringInitiation(data, user.id, courseId);
																			}
															} catch (e) {
																			e.message = 'Error saving model. '+e.message;
																			response.setError(Response.getErrorResponse(e));
																			return res.status(response.code).json(response.json);
															}
			
															profiler.snapshot('Java app save:');
											}
			
											if (isEmpty(modelsActivity) ) {
																			/*try {
																							for ( const key in modelsActivity ) {
																											const keys = key.split("/")
																											const modelId = parseInt(keys[0]);
																											const versionId = parseInt(keys[1]);
																											const modelActivity = modelsActivity[key].learningActivityMap;
																											await saveModelActivity(modelId, versionId, modelActivity);
																							}
																			} catch(e) {
																							logger.error(`Cannot save Activity Models: ${e}...`);
																							response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
																							return res.status(response.code).json(response.json);
																			}*/
											}
			
			
											if ( !isEmpty(modelsMetabolic) ) {
															try {
																			for ( const key in modelsMetabolic ) {
																							const keys = key.split("/")
																							const modelId = parseInt(keys[0]);
																							const versionId = parseInt(keys[1]);
			
																							const modelVersion = modelsMetabolic[key];
																							const updatedModel = await saveMetabolicModel(user, modelId, versionId, modelVersion);

																							data = { ...data, ...updatedModel }
																						}
																		} catch (e) {
																						logger.error(`Cannot save Metabolic Models: ${e}...`);
																						response.setError(Response.Error.INTERNAL_SERVER_ERROR, e);
																		}
														}
						
														if (!isEmpty(modelsKinetic)) {
																		try {
																						for (const key in modelsKinetic) {
																										const keys = key.split("/")
																										const modelId = parseInt(keys[0]);
																										const versionId = parseInt(keys[1]);
						
																										const modelVersion = modelsKinetic[key];
																										const updatedModel = await saveKineticModel(user, modelId, versionId, modelVersion);
						
																										data = { ...data, ...updatedModel }
																						}
																		} catch (e) {
																						logger.error(`Cannot save Kinetic Models: ${e}...`, e);
																						response.setError(Response.Error.INTERNAL_SERVER_ERROR, e);
																		}
														}
						
														if (!isEmpty(modelsPharmacokinetic)) {
																		try {
																						for (const key in modelsPharmacokinetic) {
																										const keys = key.split("/");
																										const modelId = parseInt(keys[0]);
																										const versionId = parseInt(keys[1]);
						
																										const modelVersion = modelsPharmacokinetic[key];
																										const updatedModel = await savePharmacokineticModel(user, modelId, versionId, modelVersion);
						
																										data = { ...data, ...updatedModel }
																						}
																		} catch (e) {
																						logger.error(`Cannot save Pharmacokinetic Models: ${e}...`);
																						response.setError(Response.Error.INTERNAL_SERVER_ERROR, e);
																					}
																	}
									
																	sharedData.length && (await shareModel.saveSharedVersion(sharedData.filter(v => v).flat()));
									
													} catch (e) {
																	logger.error(`Cannot save Model`)
																	response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
																	return res.status(response.code).json(response.json);
													}
									
													if ( response.ok ) {
																	response.data = data
													}
									
													return response
									}																					

/**
 * Delete model
 */
router.delete("/:id", AuthRequired, async (req, res) => {
	const response 	= new Response();
	const { id } 	= req.params;
	const user		= req.user;
	const body		= req.body;

	try {
		const deleteVersion = new Version(models);
		await deleteVersion.disableAllVersions(id, user.id, body);
		response.data = body;
	} catch (err) {
		response.setError(err.code || Response.Error.INTERNAL_SERVER_ERROR, `${err.message}`);
	}
	return res.status(response.code).json(response.json);
});

const graphImageStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		const target = path.join("/cache", "model_images");
		mkdirp.sync(target);
	
		cb(null, target);
	},
	filename: (req, _, cb) => {
		const { id } 	= req.params;
 
		const filename	= `${id}.png`;

		logger.info(`Uploading File ${filename}...`);

		// try {
		// 	// sharp()
		// } catch (e) {
		// 	logger.info(`Unable to open image via sharp...`)
		// }

		cb(null, filename);
	}
});

const graphImageUpload = multer({ storage: graphImageStorage });

const isImageGrayScale = async (f) => {
	const _toArray  = async (image, color) => {
		const channel = await image.extractChannel(color)
		const buffer  = await channel.toBuffer();

		return [...buffer];
	}

	const image = await sharp(f)
		.toColorspace("rgb16");

	const r = await _toArray(image, "red");
	const g = await _toArray(image, "green");
	const b = await _toArray(image, "blue");
	
	let isGrayScale = false;

	if ( r.length == b.length && b.length == g.length ) {
		for ( let i = 0 ; i < r.length ; ++i ) {
			const a = r[i];
			const b = g[i];
			const c = b[i];
	
			if ( a != b != c ) {
				isGrayScale = true;
			}
		}
	}
	
	return isGrayScale;
}

const isImageWhite = async (f) => {
	const image	= await sharp(f);
	const stats = await image.stats();

	const channels = Array.from(stats.channels)
	const channelSum = channels.map(i => i.sum).reduce((a, b) => a + b, 0);

	const channelMin = channels.map(i => i.min)
	const channelMax = channels.map(i => i.max)

	const isWhite = i => i == 255

	if ( channelSum == 0 || (channelMin.every(isWhite) && channelMax.every(isWhite)) ) {
		return true;
	}
	
	return false;
}

export const IMAGE_CHECKS = [isImageGrayScale, isImageWhite];

const asyncSome = async (arr, predicate) => {
	for (const e of arr) {
		if (await predicate(e)) return true;
	}
	return false;
}

router.post("/:id/graph", graphImageUpload.single("image"), async (req, res) => {
	const response 	= new Response();

	const file		= req.file;
	const { id } 	= req.params;

	try {
		const check  = await asyncSome(IMAGE_CHECKS, async f => await f(file.path));

		if ( check ) {
			logger.info(`Unable to save image for ID: ${id} (corrupted).`)
			// fs.unlinkSync(file.path);
		} else {
			// resizing images.
			// TODO: Resize image to save space.
			// try {
			// 	await sharp(file.path)
			// 			.resize({ height: 200 })
			// 			.toFile(file.path);
			// } catch (e) {
			// 	logger.error(`Unable to resize: ${e}`);
			// }
		}
	} catch (e) {
		response.setError(Response.Error.INTERNAL_SERVER_ERROR, `Unable to save image: ${e.toString()}.`)
	}

	res.status(response.code)
		 .json(response.json);
});

const saveMetabolicModel = async (user, modelId, versionId, model) => {
	return await models.sequelize.transaction(async (t) => {
		let updatedKey = `${modelId}/${versionId}`
		const updatedModel = { [updatedKey]: { } }

		const defaultAttrs = {
			userid: user && user.id,
			_createdBy: user && user.id,
			_updatedBy: user && user.id
		}

		let mBaseModel = null;

		if ( modelId < 0 ) {
			logger.info(`Creating a Base Model...`);
			mBaseModel = await models.BaseModel.create({
				name: model.name || "Unnamed Model",
				type: model.type || "research",
				published: false,
				modelType: "metabolic",
				...defaultAttrs
			}, { transaction: t });

			updatedModel[updatedKey].id = parseInt(mBaseModel.id)
		} else {
			logger.info(`Updating a Base Model...`);
			mBaseModel = await models.BaseModel.findByPk(modelId);

			if ( !mBaseModel ) {
				throw new Error(`Cannot find Model with ID: ${modelId}`)
			}

			updatedKey = `${mBaseModel.id}/${versionId}`
			updatedModel[updatedKey] = updatedModel[updatedKey] || { }

			let updated = false;
			
			if ( "name" in model ) {
				mBaseModel.name = model.name
				updated = true;
			}
	
			if ( "type" in model ) {
				mBaseModel.type = model.type
				updated = true;
			}
	
			if ( updated ) {
				mBaseModel._updateBy = user && user.id;
			}
			
			mBaseModel = await mBaseModel.save()
		}
	
		let mModelVersion = null;
		let mConstraintBasedModel = null;
	
		if ( versionId < 0 ) {
			logger.info(`Creating a Model Version...`);
	
			const lastModelVersion = await getLastModelVersion(mBaseModel.id) //
	
			mModelVersion = await models.ModelVersion.create({//here
				id: models.sequelize.fn("nextval","model_id_seq"),
				modelid: mBaseModel.id,
				version: (lastModelVersion && lastModelVersion.version) || 1,
				selected: lastModelVersion ? false : true,
				userid: user && user.id,
				...defaultAttrs
			}, { transaction: t });
	
			logger.info(`Creating Constraint Based Model...`);
			mConstraintBasedModel = await models.ConstraintBasedModel.create({
				ModelVersionId: mModelVersion.id
			});

			logger.info(`Model Version ${mModelVersion.id} created.`);

			updatedModel[updatedKey].currentVersion = parseInt(mModelVersion.version)
		} else {
			logger.info(`Updating a Model Version...`);
			
			mModelVersion = await models.ModelVersion.findOne({
				where: {
					modelid: mBaseModel.id,
					version: versionId
				}
			});
	
			if ( !mModelVersion ) {
				throw new Error(`Model Version id ${versionId} for model ${mBaseModel.id} not found.`)
			}
	
			logger.info(`Fetching Constraint Based Model.`);
			mConstraintBasedModel = await models.ConstraintBasedModel.findOne({
				where: {
					ModelVersionId: mModelVersion.id
				}
			});
	
			if ( !mConstraintBasedModel ) {
				throw new Error(`Unable to find Constraint-Based Model.`)
			}

			updatedKey = `${mBaseModel.id}/${mModelVersion.version}`
			updatedModel[updatedKey] = updatedModel[updatedKey] || { }

			updatedModel[updatedKey].currentVersion = parseInt(mModelVersion.version)
		}
	
		if ( "modelVersionMap" in model ) {
			const modelVersion = model.modelVersionMap[`${versionId}`];

			let updated = false;
	
			if ( "name" in modelVersion ) {
				mModelVersion.name = modelVersion.name
				updated = true;
			}
			
			if ( updated ) {
				mModelVersion._updateBy = user && user.id;
			}

			mModelVersion = await mModelVersion.save();
		}

		const modelAnnotations = ('annotations' in model) && model.annotations;
		const hasAnnotationsAtModel = (k) => {
			return modelId < 0 || (modelAnnotations	&& Object.keys(modelAnnotations).indexOf(`${k}`) > -1);
		}
		const modelAnnotationsRemove = [];

		if (modelAnnotations) {
			if ('metabolites' in model) {
				Object.entries(modelAnnotations).forEach(v => !v[1] && (modelAnnotationsRemove.push(v[0])));
			}
		}
		
		const saveEntity = async (model, entity, modelName, {
			returnMapper = null,
			bulk = false,
			add = false,
			species = false,
			mapper = null,
			mAnnotationMap = null,
			modelId = 0,
			aliases = [],
			rowAttributes = null,
		} = { }) => {
			const entityData = model[entity] || { };
			let entityIds = { };

			const mEntityMap = { };

			let created = false;
			
			aliases = Seq(aliases);
			rowAttributes = Seq(rowAttributes);			

			const getOtherAttributes = async (entityObject) => {
				let otherAttrs = { }

				if (aliases && entityObject) {
					aliases.forEach((alias, kalias) => {
						entityObject[alias] = entityObject[kalias];
						delete entityObject[kalias]
					})
				}

				if (rowAttributes && entityObject) {
					rowAttributes.forEach((attr, kattr) => {
						entityObject[kattr] = attr;
					})
				}

				if ( mapper && entityObject ) {
					for ( const column in mapper ) {
						const target = mapper[column]

						if ( typeof target === 'string' ) {
							otherAttrs = { ...otherAttrs, [target]: entityObject[column] }
							delete entityObject[column]
						} else {
							const { model: modelType, cache, target: targetColumn } = target

							const entityId = entityObject[column]

							let mModelType = null

							if ( `${entityId}` in cache ) {
								mModelType = cache[`${entityId}`]
							} else {
								mModelType = await models[modelType].findByPk(entityId);
							}

							if ( mModelType ) {
								otherAttrs = { ...otherAttrs, [targetColumn]: mModelType.id }
								delete entityObject[column]
							}
						}
					}
				}

				return otherAttrs
			}
			
			logger.info(`${entity}: Creating entity data...`)
			let createEntityDataKeys = Object.keys(entityData)
				.filter(key => `${key}`.charAt(0) == "-")

			if ( !isEmpty(createEntityDataKeys) && bulk ) {
				logger.info(`Creating bulk ${entity}`)

				let mReactionGeneArr  = [];

				let createEntityData = await Promise.all(
					createEntityDataKeys
						.map(k => entityData[k])
						.map(async entityObject => {
							const attributes = await getOtherAttributes(entityObject)
							return { ...entityObject, ...attributes }
						}));

				let keys = createEntityDataKeys

				if (entity == 'regulatorMap') {
					if (createEntityDataKeys.length) {
						let iK = 0;
						const detectRegulatorSpecies = (r) => ['number','string'].includes(typeof r.regulatorSpeciesId);
						Seq(entityData).filter(detectRegulatorSpecies).forEach((v, k) => {
							if (!(`${v.regulatorSpeciesId}`.charAt(0) == "-")) {
								delete entityData[k];
								createEntityData = createEntityData.slice(iK, 1);
								keys = createEntityDataKeys = createEntityDataKeys.slice(iK, 1);
							}
							iK++;
						});
						mReactionGeneArr = createEntityData.map( eData => ({
							GeneId: eData.GeneId,
							ReactionId: eData.ReactionId,
							...defaultAttrs
						}));
						mReactionGeneArr = await models.ReactionGene.bulkCreate(mReactionGeneArr, { returning: true });					
						createEntityData = createEntityData.map((eData, k) => {
							eData['ReactionGeneId'] = mReactionGeneArr[k].id
							return eData;
						});
					}
				}

				if ( species ) {
					// ==== Species Metabolite ====
					let mSpeciesArr = createEntityData.map(species => ({
						speciesId: species.speciesId,
						name: species.name,
						...defaultAttrs
					}));
					
					logger.info(`Creating ${mSpeciesArr.length} species.`);
					mSpeciesArr = await models.Species.bulkCreate(mSpeciesArr, { returning: true });
					logger.info(`Created ${mSpeciesArr.length} species.`);

					for ( let i = 0, n = createEntityData.length ; i < n ; ++i ) {
						createEntityData[i] = { ...createEntityData[i], SpeciesId: mSpeciesArr[i].id }
					}
				}
        // console.log('createEntityData:', createEntityData);
				// if (entity == 'annotations') {
        //   const myOwnCreateEntityData = createEntityData.map((item, idx) => {
        //     return {
        //       ...item,
        //       ...defaultAttrs,
        //       ModelVersionId: mModelVersion.id,
        //       CompartmentId: Object.entries(model.annotations)[idx][0],
        //       ConstraintBasedModelId: mConstraintBasedModel.id,
        //       // MetaboliteId: null  ,
        //       // ReactionId: null
        //     };
        //   });

        //   console.log('modified createEntityData:', myOwnCreateEntityData);
        // }

				const mEntityMapArr = await models[modelName].bulkCreate(createEntityData, { returning: true });

				for ( let i = 0 ; i < keys.length ; ++i ) {
					const key = keys[i];
					mEntityMap[`${key}`] = mEntityMapArr[i];
					entityIds = { ...entityIds, [`${key}`]: mEntityMapArr[i].id }
				}

				if ( add ) {
					logger.info(`Adding ${entity} to Constraint-Based Model...`);

					await mConstraintBasedModel[`add${modelName}s`](mEntityMapArr);
				}

				created = true;
			}

			for ( const key in entityData ) {
				const entityObject = entityData[key];
				let mEntity = null;
				let mSpecies = null;

				if (!entityObject) {
					if (`${key}`.charAt(0) !== "-" && entityObject === null) {
						mEntity = await models[modelName].findByPk(parseInt(key));
						mEntity && await mEntity.destroy()
					}
					continue;
				}


				if ( `${key}`.charAt(0) == "-" ) {
					if ( !created ) {
						logger.info(`Creating a ${entity}...`);
	
						let otherAttrs = { }
	
						if ( species ) {
							logger.info(`Creating species...`);

							mSpecies = await models.Species.create({
								name: entityObject.name,
								speciesId: entityObject.speciesId
							});
	
							otherAttrs = { ...otherAttrs, SpeciesId: mSpecies.id }
						}
	
						otherAttrs = { ...otherAttrs, ... await getOtherAttributes(entityObject) }
 
						mEntity = await models[modelName].create({
							...entityObject,
							...defaultAttrs,
							...otherAttrs
						}, {transaction: t})

						entityIds = { ...entityIds, [key]: mEntity.id }
	
						if ( add ) {
							logger.info(`Adding ${entity} to Constraint-Based Model...`);
	
							await mConstraintBasedModel[`add${modelName}`](mEntity);
						}
					} else {
						mEntity = mEntityMap[`${key}`];
					}
				} else {
					logger.info(`Updating ${entity}`);

					let options = { }

					if ( species ) {
						options = {
							include: [{
								model: models.Species
							}]
						}
					}

					mEntity = await models[modelName].findByPk(parseInt(key), options);

					if ( !mEntity ) {
						throw new Error(`${entity} with ID: ${key} not found.`)
					} else {
						let updated = false;

						if ( species ) {
							mSpecies = mEntity.Species

							if ( "name" in entityObject ) {
								mSpecies.name = entityObject.name
								updated = true;
							}

							if ( "speciesId" in entityObject ) {
								mSpecies.speciesId = entityObject.speciesId;
								updated = true;
							}

							if ( updated ) {
								mSpecies._updatedBy = user && user.id;
							}

							await mSpecies.save();
						}
						
						for ( const metadata in entityObject ) {
							let column  = metadata;
							if (mapper && mapper.hasOwnProperty(metadata)) {
								const target = mapper[metadata];
								if(typeof target === "string") {
									column = target
								}
							}
							mEntity[column] = entityObject[metadata];
							updated = true;
						}

						if ( updated ) {
							mEntity._updateBy = user && user.id;
						}

						mEntity = await mEntity.save()
					}
				}

				if ( mAnnotationMap && entityObject ) {
					if ( "annotations" in entityObject && entityObject.annotations) {
						for ( const annotationId of entityObject.annotations ) {
							if (!hasAnnotationsAtModel(annotationId)) continue;
							if ( `${annotationId}` in mAnnotationMap ) {
								mAnnotationMap[`${annotationId}`][`${modelName}Id`] = mEntity.id;
								await mAnnotationMap[`${annotationId}`].save();
							} else {
								const mAnnotation = await models.Annotation.findByPk(annotationId);
								mAnnotation[`${modelName}Id`] = mEntity.id;
								await mAnnotation.save();
							}
						}
					}
				}

				if (modelAnnotationsRemove.length) {
					await models.Annotation.destroy({
						where: {
							id: {[models.Sequelize.Op.in]: modelAnnotationsRemove}
						}
					});
				}
				mEntityMap[`${key}`] = mEntity;
			}

			if ( !isEmpty(entityIds) ) {
				updatedModel[updatedKey][returnMapper || entity] = entityIds
			}

			return { [`m${modelName}Map`]: mEntityMap }
		}

		const metabolicMap = new ModelMetabolicMap();
		metabolicMap.fillObjectivesFunction(model, {...defaultAttrs, ConstraintBasedModelId: mConstraintBasedModel.id});
		metabolicMap.fillSubsystems(model, {...defaultAttrs, ConstraintBasedModelId: mConstraintBasedModel.id});
		metabolicMap.fillDrugEnvironment(model, {...defaultAttrs, ConstraintBasedModelId: mConstraintBasedModel.id});
		
		const { mObjectiveFunctionMap } = await saveEntity(model, "objectives", "ObjectiveFunction", {
			bulk: true			
		});

		const { mAnnotationMap } = await saveEntity(model, "annotations", "Annotation", {
			bulk: true,
			modelId
		});
		
		const { mCompartmentMap } = await saveEntity(model, "compartments", "Compartment", {
			bulk: true
		});
		const { mMetaboliteMap } = await saveEntity(model, "metabolites", "Metabolite", {
			bulk: true,
			add: true,
			species: true,
			mapper: {
				"compartment": { target: "CompartmentId", model: "Compartment", cache: mCompartmentMap }
			},
			mAnnotationMap
		});

		const { mSubSystemMap } = await saveEntity(model, "subsystems", "SubSystem", { bulk: true })
		const { mReactionMap } = await saveEntity(model, "reactions", "Reaction", {
			bulk: true,
			add: true,
			mapper: {
				"subsystem": { target: "SubSystemId", model: "SubSystem", cache: mSubSystemMap }
			},
			mAnnotationMap
		});
		await saveEntity(model, "reactionMetaboliteMap", "ReactionCoefficient", {
			bulk: true,
			rowAttributes: {...defaultAttrs},
			returnMapper: 'reactionMetaboliteIds',
			mapper: {
				"reaction": { target: "ReactionId", model: "Reaction", cache: mReactionMap },
				"metabolite": { target: "MetaboliteId", model: "Metabolite", cache: mMetaboliteMap }
			}
		});
		await saveEntity(model, "objectiveReactions", "ObjectiveReaction", {
			bulk: true,
			mapper: {
				"reaction": { target: "ReactionId", model: "Reaction", cache: mReactionMap },
				"objectiveFunction": { target: "ObjectiveFunctionId", model: "ObjectiveFunction", cache: mObjectiveFunctionMap }
			}
		});
		const { mGeneMap } = await saveEntity(model, "genes", "Gene", {
			bulk: true,
			add: true,
			species: true,
			mAnnotationMap
		})
		const { mRegulatorMap } = await saveEntity(model, "regulatorMap", "Regulator", {
			returnMapper: "regulatorIds",
			bulk: true,
			mapper: {
				"regulationType": "type",
				"conditionRelation": "conditionrelation",
				"gene": { target: "GeneId", model: "Gene", cache: mGeneMap },
				"reaction": { target: "ReactionId", model: "Reaction", cache: mReactionMap }
			}
		});
		const { mConditionMap } = await saveEntity(model, "conditionMap", "Condition", {
			returnMapper: "conditionIds",
			bulk: true,
			mapper: {
				"regulatorId": { target: "regulator_id", model: "Regulator", cache: mRegulatorMap },
				"speciesRelation": "speciesrelation",
				"subConditionRelation": "subconditionrelation"
			}
		});

		if (Seq(mConditionMap).count()) {
				const newGeneMap = {...mGeneMap};
				const condGenesId = Seq(model.conditionGeneMap).filterNot(v => v.conditionId > 0).map((v, k) => {
					if (v.geneId < 0) {
						model.conditionGeneMap[k].species_id = mGeneMap[v.geneId].SpeciesId;
						return;
					}
					return v.geneId
				}).filter(v => v).toArray()
				const listCondGenes = await models.Gene.findAll({
					where: {
						id: {[models.Sequelize.Op.in]: condGenesId}
					}
				})
				for (const condGene of listCondGenes) {
					newGeneMap[condGene.id] = condGene;
					Seq(model.conditionGeneMap).filter(v => v.geneId == condGene.id).forEach((_, k) => {
						model.conditionGeneMap[k].species_id = condGene.SpeciesId;
					})
				}
				//remove positive condition Id
				model.conditionGeneMap = Seq(model.conditionGeneMap).filterNot(v => v.conditionId > 0).toObject();
				await saveEntity(model, "conditionGeneMap", "ConditionSpecies", {
					returnMapper: "conditionGeneIds",
					bulk: true,
					mapper: {
						"conditionId": { target: "condition_id", model: "Condition", cache: mConditionMap },
						"geneId": { target: "GeneId", model: "Gene", cache: newGeneMap }
					}
				});
		}
		
		const subConditionDefaultAttrs = {
			_createdAt: models.Sequelize.fn('NOW'),
			_createdBy: user && user.id,
			_updatedAt: models.Sequelize.fn('NOW'),
			_updatedBy: user && user.id,
			id: models.sequelize.literal("nextval('sub_condition_id_seq')")
		}

		const { mSubConditionMap } = await saveEntity(model, "subConditionMap", "SubCondition", {
			returnMapper: "subConditionIds",
			bulk: false,
			rowAttributes: {...subConditionDefaultAttrs},
			mapper: {
				"conditionId": { target: "condition_id", model: "Condition", cache: mConditionMap },
				"speciesRelation": "speciesrelation"
			}
		});

		if (Seq(mSubConditionMap).count()) {
			const newSubGeneMap = {...mGeneMap};
			const condGenesId = Seq(model.subConditionGeneMap).filterNot(v => v.subConditionId > 0).map((v, k) => {
				if (v.geneId < 0) {
					model.subConditionGeneMap[k].species_id = mGeneMap[v.geneId].SpeciesId;
					return;
				}
				return v.geneId
			}).filter(v => v).toArray()
			const listCondGenes = await models.Gene.findAll({
				where: {
					id: {[models.Sequelize.Op.in]: condGenesId}
				}
			})
			for (const condGene of listCondGenes) {
				newSubGeneMap[condGene.id] = condGene;
				Seq(model.subConditionGeneMap).filter(v => v.geneId == condGene.id).forEach((_, k) => {
					model.subConditionGeneMap[k].species_id = condGene.SpeciesId;
				})
			}
			//remove positive condition Id
			model.subConditionGeneMap = Seq(model.subConditionGeneMap).filterNot(v => v.subConditionId > 0).toObject();			
			await saveEntity(model, "subConditionGeneMap", "SubConditionSpecies", {
				returnMapper: "subConditionGeneIds",
				bulk: true,
				mapper: {
					"subConditionId": { target: "sub_condition_id", model: "SubCondition", cache: mSubConditionMap },
					"geneId": { target: "GeneId", model: "Gene", cache: newSubGeneMap }
				}
			});
		}

		const pageDefaultAttrs = {
			creationdate: models.Sequelize.fn('NOW'),
			creationuser: user && user.id,
			updatedate: models.Sequelize.fn('NOW'),
			updateuser: user && user.id
		}

    const { mPageModelMap } = await saveEntity(model, "pageMap", "PageModel", {
			bulk: false,
      mapper: null,
			rowAttributes: {...pageDefaultAttrs, ModelVersionId: mConstraintBasedModel.ModelVersionId},
			mapper: {
				"metaboliteId": { target: "metaboliteId", model: "Metabolite", cache: mMetaboliteMap },
				"reactionId": { target: "reactionId", model: "Reaction", cache: mReactionMap }
			}
		});

    const { mSectionModelMap } = await saveEntity(model, "sectionMap", "SectionModel", {
			bulk: false,
			rowAttributes: pageDefaultAttrs,
			mapper: {
				"pageId": { target: "pageModelId", model: "PageModel", cache: mPageModelMap },
			}
		});

    const { mContentModelMap } = await saveEntity(model, "contentMap", "ContentModel", {
			bulk: false,
			mapper: {
				"sectionId": { target: "sectionModelId", model: "SectionModel", cache: mSectionModelMap },
			},
			rowAttributes: {...pageDefaultAttrs, flagged: false}
		});

		await saveEntity(model, "drugEnvironmentMap", "DrugEnvironment", {
			returnMapper: "drugEnvironmentIds",
			bulk: true
		})

		const setContentReferenceDefaults = async (model) => {
			if (model.contentReferenceMap) {
					const contentReferenceMap = model.contentReferenceMap;
					
					const maxId = await models.ContentModelReference.max('id');
					let newId = (maxId || 0) + 1;
	
					for (const key in contentReferenceMap) {
							if (key.startsWith('-')) {
									contentReferenceMap[key].id = newId++;
							}
							if (!('position' in contentReferenceMap[key])) {
									contentReferenceMap[key].position = 0;
							}
					}
			}
		};

		await setContentReferenceDefaults(model);

		const mReference = {};
		await saveEntity(model, "contentReferenceMap", "ContentModelReference", {
			bulk: false,
			mapper: {
				"contentId": { target: "content_id", model: "ContentModel", cache: mContentModelMap },
        "referenceId": { target: "reference_id", model: "reference", cache: mReference }
			},
			rowAttributes: {...pageDefaultAttrs, flagged: false}
		});

		await saveEntity(model,"pageReferenceMap","PageModelReference",{
			bulk: false,
			mapper: {
				"pageId": {target: "pageModelId", model: "PageModel", cache: mPageModelMap},
				"referenceId": {target: "referenceId", model: "reference", cache: mReference}
			},
			rowAttributes: {			
				creationdate: models.Sequelize.fn('NOW'),
				creationuser: user && user.id
			}
		})

		const setModelReferenceDefaults = async (model) => {
			if (model.modelReferenceMap) {
					const modelReferenceMap = model.modelReferenceMap;
	
					for (const key in modelReferenceMap) {
							if (!('position' in modelReferenceMap[key])) {
								modelReferenceMap[key].position = 0;
							}
					}
			}
		};

		await setModelReferenceDefaults(model);
		
		await saveEntity(model,"modelReferenceMap","model_reference", {
			bulk: false,
			mapper: {
				"referenceId": {target: "reference_id", model: "reference", cache: mReference }
			},
			rowAttributes: {
				"model_id": mBaseModel.id,
				creationdate: models.Sequelize.fn('NOW'),
				creationuser: user && user.id
			}
		});

		updatedModel[updatedKey].modelType = "metabolic";

		// add MetaboliteId to Annotations
		if (model.annotations) {
			// const annotationsArray = Object.keys(model.annotations);
			// let oldMetaboliteId, updatedMetaboliteId, savededAnnotation, updatedAnnotationId;
			// for(const oldAnnotationId of annotationsArray) {
			// 	updatedAnnotationId = updatedModel[modelId+'/'+versionId].annotations[oldAnnotationId]
			// 	oldMetaboliteId = model.annotations[oldAnnotationId].metaboliteId;
			// 	updatedMetaboliteId = updatedModel[modelId+'/'+versionId].metabolites[oldMetaboliteId];
		
			// 	// update Annotations.MetaboliteId & Annotations.CompartmentId
			// 	savededAnnotation = await models.Annotation.findByPk(updatedAnnotationId);
			// 	await savededAnnotation.update({MetaboliteId: updatedMetaboliteId});
			// }
		}


		//remove cache and update it from the background
		await cache.call('JSON.DEL', `model:${mBaseModel.id}:version:${mModelVersion.id}:slim:true`);
		await cache.call('JSON.DEL', `model:${mBaseModel.id}:version:${mModelVersion.id}:slim:false`);
		//update model for cache lazy in background ( not call the await )
		getModelJSON(mConstraintBasedModel.id, {
			BaseModelId: mBaseModel.id,
			VersionId: mModelVersion.id,
			slim: true,
			modelType: 'metabolic'
		})

		return updatedModel;
	});
}

const saveKineticModel = async (user, modelId, versionId, model) => {
	return await models.sequelize.transaction(async () => {
		let updatedKey = `${modelId}/${versionId}`
		const updatedModel = { [updatedKey]: { } }

		const defaultAttrs = {
			userid: user && user.id,
			_createdBy: user && user.id,
			_updatedBy: user && user.id
		}

		let mBaseModel = null;

		if ( modelId < 0 ) {
			logger.info(`Creating a Base Model...`);
			mBaseModel = await models.BaseModel.create({
				name: model.name || "Unnamed Model",
				type: model.type || "research",
				published: false,
				modelType: "kinetic",
				...defaultAttrs
			});

			updatedModel[updatedKey].id = parseInt(mBaseModel.id)
		} else {
			logger.info(`Updating a Base Model...`);
			mBaseModel = await models.BaseModel.findByPk(modelId);

			if ( !mBaseModel ) {
				throw new Error(`Cannot find Model with ID: ${modelId}`)
			}

			updatedKey = `${mBaseModel.id}/${versionId}`
			updatedModel[updatedKey] = updatedModel[updatedKey] || { }

			let updated = false;
			
			if ("name" in model) {
				mBaseModel.name = model.name
				updated = true;
			}
	
			if ("type" in model) {
				mBaseModel.type = model.type
				updated = true;
			}
	
			if ( updated ) {
				mBaseModel._updateBy = user && user.id;
			}
			
			mBaseModel = await mBaseModel.save()
		}
	
		let mModelVersion = null;
		let kineticModel = null;
	
		if ( versionId < 0 ) {
			logger.info(`Creating a Model Version...`);
	
			const lastModelVersion = await getLastModelVersion(mBaseModel.id) //
	
			mModelVersion = await models.ModelVersion.create({
				id: models.sequelize.fn("nextval","model_id_seq"),
				modelid: mBaseModel.id,
				version: (lastModelVersion && lastModelVersion.version) || 1,
				selected: lastModelVersion ? false : true,
				userid: user && user.id,
				...defaultAttrs
			});
	
			logger.info(`Creating Kinetic Model...`);
			kineticModel = await models.KineticModel.create({
				ModelVersionId: mModelVersion.id
			});
	
			logger.info(`Model Version ${mModelVersion.id} created.`);

			updatedModel[updatedKey].currentVersion = parseInt(mModelVersion.version)
		} else {
			logger.info(`Updating a Model Version...`);
			
			mModelVersion = await models.ModelVersion.findOne({
				where: {
					modelid: mBaseModel.id,
					version: versionId
				}
			});
	
			if ( !mModelVersion ) {
				throw new Error(`Model Version id ${versionId} for model ${mBaseModel.id} not found.`)
			}
	
			logger.info(`Fetching Kinetic Model.`);
			kineticModel = await models.KineticModel.findOne({
				where: {
					ModelVersionId: mModelVersion.id
				}
			});
	
			if (!kineticModel) {
				throw new Error(`Unable to find Kinetic Model.`)
			}

			updatedKey = `${mBaseModel.id}/${mModelVersion.version}`
			updatedModel[updatedKey] = updatedModel[updatedKey] || { }

			updatedModel[updatedKey].currentVersion = parseInt(mModelVersion.version)
		}
	
		if ("modelVersionMap" in model) {
			const modelVersion = model.modelVersionMap[`${versionId}`];

			let updated = false;
	
			if ("name" in modelVersion) {
				mModelVersion.name = modelVersion.name
				updated = true;
			}
			
			if (updated) {
				mModelVersion._updateBy = user && user.id;
			}

			mModelVersion = await mModelVersion.save();
		}

		const modelAnnotations = ('annotations' in model) && model.annotations;
		const hasAnnotationsAtModel = (k) => {
			return modelId < 0 || (modelAnnotations	&& Object.keys(modelAnnotations).indexOf(`${k}`) > -1);
		}
		const modelAnnotationsRemove = [];

		if (modelAnnotations) {
			if ('species' in model) {
				Object.entries(modelAnnotations).forEach(v => !v[1] && (modelAnnotationsRemove.push(v[0])));
			}
		}

		const saveEntity = async (model, entity, modelName, {
			returnMapper = null,
			bulk = false,
			add = false,
			species = false,
			mapper = null,
			mAnnotationMap = null,
			modelNameRoot = null,
			include = null,
			set = null,
			modelId = 0,
			aliases = [],
			rowAttributes = null,
		} = { }) => {
			const entityData = model[entity] || { };
			let entityIds = { };

			const mEntityMap = { };

			let created = false;
			
			aliases = Seq(aliases);
			rowAttributes = Seq(rowAttributes);	

			const getOtherAttributes = async (entityObject) => {
				let otherAttrs = { }

				if (aliases && entityObject) {
					aliases.forEach((alias, kalias) => {
						entityObject[alias] = entityObject[kalias];
						delete entityObject[kalias]
					});
				}

				if (rowAttributes && entityObject) {
					rowAttributes.forEach((attr, kattr) => {
						entityObject[kattr] = attr;
					});
				}

				if ( mapper && entityObject ) {
					for ( const column in mapper ) {
						const target = mapper[column]

						if ( typeof target === 'string' ) {
							otherAttrs = { ...otherAttrs, [target]: entityObject[column] }
							delete entityObject[column]
						} else {
							const { model: modelType, cache, target: targetColumn } = target

							const entityId = entityObject[column]

							let mModelType = null

							if ( `${entityId}` in cache ) {
								mModelType = cache[`${entityId}`]
							} else {
								mModelType = await models[modelType].findByPk(entityId);
							}
							if ( mModelType ) {
								otherAttrs = { ...otherAttrs, [targetColumn]: mModelType.id }
								delete entityObject[column]
							}
						}
					}
				}

				return otherAttrs
			}
			
			logger.info(`Creating entity data...`)
			const createEntityDataKeys = Object.keys(entityData)
				.filter(key => `${key}`.charAt(0) == "-")

			if (!isEmpty(createEntityDataKeys) && bulk) {
				logger.info(`Creating bulk ${entity}`)

				const createEntityData = await Promise.all(
					createEntityDataKeys
						.map(k => entityData[k])
						.map(async entityObject => {
							console.log(entityObject);
							const attributes = await getOtherAttributes(entityObject)
							console.log(attributes);
							return { ...entityObject, ...attributes }
						}));

				const keys = createEntityDataKeys;
				
				// add include option for nested object creation
				const options = { returning: true };
				if (include) {
					options.include = include; 
				}
				const mEntityMapArr = await models[modelName].bulkCreate(createEntityData, options);

				for (let i = 0; i < keys.length; ++i) {
					const key = keys[i];
					mEntityMap[`${key}`] = mEntityMapArr[i];
					entityIds = {...entityIds, [`${key}`]: mEntityMapArr[i].id}
				}

				if (add) {
					logger.info(`Adding ${entity} to Kinetic Model...`);

					await kineticModel[`add${modelNameRoot || modelName}s`](mEntityMapArr);
				}

				created = true;
			}

			for (const key in entityData) {
				const entityObject = entityData[key];
				let mEntity = null;

				if (!entityObject) {
					if (`${key}`.charAt(0) !== "-" && entityObject === null) {
						mEntity = await models[modelName].findByPk(parseInt(key));
						mEntity && await mEntity.destroy()
					}
					continue;
				}


				if (`${key}`.charAt(0) == "-") {
					if (!created) {
						logger.info(`Creating a ${entity}...`);
	
						let otherAttrs = {}
	
						otherAttrs = { ...otherAttrs, ... await getOtherAttributes(entityObject) }
	
						console.log("otherAttrs", entityObject, otherAttrs);
						mEntity = await models[modelName].create({
							...entityObject,
							...defaultAttrs,
							...otherAttrs
						})

						entityIds = { ...entityIds, [key]: mEntity.id }
	
						if (add) {
							logger.info(`Adding ${entity} to Kinetic Model...`);
	
							await kineticModel[`add${modelName}`](mEntity);
						}
					} else {
						mEntity = mEntityMap[`${key}`];
						
						if (set) {
							const attrs = Object.keys(set); 
							for (const attr of attrs) {
								logger.info(`Adding ${attr} on ${entity}...`);
								if (entityObject[attr] && ['reactants','products'].includes(attr)) {
									const entityVals = entityObject[attr].map(v => v.id)
									let savedAttrs = await mEntity[set[attr]](entityVals);
									savedAttrs = savedAttrs[savedAttrs.length-1];									
									await (new ModelKinetic(models)).updateStoichiometryByList(
										attr === 'reactants' ? 'KineticReactant' : 'KineticProduct',
										savedAttrs, entityObject[attr]
									);
								} else {
									entityObject[attr] && await mEntity[set[attr]](entityObject[attr]);
								}
							}
						}
					}
				} else {
					logger.info(`Updating ${entity}`);

					let options = {}

					if (include) {
						options = {
							include: include
						}
					}

					mEntity = await models[modelName].findByPk(parseInt(key), options);

					if (!mEntity) {
						throw new Error(`${entity} with ID: ${key} not found.`)
					} else {
						let updated = false;

						for (const metadata in entityObject) {
							if (mEntity[metadata] && mEntity[metadata].constructor === Array) {
								// if metadata is an array, then it is a relationship
								// we need to update the relationship manually one by one
								mEntity[metadata].forEach((element, id) => {
										element.set(entityObject[metadata][id]);
										element.save();
								});
							} else {
								let column = metadata;
								if (mapper && mapper.hasOwnProperty(metadata)) {
									const target = mapper[metadata]
									if( typeof target === 'string') {
										column = target
									}
 								}
								mEntity[column] = entityObject[metadata];
							}
							updated = true;
						}

						if (updated) {
							mEntity._updateBy = user && user.id;
						}

						mEntity = await mEntity.save()

						if (set) {
							const attrs = Object.keys(set); 
							// logger.info(`Setting ${attrs} on ${entity}...`);
							
							console.log(attrs)
							for (const attr of attrs) {
								logger.info(`Setting ${attr} on ${entity}...`);
								if (entityObject[attr] && ['reactants','products'].includes(attr)) {
									const entityVals = entityObject[attr].map(v => v.id)
									let savedAttrs = await mEntity[set[attr]](entityVals);
									savedAttrs = savedAttrs[savedAttrs.length-1];									
									await (new ModelKinetic(models)).updateStoichiometryByList(
										attr === 'reactants' ? 'KineticReactant' : 'KineticProduct',
										savedAttrs, entityObject[attr]
									);
								} else {
									entityObject[attr] && await mEntity[set[attr]](entityObject[attr]);
								}
							}
						}
					}
				}

				if (mAnnotationMap && entityObject) {
					if ("annotations" in entityObject && entityObject.annotations) {
						for (const annotationId of entityObject.annotations) {
							if (!hasAnnotationsAtModel(annotationId)) continue;
							if (`${annotationId}` in mAnnotationMap) {
								mAnnotationMap[`${annotationId}`][`${modelName}Id`] = mEntity.id;
								await mAnnotationMap[`${annotationId}`].save();
							} else {
								const mAnnotation = await models.Annotation.findByPk(annotationId);
								mAnnotation[`${modelName}Id`] = mEntity.id;
								await mAnnotation.save();
							}
						}
					}
				}

				if (modelAnnotationsRemove.length) {
					await models.Annotation.destroy({
						where: {
							id: {[models.Sequelize.Op.in]: modelAnnotationsRemove}
						}
					});
				}
				mEntityMap[`${key}`] = mEntity;
			}

			if ( !isEmpty(entityIds) ) {
				updatedModel[updatedKey][returnMapper || entity] = entityIds
			}
			return mEntityMap;
		}

		// save unit definitions and don't recreate if already exist
		if(model.unitDefinitionMap){
			const unitDefinitions =  await models.UnitDefinitions.bulkCreate(
				Object.entries(model.unitDefinitionMap).map(v => ({
					id: v[0],
					name: v[1].name,
					...defaultAttrs
				})),
				{ returning: true, ignoreDuplicates: true }
			) 
			await kineticModel.setUnitDefinitions(unitDefinitions);
		}


		const kineticLawTypes = models.KineticLawType.findAll();
		// const { mAnnotationMap } = await saveEntity(model, "annotations", "Annotation", {
		// 	bulk: true,
		// 	modelId
		// });
		const mCompartmentMap = await saveEntity(model, "compartments", "KineticCompartment", {
			bulk: true,
			add: true,
		});
		const mMetaboliteMap = await saveEntity(model, "metabolites", "KineticSpecies", {
			bulk: true,
			add: true,
			modelNameRoot: "KineticSpecie",
			mapper: {
				"compartment": { target: "KineticCompartmentId", model: "KineticCompartment", cache: mCompartmentMap },
				"unitDefinitionId": "unit_definition_id"
			},
			// mAnnotationMap
		});

		await saveEntity(model, "parameters", "KineticGlobalParams", {
			bulk: true,
			add: true,
		});

		model.reactions && Object.keys(model.reactions).forEach(key => {
			const modelReaction = model.reactions[key];
			if(modelReaction) {				
				const reactantsData = modelReaction.reactants?.map(reactant => {
					const reactantId = (typeof reactant == 'object' && 'id' in reactant) ? reactant.id : reactant;
					return {
						id: mMetaboliteMap[reactantId]?.id || reactantId,
						stoichiometry: reactant.stoichiometry === undefined ? 0 : reactant.stoichiometry
					}
				});
				const productsData = modelReaction.products?.map(product => {
					const productId = (typeof product == 'object' && 'id' in product) ? product.id : product;
					return {
						id: mMetaboliteMap[productId]?.id || productId,
						stoichiometry: product.stoichiometry === undefined ? 0 : product.stoichiometry
					}
				});
				model.reactions[key].reactants = reactantsData;
				model.reactions[key].products = productsData;
				model.reactions[key].modifiers = model.reactions[key].modifiers?.map(modifier => mMetaboliteMap[modifier]?.id || modifier);				
			}
		});

		const mReactionMap  = await saveEntity(model, "reactions", "KineticReaction", {
			bulk: true,
			add: true,
			set: {
				"reactants": "setReactants",
				"products": "setProducts",
				"modifiers": "setModifiers",
			},
			species: mMetaboliteMap
			// mAnnotationMap
		});

		// renaming parameters to KineticLocalParams so that it can be saved as a nested object
		// using bulkCreate
		model.kinetic_laws && Object.keys(model.kinetic_laws)
			.filter(key => model.kinetic_laws[key]?.parameters)
			.forEach(key => {
				model.kinetic_laws[key].KineticLocalParams = model.kinetic_laws[key].parameters.map(param => ({unit_definition_id: param.unit , ...param}));
				model.kinetic_laws[key].KineticReactionId = model.kinetic_laws[key].reaction_id;
				model.kinetic_laws[key]._createdBy = user.id
				model.kinetic_laws[key]._updatedBy = user.id
				delete model.kinetic_laws[key].parameters;
			})
			
		// console.log('model.kinetic_laws:', mReactionMap);
		await saveEntity(model, "kinetic_laws", "KineticLaw", {
			bulk: true,
			include: [{ model: models.KineticLocalParams }],
			mapper: {
				"type": { target: "KineticLawTypeId", model: "KineticLawType", cache: kineticLawTypes },
				"reaction_id": { target: "KineticReactionId", model: "KineticReaction", cache: mReactionMap },
			}
		});
		
		const pageDefaultAttrs = {
			updateuser: user && user.id,
			creationuser: user && user.id,
			updatedate: models.Sequelize.fn('NOW'),
			creationdate: models.Sequelize.fn('NOW')
		};

		const mPageModelMap = await saveEntity(model, "pageMap", "PageModel", {
			rowAttributes: {...pageDefaultAttrs},
			bulk: true,
			mapper: {
				"speciesId": { target: "speciesId", model: "KineticSpecies", cache: mMetaboliteMap },
			}
		});

		const mSectionModelMap = await saveEntity(model, "sectionMap", "SectionModel", {
			bulk: true,
			rowAttributes: {...pageDefaultAttrs},
			mapper: {
				"pageId": { target: "pageModelId", model: "PageModel", cache: mPageModelMap },
			}
		});
	
		const mContentModelMap = await saveEntity(model, "contentMap", "ContentModel", {
			bulk: true,
			rowAttributes: {...pageDefaultAttrs, flagged: false},
			mapper: {
				"sectionId": { target: "sectionModelId", model: "SectionModel", cache: mSectionModelMap },
			}
		});

		const pageMapModelAttrs = {};
		const sectionMapModelAttrs = {};
		const contentMapModelAttrs = {};

		mPageModelMap && Seq(mPageModelMap).forEach(page => {
			pageMapModelAttrs[page.id] = {
				speciesId: page.speciesId
			}
		});

		mSectionModelMap && Seq(mSectionModelMap).forEach(section => {
			sectionMapModelAttrs[section.id] = {
				title: section.title,
				type: section.Description,
				position: section.position,
				pageId: section.pageModelId,
			}
		});

		mContentModelMap && Seq(mContentModelMap).forEach(content => {
			contentMapModelAttrs[content.id] = {
				text: content.text,
				position: content.position,
				sectionId: content.sectionModelId,
			}
		});

		await (new ModelKinetic(models)).fillContentReferenceDefaults(model, kineticModel);

		const mReference = {};
		const { mContentReferenceMap } = await saveEntity(model, "contentReferenceMap", "ContentModelReference", {
			bulk: false,
			mapper: {
				"contentId": { target: "content_id", model: "ContentModel", cache: mContentModelMap },
        "referenceId": { target: "reference_id", model: "reference", cache: mReference }
			},
			rowAttributes: {...pageDefaultAttrs, flagged: false}
		});

		const { mPageReferenceMap } = await saveEntity(model,"pageReferenceMap","PageModelReference",{
			bulk: false,
			mapper: {
				"pageId": {target: "pageModelId", model: "PageModel", cache: mPageModelMap},
				"referenceId": {target: "referenceId", model: "reference", cache: mReference}
			},
			rowAttributes: {...pageDefaultAttrs}
		})

		await saveEntity(model,"modelReferenceMap","model_reference", {
			bulk: false,
			mapper: {
				"referenceId": {target: "reference_id", model: "reference", cache: mReference }
			},
			rowAttributes: {
				"model_id": mBaseModel.id,
				position: 0,
				creationdate: models.Sequelize.fn('NOW'),
				creationuser: user && user.id
			}
		});
		// updatedModel.pageMap = pageMapModelAttrs;
		// updatedModel.sectionMap = sectionMapModelAttrs;
		// updatedModel.contentMap = contentMapModelAttrs;
		// updatedModel.contentReferenceMap = mContentReferenceMap;	
		// updatedModel.pageReferenceMap = mPageReferenceMap;
		updatedModel[updatedKey].referenceMap = {};

		updatedModel[updatedKey].modelType = "kinetic";

		//remove cache and update it from the background
		await cache.call('JSON.DEL', `model:${mBaseModel.id}:version:${mModelVersion.id}:slim:true`);
		//update model for cache lazy in background ( not call the await )
		getModelJSON(kineticModel.id, {
			BaseModelId: mBaseModel.id,
			VersionId: mModelVersion.id,
			slim: true,
			modelType: 'kinetic'
		})

		return updatedModel;
	});
}

const isSubmittedLesson = async (modelid, modelversion) => {
	// check if this exact model is shared with an instructor
		// this will return data ONLY if the lesson has been
		// shared with an instructor by a member of one of their
		// courses which contains the lesson specified. it's a bit of
		// a monster, but it does the job in *one* query instead of multiple.
		modelid = parseInt(modelid);
		modelversion = parseInt(modelversion);
		const aggregate_query = `SELECT * FROM model_version \
INNER JOIN model ON model_version.modelid = model.id \
INNER JOIN model_share ON model_share.model_id = model_version.modelid \
INNER JOIN "Courses" ON "Courses"."_createdBy" = model_share.userid \
INNER JOIN "UserCourses" ON "UserCourses"."CourseId" = "Courses".id AND "UserCourses"."UserId" = model.userid \
INNER JOIN "ModelCourse" ON "ModelCourse"."CourseId" = "Courses".id AND "ModelCourse"."ModelId" = model.originid \
WHERE model_version.id = ${modelid} AND model_version.version = ${modelversion}`;

		const results = await db.query(aggregate_query);
		return results.length > 0;
}

// const asyncFilter = async (map, filterFn) => {
// 	let filterValMap = new Immutable.Map();
// 	for (const key of map.keySeq().toArray()) {
// 		const filterVal = await filterFn(map.get(key), key);
// 		filterValMap = filterValMap.set(key, filterVal);

const getOriginalLesson = async (originid) => {
	originid = parseInt(originid);
	const query = `SELECT fn_get_original_lesson(${originid}) AS original;`;
	const result = await db.query(query);
	return result[0].original;
};

const asyncMap = async (col, fn) => {
	let res = Immutable.Map(col);
	for (const key of col.keySeq()) {
		res = res.set(key, await fn(res.get(key)));
	}
	return res;
};

const distinct = (seq, on=(e => e)) => {
	return seq.reduce((accumulator, cur) => {
		return accumulator.find(el => {
			return on(el) === on(cur)
		}) ? accumulator : accumulator.concat(cur);
	}, Seq());
};

const profiler = {
	last: 0,
	reset() {
		this.last = 0;
	},
	snapshot(prefix = null) {
		let ret;
		if (this.last === 0) {
			this.last = Date.now();
			ret = 0;
		} else {
			const now = Date.now();
			const diff = now - this.last;
			this.last = now;
			ret = diff;
		}
		if (prefix != null) console.log(`${prefix} ${ret}ms`);
		return ret;
	}
}

/**
 * Save model
 */
router.post("/", async (req, res) => {
	const response = new Response();
	const body = req.body;
	const user = req.user;
	const {type: actionType, course: courseId} = req.query;

	// Allow lessons to run without authentication
	// if (!user) {
	// 	response.setError(Response.Error.UNAUTHORIZED, 'Please try to Sign In first');
	// 	return res.status(response.code).json(response.json);
	// }		

	let bodyLessonIds;
	const lessonObj = new Lesson(models);
	try {
		bodyLessonIds = await lessonObj.mappedLessonBodyIds(body, user?.id || null);
		if (bodyLessonIds) {
			//replace model id to lesson id
			Seq(bodyLessonIds).forEach((_lesson, _model) => {
				body[_lesson] = {...body[_model]};
				if ('startLesson' in body[_lesson]) {
					delete body[_lesson].startLesson;
				}
				delete body[_lesson].currentLesson;
				delete body[_model];
			});
		}
	} catch(err) {
		response.setError(Response.Error.FORBIDDEN, 'Failed to retrieve lessons IDs. '+err.message);
		return res.status(response.code).json(response.json);
	}

	if (PLATFORM.isModelIt === false) {
		if (actionType === ModelConstants.ACTION_LESSON.START) {
			try {
				await (new Lesson(models)).isAllowedToStartLesson(body, user?.id || null);
			} catch(err) {
				response.setError(Response.Error.FORBIDDEN, err.message);
				return res.status(response.code).json(response.json);
			}
		}
	}

	
	const isAdmin = (await models.authority.findOne({
		where: {
			user_id: req.user && req.user.id,
			role_id: 4 /* ADMIN */
		}
	})) !== null;

	try {
		if (!isAdmin) {
			await (new ModelPermission(models)).preparingAllowedModels(body, user.id, ["removeVersions"]);
		}
	} catch(err) {
		response.setError(Response.Error.BAD_REQUEST, 'Model with not valid data. '+err.message);
		return res.status(response.code).json(response.json);
	}	

	let modelsBoolean = Seq(body)
		.filter(m => m && (m.modelType == "boolean"))
		.toJSON();
	const modelsMetabolic = Seq(body)
		.filter(m => m && (m.modelType == "metabolic"))
		.toJSON();
	
	const modelsKinetic = Seq(body)
		.filter(m => m && (m.modelType == "kinetic"))
		.toJSON();
	
	const modelsPharmacokinetic = Seq(body)
		.filter(m => m && (m.modelType == "pharmacokinetic"))
		.toJSON();


  const modelsActivity = Seq(body)
		.filter(m => m && (typeof m === 'object') && ('learningActivityMap' in m))
		.toJSON();

  const modelsRemoveVersion = Seq(body)
		.filter((m, k) => m && k == 'removeVersions')
		.toArray();

	let learningObjectiveIds = Seq();
	Seq(modelsBoolean).forEach((v, k) => {
		const modelId = k.split('/')[0];
		v.metadataValueMap && (learningObjectiveIds = learningObjectiveIds.concat(Seq(v.metadataValueMap).filter(meta => meta.definitionId == 7).map((_, k) => [parseInt(k), modelId])));
	});

	// Trigger error if any originid is negative.
	let error = null;
	Seq(modelsBoolean).concat(Seq(modelsMetabolic)).some(model => {
		const origin = parseInt(model.originId);
		if (isNaN(origin)) return false;
		else if (origin < 0) {
			error = "Model with invalid origin model ID has been saved. Please reload the page and try again.";
		}
		return error !== null;
	});

	if (error !== null) {
		response.setError(Response.Error.UNPROCESSABLE_ENTITY, error);
		res.status(response.code).json(response.json);
		return;
	}

	let learningObjectiveAssoc = Seq(body).find((_, k) => k === "learningObjectiveAssoc");
	if (learningObjectiveAssoc) {
		// verify that the mappings here actually reflect metadata values in the models
		// this is important to prevent arbitrary data insertion
		learningObjectiveAssoc = Seq(learningObjectiveAssoc).filter(v => learningObjectiveIds.find(lov => lov[0] == v)).filter((v, k) => parseInt(v) > 0 && parseInt(k) > 0);
		await Promise.all(Seq(learningObjectiveAssoc).map((v, k) => {
			const modelid = learningObjectiveIds.find(lov => lov[0] == v)[1];
			return models.LearningObjectiveAssoc.create({
				origin: k,
				sub: v,
				modelid
			});
		}));
	}

	let data = { };

	profiler.snapshot();

	try{
		//remove model image cache
		await Promise.all(Seq(body).keySeq().map(key => {
			const keys = key.split("/");
			const modelId = parseInt(keys[0]);
//			const versionId = parseInt(keys[1]);

			return new Promise((resolve) => {
				const filename = path.join("/cache", "model_images", `${modelId}.png`);

				fs.unlink(filename, err => {
					resolve(err);
				})
			});
		}));
	}catch(e){
		console.error(e)
	}

	profiler.snapshot('Image cache removal:');

	let listModelIds = [], listSelectedVersions = [], listLearningObjective = [];

	// prevent saving if model is a student's lesson which has been turned in
	for (const key in modelsBoolean) {
		const parts = key.split('/');
		modelsBoolean[key].userId = user.id;

		// parseInt sanitizes values to prevent SQL injection
		const id = parseInt(parts[0]);
		const version = parseInt(parts[1]);
		if (isNaN(id) || isNaN(version)) continue;
		
		listModelIds.push(id);

		if (modelsBoolean[key].modelVersionMap) {
			Seq(modelsBoolean[key].modelVersionMap).forEach((v,k) => {
				listSelectedVersions.push({id, version: k, selected: ('selected' in v ? v.selected : null )})
			});
		} else {
			listSelectedVersions.push({id, version, selected: null});
		}
		
		if (PLATFORM.isModelIt === false) {
			if (await isSubmittedLesson(id, version)) {
				response.setError(Response.Error.FORBIDDEN, "You cannot save a lesson "+id+" that you have already submitted!");
				res.status(response.code).json(response.json);
				return;
			}
		}

		try {
			const learningObjective = new LearningObjective(models);
			if (modelsBoolean[key].hasOwnProperty('metadataValueMap')) {
				const metadataObj = new Metadata(models);
				const modelVersions = await (new Version(models)).getBooleanVersions([id]);				
				const oldObjectives = await metadataObj.getEntityModelsByVersions(modelVersions, MetadataDefinition.LearningObjective);
				const objectiveData = await learningObjective.preparingToSave(modelsBoolean, key, id, version, modelVersions, oldObjectives);

				const savedObjetives = await metadataObj.saveMetadataText(objectiveData);
				if (savedObjetives && savedObjetives.length > 0) {
					savedObjetives.forEach(meta => {
						const metaKey = Object.keys(meta)[0];
						const metaContent = meta[metaKey];
						if (Number(metaContent.definitionId) === MetadataDefinition.LearningObjective) {
							listLearningObjective.push({
								[id]: metaContent
							});
						}
					});
				}
			}
			await learningObjective.defineObjectiveSurvey(modelsBoolean, key, id, version);
		} catch(err) {
			response.setError(Response.Error.INTERNAL_SERVER_ERROR, "Error saving metadata. "+ err.message ? err.message : err.toString());
			return res.status(response.code).json(response.json);
		}
		
	}

	profiler.snapshot('Checking for submitted lessons:');

	try {
		listModelIds = [...new Set(listModelIds)];

		const shareModel = new Share(models);
		const sharedData = [];
		Seq(body).forEach((m, key) => {
			const parts = key.split('/');
			const id = parseInt(parts[0]);
			const version = parseInt(parts[1]);
			if (!isNaN(id) || !isNaN(version)) {
				m && (sharedData.push(shareModel.preparingToSave(body, key, id, version)));
			}
		});

		if ( !isEmpty(modelsBoolean) ) {
			// loop through models, check if there are any intial lesson saves among them
			
			let isStudent = false;

			if (req.headers.domain === ModelConstants.DOMAINS.LEARNING) {
				isStudent = (await models.authority.findOne({
					where: {
						user_id: user && user.id,
						role_id: 2 /* STUDENT */
					}
				})) !== null;
			}

			if (isStudent) {
				let originids = new Immutable.Map(modelsBoolean).map(modelData => modelData.originId).filter((e, k) => {
					if (!e) return false;
					return +(k.split('/')[0]) < 0;
				});
				originids =(await asyncMap(originids, async v => {
					return await getOriginalLesson(v);
				}));
	
				const startedLessons = {};

				originids = originids.map((v, k) => [k, v]).valueSeq();
	
				if (PLATFORM.isModelIt === false) {
					// loop through initial lesson saves, check for ones which have already been started
					for (const entry of originids) {
						const lessonId = entry[0];
						const originId = entry[1];
						const startedLesson = await (new Lesson(models)).getOneStartedLessonByStudent(user.id, originId, courseId);
						if (startedLesson !== null) {
							startedLessons[lessonId] = originId;
						}
					}
				}

				profiler.snapshot('Checking for started lessons:');
	
				if (Seq(startedLessons).size > 0 && !body.confirm) {
					const response = new Response();
					response.code = Response.HTTP.ACCEPTED.code;
					response.data = {
						message: "You have already started this module. Go to “My Modules” to continue your work.",
						fallback: Seq(modelsBoolean).first().originId,
						discard: Seq(modelsBoolean).mapEntries(([k, v]) => [k, k]).toIndexedSeq().first().split('/')[0]
					};
					res.status(response.code).json(response.json);

					return;
				} else if (Seq(startedLessons).size > 0) {
					// need to patch boolean models - deleting the previous attempt
					// will break the origin ID chain, so we need to directly link the
					// new models to the origin model.
					modelsBoolean = Seq(modelsBoolean).map((model, key) => {
						if (key in startedLessons) {
							return Immutable.Map(model).set("originId", startedLessons[key]).toObject();
						} else {
							return model;
						}
					}).toJSON();
				}

				// delete all lesson attempts
				const basemodels = await models.BaseModel.findAll({
					attributes: ['id'],
					where: {
						[Op.and]: [
							models.sequelize.where(models.sequelize.fn('get_original_model', models.sequelize.col('id')), {
								[Op.in]: originids.map(entry => entry[1]).toArray()
							}),
							{
								userid: user.id,
								type: 'learning'
							}
						]
					}
				});

				const modelids = Seq(basemodels).map(model => model.id).toArray();

				const versions = Seq(await models.ModelVersion.findAll({
					attributes: ['id', 'version'],
					where: {
						modelid: {
							[Op.in]: modelids
						}
					}
				})).map(mv => `${mv.id}/${mv.version}`).toKeyedSeq().mapEntries(([k, v]) => [v, null]).toObject();

				data.deleted = Seq(versions).keySeq().toArray();

				// delete models request
				// try {
				// 	await AppService.request.post("/model/save", versions);
				// } catch(e) {
				// 	const response = new Response();
				// 	response.setError(Response.Error.INTERNAL_SERVER_ERROR, "Failed to delete existing models; lesson restart failed.");
				// 	res.status(response.code).json(response.json);
				// 	return;
				// }
			}

			profiler.snapshot('Deleting previous attempts:');

			try {
				// const versionObj = new Version(models);
				// await versionObj.removeVersions(modelsRemoveVersion[0], user.id);				
				// const modelVersions = await versionObj.getBooleanVersions(listModelIds);
				// const dataPost = (new JsonFilter(modelsBoolean)).toFilter(doFilterSpecialChar).getJson();
				// const appResponse = await AppService.request.post("/model/save", dataPost, {
				// 	headers: {
				// 		"Content-Type": "application/json",
				// 		"Content-Length": Buffer.byteLength(dataPost)
				// 	}
				// });

				// await versionObj.updateVersions(modelVersions, listSelectedVersions, user.id);
				// data = { ...data, ...appResponse.data }

				////////////
				const versionObj = new Version(models);
				const metadataObj = new Metadata(models);
				await versionObj.removeVersions(modelsRemoveVersion[0], user.id);
				const modelVersions = await versionObj.getBooleanVersions(listModelIds);
				const dataPost = (new JsonFilter(modelsBoolean)).toFilter(doFilterSpecialChar).getJson();
				const appResponse = await AppService.requestWithToken(req, Buffer.byteLength(dataPost)).post("/model/save", dataPost);
				data = { ...data, ...appResponse.data }
				await metadataObj.setModelMetadata(modelVersions, listLearningObjective, data);
				await versionObj.updateVersions(modelVersions, listSelectedVersions, user.id);				
				if (req.headers.domain === ModelConstants.DOMAINS.LEARNING) {
					await versionObj.syncVersionNumbers(data);
					await versionObj.relocateProps(modelsBoolean, data, ['startLesson'],['originId']);
					if (PLATFORM.isModelIt === false) {
						await (new Lesson(models)).registeringInitiation(data, user.id, courseId);
					}
				}
				if (bodyLessonIds) {
					//Retrieved the old model ID as the object key
					Seq(bodyLessonIds).forEach((_lesson, _model) => {
						data[_model] = {...data[_lesson]};
						delete data[_lesson];
					});
				}
				loggerHttp.info(`Finished saved models ${JSON.stringify(listModelIds)}`, 'API::MODEL', 'SAVE', user);
			} catch (e) {
				e.message = 'Error saving model. '+e.message;
				response.setError(Response.getErrorResponse(e));
				loggerHttp.error(e, 'API::MODEL', 'SAVE', user, __filename);
				return res.status(response.code).json(response.json);
			}

			profiler.snapshot('Java app save:');
		}

		if (isEmpty(modelsActivity) ) {
				/*try {
					for ( const key in modelsActivity ) {
						const keys = key.split("/")
						const modelId = parseInt(keys[0]);
						const versionId = parseInt(keys[1]);
						const modelActivity = modelsActivity[key].learningActivityMap;
						await saveModelActivity(modelId, versionId, modelActivity);
					}
				} catch(e) {
					logger.error(`Cannot save Activity Models: ${e}...`);
					response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
					return res.status(response.code).json(response.json);
				}*/
		}


		if ( !isEmpty(modelsMetabolic) ) {
			try {
				for ( const key in modelsMetabolic ) {
					const keys = key.split("/")
					const modelId = parseInt(keys[0]);
					const versionId = parseInt(keys[1]);

					const modelVersion = modelsMetabolic[key];
					const updatedModel = await saveMetabolicModel(user, modelId, versionId, modelVersion);
					
					data = { ...data, ...updatedModel }
					loggerHttp.info(`Finished saved Metabolic model ${modelId}`, 'API::MODEL', 'SAVE', user);
				}
			} catch (e) {
				logger.error(`Cannot save Metabolic Models: ${e}...`);
				loggerHttp.error(e, 'API::MODEL', 'SAVE', user, __filename);
				response.setError(Response.Error.INTERNAL_SERVER_ERROR, e);
			}
		}

		if (!isEmpty(modelsKinetic)) {
			try {
				for (const key in modelsKinetic) {
					const keys = key.split("/")
					const modelId = parseInt(keys[0]);
					const versionId = parseInt(keys[1]);

					const modelVersion = modelsKinetic[key];
					const updatedModel = await saveKineticModel(user, modelId, versionId, modelVersion);

					data = { ...data, ...updatedModel }
					loggerHttp.info(`Finished saved Kinetic model ${modelId}`, 'API::MODEL', 'SAVE', user);
				}
			} catch (e) {
				logger.error(`Cannot save Kinetic Models: ${e}...`, e);
				loggerHttp.error(e, 'API::MODEL', 'SAVE', user, __filename);
				response.setError(Response.Error.INTERNAL_SERVER_ERROR, e);
			}
		}

		if (!isEmpty(modelsPharmacokinetic)) {
			try {
				for (const key in modelsPharmacokinetic) {
					const keys = key.split("/");
					const modelId = parseInt(keys[0]);
					const versionId = parseInt(keys[1]);

					const modelVersion = modelsPharmacokinetic[key];
					const updatedModel = await savePharmacokineticModel(user, modelId, versionId, modelVersion);
					
					data = { ...data, ...updatedModel }
				}
			} catch (e) {
				logger.error(`Cannot save Pharmacokinetic Models: ${e}...`);
				response.setError(Response.Error.INTERNAL_SERVER_ERROR, e);
			}
		}

		sharedData.length && (await shareModel.saveSharedVersion(sharedData.filter(v => v).flat()));

	} catch (e) {
		logger.error(`Cannot save Model`)
		response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
		return res.status(response.code).json(response.json);
	}

	if ( response.ok ) {
		response.data = data
	}

	res.status(response.code)
		 .json(response.json);
});

/**
 * Search
 */
router.get("/search", async (req, res) => {
	const response = new Response();

	try {
		
	} catch (e) {
		const errstr = e.toString();
		logger.error(`Unable to process search results: ${errstr}`);
		response.setError(Response.Error.INTERNAL_SERVER_ERROR, `Unable to process search results: ${errstr}`);
	}

	res.status(response.code)
		 .json(response.json);
});

/**
 * Publish
 */
router.post("/:id/publish",  async (req, res) => {

	const resp = new Response();
	const user = req.user;
	const id = req.params.id

	if (!user) {
		resp.setError(Response.Error.UNAUTHORIZED, 'Please try to Sign In first');
		return res.status(resp.code).json(resp.json);
	}

	try {
		let { domain } = req.headers;
		const publish = new Publish(models);		
		const { published, modelType } = req.body;

		const account = new Account(models)
		const isAdmin = await account.isAdmin(user.id);

		await publish.setPublishment(id, user.id, published, modelType, isAdmin);
		resp.data = {model: id,	published};
		if (!domain || domain === "teaching") { domain = 'learning'}

		if (!domain || domain === "teaching") { domain = 'learning' }
		deleteCacheWith(`cards:${domain}:published:*`)
			.then(() => logger.error('Successfully removed CACHE from published '+domain+' models') )
			.catch(err => logger.error('Error in removing CACHE from published models. '+err.message));

	} catch (err) {
		resp.setError(Response.Error.INTERNAL_SERVER_ERROR, `Unable process publishment: ${err.message}`);
	}
	res.status(resp.code).json(resp.json);
});


/**
 * Create context specific
 */
router.post("/:id/context",
	AuthRequired,
	uploadContext.any(),
	async (req, res, next) => {
		const response	= new Response();
		if ( !response.ok ) {
			return res.status(response.code).json(response.json);
		}
		next();
	},
	async (req, res) => {
		const resp = new Response();
		const body = req.body;
		try {
			const contextEntity = new ContextSpecific(models);
			addToQueue(async (done) => {
				try {
					logger.info(`Exporting metabolic model JSON for Create Context Model ${req.params.id}...`);
					const contextResult = await contextEntity.createContextData(req.params.id, Seq(body), req.files, req.user.id);
					contextResult.analysisType = JSON.parse(`{"type":${body.analysisType}}`).type;
					const generatedJsonModel = await exportModel(req.params.id, 1, 'json', '/uploads/context/inputs');
					logger.info(`Exported JSON Model ${generatedJsonModel}.`);

					contextResult.uploads.generalModel = {
						name: 'reference_model.json',
						path: generatedJsonModel
					}
					const analyzerApiResult 	= await AnalysisService.request.post(`/context`, contextResult);
					resp.data = {
						newModel: contextResult.id,
						analyzer: analyzerApiResult.data,
						fileName: analyzerApiResult.data.fileName
					}
					const contextModel = contextEntity.parseModelJson(analyzerApiResult.data.modelPath, {
						contextId: contextResult.id, modelOrigId: req.params.id
					});
					const newModelId = await contextEntity.createContextModel(saveJSONModel.bind(null, 'metabolic', contextModel, req.user));
					await contextEntity.setDownloads(contextResult.id, analyzerApiResult.data);
					notify('model:context', { type: "success", message: `New model ${analyzerApiResult.data.fileName} is now avaialble.`,
						data: { id: newModelId } }, { user: req.user });
				} catch (e) {
					logger.info(`Unable to create Context Specific: ${e}`);
					notify('model:context', { type: "error", message: `Unable to create Context Specific: ${e}`}, { user: req.user })
				} finally {
					done();
				}
			})

			notify(`model:context`, {
				type: "info",
				message: `Creating new Context Specific in progress. You be notified you once it's available.`
			}, { user: req.user });

		} catch (err) {
			resp.setError(Response.Error.INTERNAL_SERVER_ERROR, `Unable to save Context Specific: ${err.message}`);
		}
		res.status(resp.code).json(resp.json);
})

router.get("/:id/context/downloads", AuthRequired, async (req, res) => {
	const resp = new Response();

	try {
		const data = await (new ContextSpecific(models)).getAllContextData(req.params.id);
		resp.data = data.map(m => {
			m.dataValues.context = `${m.dataValues.modelOriginId}_${m.dataValues.id}`;
			m.dataValues.count = 1;
			return m.dataValues
		})
	} catch(err) {
		resp.setError(Response.Error.INTERNAL_SERVER_ERROR, `Unable to list Context files: ${err.message}`);
	}
	res.status(resp.code).json(resp.json);
})

router.get("/:id/context/download/:context", AuthRequired, async (req, res) => {
	const resp = new Response();
	try {
		const pathZipFile = `/uploads/context/${req.params.context}/results/como_result.zip`;
		if (fs.existsSync(pathZipFile)) {
			throw new Error(`File for ${req.params.context} was not found.`)	;
		}
		return res.status(resp.code).sendFile(pathZipFile);
	} catch(err) {
		resp.setError(Response.Error.INTERNAL_SERVER_ERROR, `Unable to download Context files: ${err.message}`);
	}
	res.status(resp.code).json(resp.json);
})


/**
 * Import to analyze Drug files
 */
router.post("/analyze/drug-identification/model/:id",
	AuthRequired,
	uploadTmp.array("files"),
	async (req, res, next) => {
		const response = new Response();
		const files = req.files;
		try {
			drugFileValidation(files, req.body)
			next();
		} catch (err) {
			logger.warn(`Error Drug Identification files: ${err.message}`);
			response.setError(Response.Error.BAD_REQUEST, err.message);
			res.status(response.code).json(response.json);
		}
	},
	async (req, res) => {
		const response = new Response();
		const { solver: rSolver,
			statistical: rStatistical,
			correction, experId, experName,
			taxonId, fluxRatioUp, fluxRatioDown,
			knockoutMethod: rKnockoutMethod
		} = req.body;

		const files = req.files;
		
		const solver = rSolver || 'GLPK';
		const statistical = rStatistical || 'DESEQ2';
		const knockoutMethod =  rKnockoutMethod || 'BENHBERG';
		let experLog = '', experDataId = 0;
	
		try {

			//Finding model name
			const model = await (new Version(models)).getBasicModelVersion(req.params.id);

			if (model.modeltype !== "metabolic") {
				throw new Error('The model should be metabolic');
			}			

			const input = new PerformAnalyzeInput();
			input.addMethod = correction;
			input.addMaxrows = 200;
			input.addStatistical = statistical;
			input.addTaxonId = taxonId;
			input.addFluxRatioUp = fluxRatioUp;
			input.addFluxRatioDown = fluxRatioDown;
			input.addKnockoutMethod = knockoutMethod;

			for (const file of files) {
				if (file.inputname == 'upregulated') {
					input.addUpregulated = file.filename;
				}
				if (file.inputname == 'downregulated') {
					input.addDownregulated = file.filename;
				}
				if (file.inputname == 'druglist') {
					input.addDrugCsvPath = file.filename;
				}
			}

			const experimentFields = new DrugExperimentFields();			
			experimentFields.userid = req.user.id;
			experimentFields.addName = experName;
			experimentFields.addModelId = req.params.id;
			experimentFields.addState = DrugExperimentStatus.typeRunning();

			//Building XML value
			const settingsXML = ElementXML('drugSimulationSettings', [
				ElementXML('solver', solver),
				ElementXML('correction', correction),
				ElementXML('statistical', statistical),
				ElementXML('taxonId', input.taxonId),
				ElementXML('fluxRatioUp', input.fluxRatioUp),
				ElementXML('fluxRatioDown', input.fluxRatioDown),
				ElementXML('knockoutMethod', input.knockoutMethod),
				ElementXML('diseased', ''),
				ElementXML('healthy', ''),
				ElementXML('upregulated', input.upregulated),
				ElementXML('downregulated', input.downregulated)
			]);
			experimentFields.settings = generateXML(settingsXML);

			const experiment = new DrugExperiment(models);

			//Cheking how many analyzes is working now
			const previousExper = new DrugPrevExperiment(experimentFields, input);
			await experiment.checkIfExperimentShouldRun(previousExper);
			
			//Creating experiment
			let experData;
			if (!experId || experId<0) {
				logger.info('Creating a new Experiment '+experName)
				experData = await experiment.createExperiment(experimentFields);
			} else {
				logger.info('Editing an Experiment '+experId)
				experimentFields.addId = experId;
				await experiment.updateExperiment(experimentFields);
				experData = await experiment.getExperimentById(experId);
			}
	
			if (!experData) {
				throw new Error('Experiment was not created!');
			}

			experDataId = experData.id;

			//Create essentials folders
			const requiredFolders = await drugCreateRequiredFolders(model.id, experDataId);
			experLog = requiredFolders.logPath;
			input.addTmpDir = requiredFolders.directories.tmp;
			input.addLogFile = requiredFolders.logFile;
			input.addResultDir = requiredFolders.directories.new;

			await drugMoveListCSVFile(input, input.tmp_dir);
			await drugMoveRegulatedCSVFile(input, input.tmp_dir);

			const updatedSettingsXML = [
				ElementXML('solver', solver),
				ElementXML('correction', correction),
				ElementXML('statistical', statistical),
				ElementXML('taxonId', input.taxonId),
				ElementXML('fluxRatioUp', input.fluxRatioUp),
				ElementXML('fluxRatioDown', input.fluxRatioDown),
				ElementXML('knockoutMethod', input.knockoutMethod),
				ElementXML('diseased', ''),
				ElementXML('healthy', ''),
				ElementXML('dirdata', input.result_dir.trim()),
				ElementXML('contextname', requiredFolders.context.trim()),
				ElementXML('drugcsvpath', ""),
				ElementXML('upregulated', input.upregulated),
				ElementXML('downregulated', input.downregulated),
				ElementXML('logfile', input.log_file),
			];

			//Performing	
			const performAnalyze = new Promise(async (resolveSolver, rejectSolver) => {								
				try {
					logger.info(`Exporting metabolic model JSON for ID ${model.id} to \n${input.result_dir}`);
					input.addModelExported = await exportModel(model.id, 1, 'json', input.result_dir);

					updatedSettingsXML.push( ElementXML('jsonModel', input.model_exported) );

					const solverInput = new PerformSolverInput(input.result_dir);
					solverInput.addSolver = solver;
					solverInput.addTestResult = false;
					solverInput.addContextName = requiredFolders.context;
					solverInput.addDrugCsvPath = input.drug_csv_path;
					solverInput.addUpRegulated = input.upregulated;
					solverInput.addDownRegulated = input.downregulated;
					solverInput.addModelExported = input.model_exported;
					solverInput.addTaxonId = input.taxonId;
					solverInput.addFluxRatioUp = input.fluxRatioUp;
					solverInput.addFluxRatioDown = input.fluxRatioDown;
					solverInput.addKnockoutMethod = input.knockoutMethod;

					logger.info("Performing solver "+solver+"...");
					drugWriteLogs(input.log_file, ['Starting perform Solver']);
					const {data: resultScore } = await AnalysisService.request.post(`/drug/perform-solver`, solverInput);
					drugWriteLogs(input.log_file, ['Perform Solver finished']);
					resolveSolver(resultScore);
				} catch (_rr) {
					_rr.message = `At performing Solver. ${_rr.message}`;
					drugWriteLogs(input.log_file, ['[ERROR]: '+_rr.message]);
					rejectSolver(_rr);
				}
			});

			performAnalyze.then((_data) => {
				const experStatus = new DrugExperimentStatus(experDataId); 
				experStatus.activeCompleted();
				const experiment = new DrugExperiment(models);
				experiment.changeExperimentStatus(
					experStatus,
					[['settings', generateXML(ElementXML('drugSimulationSettings', updatedSettingsXML))]]
				);
			}).catch(_error => {
				const experStatus = new DrugExperimentStatus(experDataId, `Error: ${_error.message}`);
				experStatus.activeCompleted();
				const experiment = new DrugExperiment(models);
				experiment.changeExperimentStatus(
					experStatus,
					[['settings', generateXML(ElementXML('drugSimulationSettings', updatedSettingsXML))]]
				);
			});

			response.data = {
				modelId: req.params.id,
				experId: experDataId,
				experName: experData.name,
				experStatus: experData.state,
				statistical,
				correction,
				solver,
				experLog
			}

		} catch (err) {
			if (experDataId) {
				const errExperStatus = new DrugExperimentStatus(experDataId, `Error: ${err.message}`);
				errExperStatus.activeCompleted();
				const errExperiment = new DrugExperiment(models);
				errExperiment.changeExperimentStatus(errExperStatus);
			}
			response.setError(Response.Error.BAD_REQUEST, 'Error Analyzing Drug identification: ' + err.message);
		}

		res.status(response.code).json(response.json);
	});

/**
 * Load to analyzed Drug files
 */
router.get("/analyze/drug-identification/result/:experId", async (req, res) => {


	const response = new Response();
	const { attempts } = req.query;
	
	try {

		const initResponseData = {
			experId: req.params.experId,
			experStatus: '',
			attempts,
			file: "",
			cols: [],
			scores: []
		}

		if (attempts > LIMIT_REQ_ATTEMPT) {
			throw new Error('Oops! Exceeded attempt limit of '+LIMIT_REQ_ATTEMPT);
		}

		const experiment = new DrugExperiment(models);
		const experData = await experiment.getExperimentById(req.params.experId);
		initResponseData.experStatus = experData.state;

		if (initResponseData.experStatus === DrugExperimentStatus.typeCompleted()) {

			if (experData.err_msg) {
				throw new Error('Sorry! we found error on this action: '+experData.err_msg);
			}

			const xmlDoc = XMLParser.parseFromString(experData.settings);
			
			if (!('drugSimulationSettings' in xmlDoc)) {
				throw new Error('Simulation settings were not saved correctly');
			}

			const rootSettings = xmlDoc.drugSimulationSettings;

			if (!fs.existsSync(path.resolve(rootSettings.dirdata, rootSettings.contextname, 'ok.txt'))) {
				response.data = {...initResponseData, experStatus: DrugExperimentStatus.typeRunning()};
			} else {
				const parseScores = new DrugParseScores(path.resolve(rootSettings.dirdata, 'drug_score.csv'));
				const resData = {...initResponseData};
				resData.file = 'drug_score.csv';
				resData.cols = parseScores.getCols();
				resData.scores = parseScores.getRows();
				response.data = resData;
			}

		} else {
			response.data = initResponseData;
		}

	} catch (err) {
		response.setError(Response.Error.BAD_REQUEST, err.message);
	}

	res.status(response.code).json(response.json);

});

router.get("/analyze/drug-identification/log/:modelId/:dateLog/:timeLog", async (req, res) => {
	const options = {
    root: path.join('/uploads','drug', req.params.modelId, req.params.dateLog, req.params.timeLog),
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  }
	if (!fs.existsSync(options.root)) {
		return res.send('Log file not found!');
	}

  const fileName = 'logs.txt';
  res.sendFile(fileName, options, (err) => {
    if (err) logger.error(err)
  });
});

router.get("/analyze/scores/:type/:modelId/:dateScore", async (req, res) => {

	const response = new Response();
	const { type, modelId, dateScore } = req.params;

	try {
		const parseScores = new DrugParseScores(path.resolve(`/uploads/${type}/${modelId}/${dateScore}`, 'drug_score.csv'));
		const resData = {};
		resData.file = 'drug_score.csv';
		resData.cols = parseScores.getCols();
		resData.scores = parseScores.getRows();
		response.data = resData;
	} catch(err) {
		response.setError(Response.Error.BAD_REQUEST, 'Error to get scores. '+err.message);
	}

	res.status(response.code).json(response.json);
});

export default router;

