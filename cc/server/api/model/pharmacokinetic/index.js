import { isEmpty } from "lodash";
import logger from "../../../../logger";
import models from "../../../../models";
import { getLastModelVersion } from "../utils";
import cache from "../../../../cache";
import MODEL from "../../../../model";
import { waitSingleLoad, markSingleLoad, _objectify } from "../utils";


const _negateId = (id, negateId) => negateId ? parseInt(id) * -1 : id

const getModelJSON = async (id, {
	BaseModelId = null,
	VersionId = null,
	slim = false,
	negateId = false,
	modelType = null,
} = { }) => {
	let data = { };

	let dbModelClass = MODEL[modelType].dbModelClass;

	const model = await models[dbModelClass].findByPk(id);

	if ( !model ) {
		throw new Error(`No ${modelType} Model found for Base Model ${BaseModelId} \
			and Model Version ${VersionId}`);
	}

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
						negateId: negateId
					});
				} else if ( modelType === 'kinetic') {
					data =  await getKineticModelJSON(model, {
						slim: slim,
						negateId: negateId
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

export const getPharmacokineticModelJSON = async (model, {
	slim = false,
	negateId = false,
} = { }) => {
	let data = {};
	
	logger.info(`Fetching Compartments...`);

	const modelCompartments = await model.getPKCompartments({
		include: [{
			model: models.PKParameter,
			include: [{
				model: models.PKVariability,
				// as: "variability"
				include: [{
						model: models.Distribution,
				}]
			}, {
				model: models.PKDosing,
				// as: "dosing"
			}, {
				model: models.PKCovariate,
				include: [{
					model: models.Function,
				}]
			}]
		}]
	});
	const compartments = slim ? {} : [];
	const parameters = slim ? {} : [];
	const covariates = slim ? {} : [];
	const variabilities = slim ? {} : [];
	const dosings = slim ? {} : [];
	const populations = slim ? {} : [];
	const distributions = slim ? {} : [];
	const functions = slim ? {} : [];


	// build compartments
	modelCompartments.forEach((compartment) => {
		const newCompartmentId = _negateId(compartment.id, negateId);
		let newCompartment = {
			id: newCompartmentId,
			name: compartment.name,
			type: compartment.type,
			cmp: compartment.cmp,
			ext_type: compartment.ext_type,
		};
		
		compartment.PKParameters.forEach((parameter) => {
			const newParameterId = _negateId(parameter.id, negateId);
			let newParameter = {
				id: newParameterId,
				name: parameter.name,
				value: parameter.value,
				type: parameter.type,
				value_type: parameter.value_type,
				compartmentId: newCompartmentId
			};

			if (parameter.PKDosing) {
				const newDosingId = _negateId(parameter.PKDosing.id, negateId);
				let newDosing = {
					id: newDosingId,
					name: parameter.PKDosing.name,
					type: parameter.PKDosing.type,
					route: parameter.PKDosing.route,
					amount: parameter.PKDosing.amount,
					duration: parameter.PKDosing.duration,
					interval: parameter.PKDosing.interval,
					parameterId: newParameterId
				};

				if (slim) {
					dosings[newDosingId] = newDosing;
				} else {
					dosings.push({
						...newDosing,
						id: newDosingId,
						_createdBy: parameter.PKDosing._createdBy,
						_createdAt: parameter.PKDosing._createdAt,
						_updatedBy: parameter.PKDosing._updatedBy,
						_updatedAt: parameter.PKDosing._updatedAt
					});
				}
			}

			if (parameter.PKVariability) {
				const newVariabilityId = _negateId(parameter.PKVariability.id, negateId);
				let newVariability = {
					id: newVariabilityId,
					type: parameter.PKVariability.type,
					distributionId: parameter.PKVariability.distribution_id,
					parameterId: newParameterId
				};
				// console.log("PkVarCompartment", compartment);
				const newDistributionId = _negateId(parameter.PKVariability.Distribution.id, negateId);
				let newDistribution = {
					id: newDistributionId,
					name: parameter.PKVariability.Distribution.name,
					type: parameter.PKVariability.Distribution.type,
					parameters: parameter.PKVariability.Distribution.parameters,
				};

				if (slim) {
					variabilities[newVariabilityId] = newVariability;
					distributions[newDistributionId] = newDistribution;
				} else {
					variabilities.push({
						...newVariability,
						id: newVariabilityId,
						_createdBy: parameter.PKVariability._createdBy,
						_createdAt: parameter.PKVariability._createdAt,
						_updatedBy: parameter.PKVariability._updatedBy,
						_updatedAt: parameter.PKVariability._updatedAt
					});

					distributions.push({
						...newDistribution,
						id: newDistributionId,
						_createdBy: parameter.PKVariability.Distribution._createdBy,
						_createdAt: parameter.PKVariability.Distribution._createdAt,
						_updatedBy: parameter.PKVariability.Distribution._updatedBy,
						_updatedAt: parameter.PKVariability.Distribution._updatedAt
					});
				}
			}

			parameter.PKCovariates.forEach((covariate) => {
				const newCovariateId = _negateId(covariate.id, negateId);
				let newCovariate = {
					id: newCovariateId,
					name: covariate.name,
					type: covariate.type,
					functionId: covariate.function_id,
					parameterId: newParameterId
				};

				const newFunctionId = _negateId(covariate.Function.id, negateId);
				let newFunction = {
					id: newFunctionId,
					name: covariate.Function.name,
					formula: covariate.Function.formula,
					type: covariate.Function.type,
					parameters: covariate.Function.parameters,
				};

				if (slim) {
					covariates[newCovariateId] = newCovariate;
					functions[newFunctionId] = newFunction;
				} else {
					covariates.push({
						...newCovariate,
						id: newCovariateId,
						_createdBy: covariate._createdBy,
						_createdAt: covariate._createdAt,
						_updatedBy: covariate._updatedBy,
						_updatedAt: covariate._updatedAt
					});

					functions.push({
						...newFunction,
						id: newFunctionId,
						_createdBy: covariate.Function._createdBy,
						_createdAt: covariate.Function._createdAt,
						_updatedBy: covariate.Function._updatedBy,
						_updatedAt: covariate.Function._updatedAt
					});
				}
			});

			if (slim) {
				parameters[newParameterId] = newParameter;
			} else {
				parameters.push({
					...newParameter,
					id: newParameterId,
					_createdBy: parameter._createdBy,
					_createdAt: parameter._createdAt,
					_updatedBy: parameter._updatedBy,
					_updatedAt: parameter._updatedAt
				});
			}
		});

		if (slim) {
			compartments[newCompartmentId] = newCompartment;
		} else {
			compartments.push({
				...newCompartment,
				id: newCompartmentId,
				_createdBy: compartment._createdBy,
				_createdAt: compartment._createdAt,
				_updatedBy: compartment._updatedBy,
				_updatedAt: compartment._updatedAt
			});
		}
	});

	logger.info(`Fetching Rates...`);

	const modelRates = await model.getPKRates({
		include: [{
			model: models.PKParameter,
			include: [{
				model: models.PKVariability,
				include: [{
					model: models.Distribution,
				}]
			}, {
				model: models.PKDosing,
			}, {
				model: models.PKCovariate,
				include: [{
					model: models.Function,
				}]
			}]
		}]
	});
	const rates = slim ? {} : [];

	// build rates
	modelRates.forEach((rate) => {
		const newRateId = _negateId(rate.id, negateId);
		let newRate = {
			id: newRateId,
			name: rate.name,
			fromCompartmentId: _negateId(rate.from_compartment_id, negateId),
			toCompartmentId: _negateId(rate.to_compartment_id, negateId),
		};

		rate.PKParameters.forEach((parameter) => {
			const newParameterId = _negateId(parameter.id, negateId);
			let newParameter = {
				id: newParameterId,
				name: parameter.name,
				value: parameter.value,
				type: parameter.type,
				value_type: parameter.value_type,
				rateId: newRateId
			};

			if (parameter.PKVariability) {
				const newVariabilityId = _negateId(parameter.PKVariability.id, negateId);
				let newVariability = {
					id: newVariabilityId,
					type: parameter.PKVariability.type,
					distributionId: parameter.PKVariability.distribution_id,
					parameterId: newParameterId
				};

				const newDistributionId = _negateId(parameter.PKVariability.Distribution.id, negateId);
			let newDistribution = {
					id: newDistributionId,
					name: parameter.PKVariability.Distribution.name,
					type: parameter.PKVariability.Distribution.type,
					parameters: parameter.PKVariability.Distribution.parameters,
				};

				if (slim) {
					variabilities[newVariabilityId] = newVariability;
					distributions[newDistributionId] = newDistribution;
				} else {
					variabilities.push({
						...newVariability,
						id: newVariabilityId,
						_createdBy: parameter.PKVariability._createdBy,
						_createdAt: parameter.PKVariability._createdAt,
						_updatedBy: parameter.PKVariability._updatedBy,
						_updatedAt: parameter.PKVariability._updatedAt
					});

					distributions.push({
						...newDistribution,
						id: newDistributionId,
						_createdBy: parameter.PKVariability.Distribution._createdBy,
						_createdAt: parameter.PKVariability.Distribution._createdAt,
						_updatedBy: parameter.PKVariability.Distribution._updatedBy,
						_updatedAt: parameter.PKVariability.Distribution._updatedAt
					});
				}
			}

			parameter.PKCovariates.forEach((covariate) => {
				const newCovariateId = _negateId(covariate.id, negateId);
				let newCovariate = {
					id: newCovariateId,
					name: covariate.name,
					type: covariate.type,
					functionId: covariate.function_id,
					parameterId: newParameterId
				};

				const newFunctionId = _negateId(covariate.Function.id, negateId);
				let newFunction = {
					id: newFunctionId,
					name: covariate.Function.name,
					formula: covariate.Function.formula,
					type: covariate.Function.type,
					parameters: covariate.Function.parameters,
				};

				if (slim) {
					covariates[newCovariateId] = newCovariate;
					functions[newFunctionId] = newFunction;
				} else {
					covariates.push({
						...newCovariate,
						id: newCovariateId,
						_createdBy: covariate._createdBy,
						_createdAt: covariate._createdAt,
						_updatedBy: covariate._updatedBy,
						_updatedAt: covariate._updatedAt
					});

					functions.push({
						...newFunction,
						id: newFunctionId,
						_createdBy: covariate.Function._createdBy,
						_createdAt: covariate.Function._createdAt,
						_updatedBy: covariate.Function._updatedBy,
						_updatedAt: covariate.Function._updatedAt
					});
				}
			});

			if (slim) {
				parameters[newParameterId] = newParameter;
			} else {
				parameters.push({
					...newParameter,
					id: newParameterId,
					_createdBy: parameter._createdBy,
					_createdAt: parameter._createdAt,
					_updatedBy: parameter._updatedBy,
					_updatedAt: parameter._updatedAt
				});
			}
		});

		if (slim) {
			rates[newRateId] = newRate;
		} else {
			rates.push({
				...newRate,
				id: newRateId,
				_createdBy: rate._createdBy,
				_createdAt: rate._createdAt,
				_updatedBy: rate._updatedBy,
				_updatedAt: rate._updatedAt
			});
		}
	});

	logger.info('Fetching populations...')
	const modelPopulations = await model.getPKPopulations({
		include: [{
			model: models.Distribution,
		}]
	});

	// build populations
	modelPopulations.forEach((population) => {
		const newPopulationId = _negateId(population.id, negateId);
		let newPopulation = {
			id: newPopulationId,
			name: population.name,
			type: population.type,
			distributionId: population.distribution_id,
		};
		console.log("distribution_id", population.distribution_id, {population})
		const newDistributionId = _negateId(population.Distribution.id, negateId);
		let newDistribution = {
			id: newDistributionId,
			name: population.Distribution.name,
			type: population.Distribution.type,
			parameters: population.Distribution.parameters,
		};

		if (slim) {
			populations[newPopulationId] = newPopulation;
			distributions[newDistributionId] = newDistribution;
		} else {
			populations.push({
				...newPopulation,
				id: newPopulationId,
				_createdBy: population._createdBy,
				_createdAt: population._createdAt,
				_updatedBy: population._updatedBy,
				_updatedAt: population._updatedAt
			});

			distributions.push({
				...newDistribution,
				id: newDistributionId,
				_createdBy: population.Distribution._createdBy,
				_createdAt: population.Distribution._createdAt,
				_updatedBy: population.Distribution._updatedBy,
				_updatedAt: population.Distribution._updatedAt
			});
		}
	});

	// logger.info(`Fetching Reactions...`);
	
	// const modelReactions = await model.getKineticReactions({
	// 	include: [{
	// 		model: models.KineticLaw,
	// 		include: [{
	// 			model: models.KineticLocalParams
	// 		}]
	// 	}, {
	// 		model: models.KineticSpecies,
	// 		as: 'reactants'
	// 	}, {
	// 		model: models.KineticSpecies,
	// 		as: 'products'
	// 	}, {
	// 		model: models.KineticSpecies,
	// 		as: 'modifiers'
	// 	}]
	// });

	// const reactions	= slim ? { } : [ ];
	// const kineticLaws = slim ? { } : [ ];

	// modelReactions.forEach((reaction) => {
	// 	const newReactionId = _negateId(reaction.id, negateId);

	// 	let newReaction = {
	// 		name: reaction.name,
	// 		reaction_id: reaction.reaction_id,
	// 		reversible: reaction.reversible,
	// 		reactants: reaction.reactants.map(r => _negateId(r.id, negateId)),
	// 		products: reaction.products.map(p => _negateId(p.id, negateId)),
	// 		modifiers: reaction.modifiers.map(m => _negateId(m.id, negateId))
	// 	}

	// 	if (reaction.KineticLaw) {
	// 		const newKineticLawId = _negateId(reaction.KineticLaw.id, negateId);
	// 		newReaction.kinetic_law = newKineticLawId;

	// 		let parameters = {}
	// 		reaction.KineticLaw.KineticLocalParams.forEach(p => {
	// 			parameters[p.id] = {
	// 				name: p.name,
	// 				value: p.value
	// 			}
	// 		});


	// 		let newKineticLaw = {
	// 			formula: reaction.KineticLaw.formula,
	// 			type: reaction.KineticLaw.KineticLawTypeId,
	// 			reaction: newReactionId,
	// 			parameters: parameters
	// 		}

	// 		if (slim) {
	// 			kineticLaws[newKineticLawId] = newKineticLaw;
	// 		} else {
	// 			kineticLaws.push({
	// 				...newKineticLaw,
	// 				id: newKineticLawId,
	// 				_createdBy: reaction.KineticLaw._createdBy,
	// 				_createdAt: reaction.KineticLaw._createdAt,
	// 				_updatedBy: reaction.KineticLaw._updatedBy,
	// 				_updatedAt: reaction.KineticLaw._updatedAt
	// 			});
	// 		}
	// 	}

	// 	if (slim) {
	// 		reactions[newReactionId] = newReaction;
	// 	} else {
	// 		reactions.push({
	// 			...newReaction,
	// 			id: newReactionId,
	// 			_createdBy: reaction._createdBy,
	// 			_createdAt: reaction._createdAt,
	// 			_updatedBy: reaction._updatedBy,
	// 			_updatedAt: reaction._updatedAt
	// 		});
	// 	}
	// });

	// data.species = species;
	// data.compartments = slim ? mCompartmentMap : Object.values(mCompartmentMap);
	// data.reactions = reactions;
	// data.kinetic_laws = kineticLaws;

	data.pkcompartments = compartments;
	data.rates = rates;
	data.parameters = parameters;
	data.dosings = dosings;
	data.variabilities = variabilities;
	data.covariates = covariates;
	data.populations = populations;
	data.distributions = distributions;
	data.functions = functions;
	return data;
}

export const savePharmacokineticModel = async (user, modelId, versionId, model) => {
	return await models.sequelize.transaction(async (t) => {
		let updatedKey = `${modelId}/${versionId}`
		let updatedModel = { [updatedKey]: { } }

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
				modelType: "pharmacokinetic",
				...defaultAttrs
			}, { transaction: t });

			updatedModel[updatedKey].id = parseInt(mBaseModel.id)
		} else {
			logger.info(`Updating a Base Model...`);
			mBaseModel = await models.BaseModel.findByPk(modelId);

			if (!mBaseModel) {
				throw new Error(`Cannot find Model with ID: ${modelId}`)
			}

			updatedKey = `${mBaseModel.id}/${versionId}`
			updatedModel[updatedKey] = updatedModel[updatedKey] || {}

			let updated = false;
			
			if ("name" in model) {
				mBaseModel.name = model.name
				updated = true;
			}
	
			if ("type" in model) {
				mBaseModel.type = model.type
				updated = true;
			}
	
			if (updated) {
				mBaseModel._updateBy = user && user.id;
			}
			
			mBaseModel = await mBaseModel.save()
		}
	
		let mModelVersion = null;
		let mModel = null;
	
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
			}, { transaction: t });
	
			logger.info(`Creating Pharmacokinetic Model...`);
			mModel = await models.PharmacokineticModel.create({
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
	
			if (!mModelVersion) {
				throw new Error(`Model Version id ${versionId} for model ${mBaseModel.id} not found.`)
			}
	
			logger.info(`Fetching Pharmacokinetic Model.`);
			mModel = await models.PharmacokineticModel.findOne({
				where: {
					ModelVersionId: mModelVersion.id
				}
			});
	
			if (!mModel) {
				throw new Error(`Unable to find Constraint-Based Model.`)
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

		// if (modelAnnotations) {
		// 	if ('metabolites' in model) {
		// 		Object.entries(modelAnnotations).forEach(v => !v[1] && (modelAnnotationsRemove.push(v[0])));
		// 	}
		// }
		
		const saveEntity = async (model, entity, modelName, {
			returnMapper = null,
			bulk = false,
			add = false,
			species = false,
			mapper = null,
			mAnnotationMap = null,
			modelId = 0
		} = { }) => {
			const entityData = model[entity] || { };
			let entityIds = { };

			const mEntityMap = { };

			let created = false;
			

			const getOtherAttributes = async (entityObject) => {
				let otherAttrs = { }

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
			console.log('entityData', entityData)
			const createEntityDataKeys = Object.keys(entityData)
				.filter(key => `${key}`.charAt(0) == "-")

			if ( !isEmpty(createEntityDataKeys) && bulk ) {
				logger.info(`Creating bulk ${entity}`)

				const createEntityData = await Promise.all(
					createEntityDataKeys
						.map(k => entityData[k])
						.map(async entityObject => {
							const attributes = await getOtherAttributes(entityObject)
							return { ...entityObject, ...attributes }
						}));

				const keys = createEntityDataKeys

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
				logger.info("bulkCreate", createEntityData)
				const mEntityMapArr = await models[modelName].bulkCreate(createEntityData, { returning: true });
				logger.info("bulkCreate Successfull")

				for ( let i = 0 ; i < keys.length ; ++i ) {
					const key = keys[i];
					mEntityMap[`${key}`] = mEntityMapArr[i];
					entityIds = { ...entityIds, [`${key}`]: mEntityMapArr[i].id }
				}

				if ( add ) {
					logger.info(`Adding ${entity} to Pharmacokinetic Model...`);
					console.log(`add${modelName}s`);
					console.log(mModel[`add${modelName}s`])
					for (let assoc of Object.keys(models.PharmacokineticModel.associations)) {
    for (let accessor of Object.keys(models.PharmacokineticModel.associations[assoc].accessors)) {
      console.log(models.PharmacokineticModel.name + '.' + models.PharmacokineticModel.associations[assoc].accessors[accessor]+'()');
    }
  }
					await mModel[`add${modelName}s`](mEntityMapArr);
				}

				created = true;
			}

			for ( const key in entityData ) {
				const entityObject = entityData[key];

				if (!entityObject) {
					continue;
				}

				let mEntity = null;
				let mSpecies = null;

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
	
						otherAttrs = { ...otherAttrs, ...getOtherAttributes(entityObject) }
	
						mEntity = await models[modelName].create({
							...entityObject,
							...defaultAttrs,
							...otherAttrs
						})

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
							mEntity[metadata] = entityObject[metadata];
							updated = true;
						}

						if ( updated ) {
							mEntity._updateBy = user && user.id;
						}

						mEntity = await mEntity.save()
					}
				}

				if ( mAnnotationMap && entityObject ) {
					if ( "annotations" in entityObject ) {
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

		const { mAnnotationMap } = await saveEntity(model, "annotations", "Annotation", {
			bulk: true,
			modelId
		});

		const { mDistributionMap } = await saveEntity(model, "distributions", "Distribution", {
			bulk: true,
		});

		const { mFunctionMap } = await saveEntity(model, "functions", "Function", {
			bulk: true,
		});

		const { mPKCompartmentMap } = await saveEntity(model, "pkcompartments", "PKCompartment", {
			bulk: true,
			add: true
		});

		const { mPKRateMap } = await saveEntity(model, "rates", "PKRate", {
			bulk: true,
			add: true,
			mapper: {
				"fromCompartmentId": { target: "from_compartment_id", model: "PKCompartment", cache: mPKCompartmentMap },
				"toCompartmentId": { target: "to_compartment_id", model: "PKCompartment", cache: mPKCompartmentMap }
			},
			mAnnotationMap
		});

		const { mPKParameterMap } = await saveEntity(model, "parameters", "PKParameter", {
			bulk: true,
			mapper: {
				"compartmentId": { target: "PKCompartmentId", model: "PKCompartment", cache: mPKCompartmentMap },
				"rateId": { target: "PKRateId", model: "PKRate", cache: mPKRateMap }
			},
			mAnnotationMap
		});

		await saveEntity(model, "variabilities", "PKVariability", {
			bulk: true,
			mapper: {
				"distributionId": { target: "distribution_id", model: "Distribution", cache: mDistributionMap },
				"parameterId": { target: "parameter_id", model: "PKParameter", cache: mPKParameterMap }
			}
		});

		await saveEntity(model, "covariates", "PKCovariate", {
			bulk: true,
			mapper: {
				"parameterId": { target: "parameter_id", model: "PKParameter", cache: mPKParameterMap },
				"functionId": { target: "function_id", model: "Function", cache: mFunctionMap }
			}
		});

		await saveEntity(model, "dosings", "PKDosing", {
			bulk: true,
			mapper: {
				"parameterId": { target: "parameter_id", model: "PKParameter", cache: mPKParameterMap }
			}
		});

		await saveEntity(model, "populations", "PKPopulation", {
			bulk: true,
			add: true,
			mapper: {
				"distributionId": { target: "distribution_id", model: "Distribution", cache: mDistributionMap },
				// "covariateId": { target: "covariate_id", model: "PKCovariate", cache: mCovariateMap }
			}
		});

		// TODO: remove following comments after implementing pharmacokinetic model
		// const { mSubSystemMap } = await saveEntity(model, "subsystems", "SubSystem", { bulk: true })
		// const { mReactionMap } = await saveEntity(model, "reactions", "Reaction", {
		// 	bulk: true,
		// 	add: true,
		// 	mapper: {
		// 		"subsystem": { target: "SubSystemId", model: "SubSystem", cache: mSubSystemMap }
		// 	},
		// 	mAnnotationMap
		// });
		// await saveEntity(model, "reactionMetaboliteMap", "ReactionCoefficient", {
		// 	bulk: true,
		// 	mapper: {
		// 		"reaction": { target: "ReactionId", model: "Reaction", cache: mReactionMap },
		// 		"metabolite": { target: "MetaboliteId", model: "Metabolite", cache: mMetaboliteMap }
		// 	}
		// });
		// const { mGeneMap } = await saveEntity(model, "genes", "Gene", {
		// 	bulk: true,
		// 	add: true,
		// 	species: true,
		// 	mAnnotationMap
		// })
		// const { mRegulatorMap } = await saveEntity(model, "regulatorMap", "Regulator", {
		// 	returnMapper: "regulators",
		// 	bulk: true,
		// 	mapper: {
		// 		"regulationType": "type",
		// 		"conditionRelation": "conditionrelation",
		// 		"gene": { target: "GeneId", model: "Gene", cache: mGeneMap },
		// 		"reaction": { target: "ReactionId", model: "Reaction", cache: mReactionMap }
		// 	}
		// });
		// await saveEntity(model, "conditionMap", "Condition", {
		// 	returnMapper: "conditions",
		// 	bulk: true,
		// 	mapper: {
		// 		"regulatorId": { target: "regulator_id", model: "Regulator", cache: mRegulatorMap },
		// 		"speciesRelation": "speciesrelation"
		// 	}
		// });

		updatedModel[updatedKey].modelType = "pharmacokinetic";

		//remove cache and update it from the background
		await cache.call('JSON.DEL', `model:${mBaseModel.id}:version:${mModelVersion.id}:slim:true`);
		//update model for cache lazy in background ( not call the await )
		getModelJSON(mModel.id, {
			BaseModelId: mBaseModel.id,
			VersionId: mModelVersion.id,
			slim: true,
			modelType: 'pharmacokinetic'
		})

		return updatedModel;
	});
}

export const savePharmacokineticJSONModel = async (mModelVersion, model, modelAttrs, defaultAttrs) => {
	const transaction = await models.sequelize.transaction();
	try {
		const mModel = await models.PharmacokineticModel.create({
			name: model.name,
			ModelVersionId: mModelVersion.id, ...defaultAttrs,
		}, { transaction });


		let compartments = model.compartments.map(compartment => ({
			name: compartment.name,
			PharmacokineticModelId: mModel.id
		}))


		logger.info(`Creating ${compartments.length} compartments.`);
		compartments = await models.PKCompartment.bulkCreate(compartments, { transaction, returning: true });
		logger.info(`Created ${compartments.length} compartments.`);

		const mapNameCompartment = compartments.reduce((map, compartment) => {map[compartment.name] = compartment; return map;}, {});

		let rates = model.rates.map(rate => ({
			name: rate.name,
			fromCompartmentId: mapNameCompartment[rate.from_compartment].id,
			toCompartmentId: mapNameCompartment[rate.to_compartment].id,
			PharmacokineticModelId: mModel.id
		}))

		logger.info(`Creating ${rates.length} rates.`);
		rates = await models.PKRate.bulkCreate(rates, { transaction, returning: true });
		logger.info(`Created ${rates.length} rates.`);
		
		const mapNameRate = rates.reduce((map, rate) => {map[rate.name] = rate; return map;}, {});

		let parameters = model.parameters.map(parameter => ({
			name: parameter.name,
			value: parameter.value,
			value_type: parameter.value_type,
			PKRateId: parameter.rate ? mapNameRate[parameter.rate].id : null,
			PKCompartmentId: parameter.compartment ? mapNameCompartment[parameter.compartment].id : null,
		}))
		
		logger.info(`Creating ${parameters.length} parameters.`);
		parameters = await models.PKParameter.bulkCreate(parameters, { transaction, returning: true });
		logger.info(`Created ${parameters.length} parameters.`);

		await transaction.commit()
		
		logger.info(`Created...`);

		logger.info(`Building Compartments...`);

		modelAttrs.pkcompartments = _objectify(compartments, (compartment, i) => ({
			[compartment.id]: { name: compartment.name }
		}));

		logger.info(`Building Rates...`);

		modelAttrs.rates = _objectify(rates, (rate, i) => ({
			[rate.id]: {
				name: rate.name,
				fromCompartmentId: rate.from_compartment_id,
				toCompartmentId: rate.to_compartment_id 
			}
		}));

		logger.info(`Building Parameters...`);

		modelAttrs.parameters = _objectify(parameters, (parameter, i) => ({
			[parameter.id]: {
				name: parameter.name,
				value: parameter.value,
				value_type: parameter.value_type
			}
		}));

		return modelAttrs
	} catch (error) {
		await transaction.rollback()	

		throw error;
	}

}