import logger from "../../../logger";
import ModelMetabolicMap from './JsonMap/ModelMetabolicMap';
import ModelMetabolic from './ModelMetabolic';
import ModelKinetic from '../manageModel/ModelKinetic';
import { savePharmacokineticJSONModel } from '../model/pharmacokinetic';
import { parseGeneReactionRule } from '../../../util/reactionRules';
import axios from 'axios';

let logOutput;

export const _objectify	= (arr, fn) => {
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

export const getNewMAnnotationArr	= (annotation, attrs) => {
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

export const findLastModelVersion = async (models, modelId) => {
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

export class SaveModelSettings {
	constructor ({modelType, model, user, enableCache, enableLogging, enablePublish}) {
		this.modelType = modelType;
		this.model = model;
		this.user = user;
		this.enableCache = enableCache === undefined ? true : enableCache;
		this.enableLogging = enableLogging === undefined ? true : enableLogging;
		this.enablePublish = enablePublish;
	}
}

export default class SaveModel {

	/**
	 * @param {object} modelInstance 
	 * @param {object} transaction 
	 * @param {SaveModelSettings} settings 
	 */
	constructor (modelInstance = null, transaction = null, settings = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
		this.transaction = transaction;
		if (settings instanceof SaveModelSettings) {
			this.settings = settings;
		}		
	}

	async saveJSON() {
		let transaction = this.transaction,
				user = this.settings.user,
				model = this.settings.model,
				modelType = this.settings.modelType;
		
		if (!transaction) {
			transaction = await this.dbInstance.sequelize.transaction();
		}

		if (this.settings.enableLogging) {
			logOutput = logger;
		} else {
			logOutput = {info:()=>null}
		}

		try {

			let modelAttrs = { };

			let defaultAttrs	= { };

			if ( user ) {
				defaultAttrs 	= {
					_createdBy: user && user.id,
					_updatedBy: user && user.id
				};
			}

			logOutput.info("Creating a Base Model...");
			const mBaseModel = await this.dbInstance.BaseModel.create({
				name: model.name || "Unnamed Model",
				type: "research",
				modelType: modelType,
				userid: user && user.id || undefined,
				published: Boolean(this.settings.enablePublish),
				...defaultAttrs
			}, { transaction });
			logOutput.info(`Base Model ${mBaseModel.id} created.`);

			modelAttrs = { ...modelAttrs,
				id:							mBaseModel.id,
				modelType:			mBaseModel.modelType,
			}

			const lastModelVersion = await findLastModelVersion(this.dbInstance, mBaseModel.id)

			let mLastModelVersion = await this.dbInstance.ModelVersion.findOne({
				limit: 1,
				order: [
					["id", "DESC"]
				]
			});

			if (mLastModelVersion === null) {
				mLastModelVersion = {
					id: 0,
				}
			}

			logOutput.info(`Last Model Version ID: ${parseInt(mLastModelVersion.id)}`);
		
			logOutput.info("Creating a Model Version...");
			const mModelVersion = await this.dbInstance.ModelVersion.create({
				id: parseInt(mLastModelVersion.id) + 1,
				modelid: mBaseModel.id,
				version: (lastModelVersion && lastModelVersion.version) || 1,
				selected: lastModelVersion ? false : true,
				userid: user && user.id,
				...defaultAttrs
			}, { transaction });
			logOutput.info(`Model Version ${mModelVersion.id} created.`);

			// let versionMeta 		= { };

			// versionMeta.id					= parseInt(mModelVersion.id)
			modelAttrs.version			= parseInt(mModelVersion.version)

			modelAttrs.name					= mModelVersion.name || mBaseModel.name;

			modelAttrs.default			= mModelVersion.selected;

			modelAttrs._createdBy 	= mModelVersion._createdBy;
			modelAttrs._createdAt 	= mModelVersion._createdAt;
			modelAttrs._updatedBy 	= mModelVersion._updatedBy;
			modelAttrs._updatedAt 	= mModelVersion._updatedAt;

			// if ( shallow ) {
			// modelAttrs.modelType		= mBaseModel.modelType;
			let mModel = null, mRegulatorsArr = [];

			const _fastMap = (arr, fn) => {
				const newArr = [ ];
				for ( let i = 0, n = arr.length ; i < n ; ++i ) {
					newArr.push(fn(arr[i]))
				}
				return newArr
			}

			const _fastFilter = (arr, fn) => {
				const newArr = [ ];
				for ( let i = 0, n = arr.length ; i < n ; ++i ) {
					const o = arr[i];
					if ( fn(o) ) {
						newArr.push(o)
					}
				}
				return newArr
			}

			if (modelType === "metabolic") {
				logOutput.info("Creating a Constraint-Based Model...");
				// adding missing entities prevents errors in logic below eg model.genes when genes is missing
				const addMissingEntities = (model) => {
					const { metabolites, species, reactions, genes } = model;
					// Rename species to metabolites in reaction products and reactants | Remove species | create reaction.metabolite with stoichiometry values
					const updatedReactions  = reactions.map(reaction => {
						// Rename species to metabolites in reactants and products
						let reactants = [], products = [];
						if (Array.isArray(reaction.reactants)) {
							reactants = reaction.reactants.map(reactant => ({
								...reactant,
								metabolites: reactant.species,
								species: undefined, // Remove species
							}));
						}
						if (Array.isArray(reaction.products)) {
							products = reaction.products.map(product => ({
								...product,
								metabolites: product.species,
								species: undefined, // Remove species
							}));
						}
					
						// Build metabolites object with stoichiometry values
						const metabolites = {};
					
						reactants.forEach(reactant => {
							metabolites[reactant.metabolites] = (metabolites[reactant.metabolites] || 0) - reactant.stoichiometry;
						});
					
						products.forEach(product => {
							metabolites[product.metabolites] = (metabolites[product.metabolites] || 0) + product.stoichiometry;
						});
					
						// Return updated reaction
						return {
							...reaction,
							reactants,
							products,
							metabolites, // Add metabolites object
						};
					});

					return {
							...model,
							metabolites: metabolites || species || [],
							reactions: updatedReactions || [],
							genes: genes || []
					};
				};
				model = addMissingEntities(model)
				mModel = await this.dbInstance.ConstraintBasedModel.create({
					ModelVersionId: mModelVersion.id, ...defaultAttrs, 
				}, { transaction });
				logOutput.info(`Constraint-Based Model ${mModel.id} created.`);

					
				// ==== Compartment ====
				// let mCompartmentMapArr = Object.entries(model.compartments).map(e => ({
				// 	name: e[1], compartmentId: e[0], ...defaultAttrs
				// }));
				const createCompartments = (compartments) =>
					Object.entries(compartments).map((e) => {
						let currentCompartment = { ...defaultAttrs };
						if (typeof e[1] == "object") {
							if (e[1].hasOwnProperty("id")) {
								currentCompartment.compartmentId = e[1].id;
							}
							if (e[1].hasOwnProperty("name")) {
								currentCompartment.name = e[1].name;
							}
						} else {
							currentCompartment.name = e[1];
							currentCompartment.compartmentId = e[0];
						}
						return currentCompartment;
					});
				let mCompartmentMapArr = createCompartments(model.compartments)

				logOutput.info(`Creating ${mCompartmentMapArr.length} compartments.`);
				mCompartmentMapArr 		= await this.dbInstance.Compartment.bulkCreate(mCompartmentMapArr, { transaction, returning: true });
				logOutput.info(`Created ${mCompartmentMapArr.length} compartments.`);
				const mCompartmentMap = mCompartmentMapArr.reduce((m, x) => {m[x.compartmentId] = x; return m;}, {});
			
				// ==== Species Metabolite ====
				let mSpeciesArr = model.metabolites.map(metabolite => ({
					speciesId: metabolite.id,
					name: metabolite.name,
					...defaultAttrs
				}));
				logOutput.info(`Creating ${mSpeciesArr.length} species.`);
				mSpeciesArr = await this.dbInstance.Species.bulkCreate(mSpeciesArr, { transaction, returning: true });
				logOutput.info(`Created ${mSpeciesArr.length} species.`);
			
				// ==== Metabolites ====
				const mMetaboliteMap  = { };
				logOutput.info("Creating Metabolites...");
				model.metabolites.forEach((metabolite, metaboliteId) => {
					const mSpecies	    = mSpeciesArr[metaboliteId];
			
					let compartmentId 	= null;
					if ( metabolite.compartment ) {
						compartmentId			= mCompartmentMap[metabolite.compartment].id;
					}
			
					mMetaboliteMap[metabolite.id] = {
						name: 						mSpecies.name,
						formula:					metabolite.formula,
						charge: 					metabolite.charge,
						SpeciesId:				mSpecies.id,
						CompartmentId:		compartmentId,
						...defaultAttrs
					};
				});
				const tmpEntriesMetaboliteMap = Object.entries(mMetaboliteMap);
				let newMetabolitiesArr = tmpEntriesMetaboliteMap.map(e => e[1]);
				logOutput.info(`Creating ${newMetabolitiesArr.length} Metabolite...`);
				newMetabolitiesArr = await this.dbInstance.Metabolite.bulkCreate(newMetabolitiesArr, { transaction, include: [{ model: this.dbInstance.Species }], returning: true });
				logOutput.info(`Created ${newMetabolitiesArr.length} Metabolite.`);
				tmpEntriesMetaboliteMap.forEach((e, i) => mMetaboliteMap[e[0]] = newMetabolitiesArr[i]);
			
				const newMAnnotationArr = [];
				for ( const metabolite of model.metabolites ) {
					if (metabolite.annotation) {
						getNewMAnnotationArr(metabolite.annotation, {
							MetaboliteId: mMetaboliteMap[metabolite.id].id,
							...defaultAttrs
						}).forEach(x => newMAnnotationArr.push(x));
					}
				}
				
				logOutput.info(`Adding ${newMetabolitiesArr.length} Metabolite to Constraint-Based Model ${mModel.id}...`);
				await mModel.addMetabolites(newMetabolitiesArr, { transaction });
			
				logOutput.info(`Adding Sub System information to constraint-based model...`);
				let mSubSystemArr = Array.from(new Set(model.reactions.map(r => r.subsystem)))
					.map(s => ({ name: s, ...defaultAttrs }))
				logOutput.info(`Creating ${mSubSystemArr.length} subsystems.`);
				mSubSystemArr = await this.dbInstance.SubSystem.bulkCreate(mSubSystemArr, { transaction, returning: true });
				logOutput.info(`Created ${mSubSystemArr.length} subsystems.`);
				const mSubSystemMap = mSubSystemArr.reduce((m, x) => {m[x.name] = x; return m;}, {});
			
				// ==== Set non-repeated position ====
				model.genes = model.genes.map((g, i) => ({...g, position: i}));

				// ==== Species Gene====
				let mSpeciesGeneArr = model.genes.map(gene => ({
					position: gene.position,
					speciesId: gene.id,
					name: gene.name,
					...defaultAttrs
				}));
				logOutput.info(`Creating ${mSpeciesGeneArr.length} species.`);
				mSpeciesGeneArr = await this.dbInstance.Species.bulkCreate(mSpeciesGeneArr, { transaction, returning: ['id','position'] });
				logOutput.info(`Created ${mSpeciesGeneArr.length} species.`);
			
				// ==== Gene ====
				const mGeneMap = { };
				logOutput.info("Creating Gene...");
				model.genes.forEach(gene => {
					const mSpecies = mSpeciesGeneArr.filter(s => s.position == gene.position);
					mGeneMap[gene.id] = {
							position: gene.position,
							SpeciesId: mSpecies[0].id,
							...defaultAttrs
					};
				});
			
				let newGeneArr =  Object.entries(mGeneMap).map(e => e[1]);
				logOutput.info(`Creating ${newGeneArr.length} Gene...`);
				const tmpEntriesGeneMap = Object.entries(mGeneMap);
				newGeneArr = await this.dbInstance.Gene.bulkCreate(newGeneArr, { transaction, returning: ['id','position'] });
				tmpEntriesGeneMap.forEach((e, i) => mGeneMap[e[0]] = newGeneArr[i]);
				logOutput.info(`Created ${newGeneArr.length} Gene.`);

				model.genes.forEach(gene => {
					const mGenes = newGeneArr.filter(g => g.position == gene.position);
					mGeneMap[gene.id].id = mGenes[0].id; //used by Reactions
					if (gene.annotation) {
						getNewMAnnotationArr(gene.annotation, {
							GeneId: mGenes[0].id,
							...defaultAttrs
						}).forEach(x => newMAnnotationArr.push(x));
					}
				});
				
				logOutput.info(`Adding ${newGeneArr.length} Metabolite to Constraint-Based Model ${mModel.id}...`);
				await mModel.addGene(newGeneArr, { transaction });
				
				// ==== Reactions ====
				const mReactionMap = {};
				model.reactions.forEach((reaction) => {
					mReactionMap[reaction.id] = {
						...defaultAttrs
					};
				});
				let newMReactionsArr = model.reactions.map(reaction => {
						return {
							boundary: 				reaction.id.toLowerCase().startsWith("EX_".toLowerCase()) ? "exchanges" :
																reaction.id.toLowerCase().startsWith("DM_".toLowerCase()) ? "demands" :
																reaction.id.toLowerCase().startsWith("SK_".toLowerCase()) ? "sinks" : null,
							reactionId: 			reaction.id,
							name:							reaction.name,
							// subsystem:				reaction.subsystem
							lowerBound:				parseFloat(reaction.lower_bound),
							upperBound:				parseFloat(reaction.upper_bound),
							SubSystemId: 			mSubSystemMap[reaction.subsystem || null].id,
							objectiveCoefficient: reaction.objective_coefficient || 0,
							...defaultAttrs
						}
				});
				logOutput.info(`Creating ${newMReactionsArr.length} reactions...`);
				const tmpEntriesReactionMap = Object.entries(mReactionMap);
				newMReactionsArr = await this.dbInstance.Reaction.bulkCreate(newMReactionsArr, { transaction, returning: true });
				tmpEntriesReactionMap.forEach((e, i) => mReactionMap[e[0]] = newMReactionsArr[i]);
				logOutput.info(`Created ${newMReactionsArr.length} reactions`);
			
				const newMReactionCoefficientArr = [];
				const newMRegulatorsArr = [];
				//const newMConditionsArr = [];

				const reactionRules = [ ];

				for ( let i = 0, n = model.reactions.length ; i < n ; ++i ) {
					const reaction = model.reactions[i]
					const rule = reaction.gene_reaction_rule
					reactionRules.push(parseGeneReactionRule(rule, this.settings.enableLogging, {n,i}));
				}

				const reactionRulesParsed = Array.from(await axios.all(reactionRules)).map(r => (r ? r.data.data : null));

				const reactionCoefficientMap = { }
				const mRegulatorsMap = [ ]
			
				for ( let i = 0 ; i < model.reactions.length ; ++i ) {
					const reactionId = i;
					const reaction = model.reactions[i];
					
					const mReaction	= newMReactionsArr[reactionId];
			
					if ( reaction.annotation ) {
						getNewMAnnotationArr(reaction.annotation, {
							ReactionId: mReaction.id,
							...defaultAttrs
						}).forEach(x => newMAnnotationArr.push(x));
					}
			
					for ( const metabolite in reaction.metabolites ) {
						const coefficient		= reaction.metabolites[metabolite];
						const mMetabolite 	= mMetaboliteMap[metabolite];
			
						newMReactionCoefficientArr.push({
							MetaboliteId: mMetabolite.id,
							ReactionId: mReaction.id,
							coefficient: coefficient,
							...defaultAttrs
						});

						reactionCoefficientMap[mReaction.id] = { ...(reactionCoefficientMap[mReaction.id] || { }), [mMetabolite.id]: coefficient }
					}

					const result = reactionRulesParsed[i]
			
					if ( result ) {
							const mGeneComponentMap 	= { }
							const componentGeneIdMap  = { };
							const mReactionGeneComponentMap = { };
				
							for ( const component in result.components ) {
								const componentName = result.components[component].name;
								const GeneId = mGeneMap[componentName].id
				
								mGeneComponentMap[GeneId] = componentName
								componentGeneIdMap[component] = mGeneMap[componentName]
			
								mReactionGeneComponentMap[componentName] = {
									GeneId: GeneId,
									ReactionId: mReaction.id,
									...defaultAttrs
								}
							}
			
							for ( const regulator in result.regulators ) {
								const regulatorInfo = result.regulators[regulator];
								const componentInfo = result.components[regulatorInfo.component];
								const componentName = componentInfo.name;
								const conditions = regulatorInfo.conditions || [];
								
								newMRegulatorsArr.push({
									type: regulatorInfo.type ? "POSITIVE" : "NEGATIVE",
									conditionrelation: regulatorInfo.conditionRelation ? "AND" : "OR",
									reactionGene: mReactionGeneComponentMap[componentName],
									conditions: conditions.map(c => ({
										state: c.state ? "ON" : "OFF",
										type: c.type  ? "IF_WHEN" : "UNLESS",
										speciesrelation: c.componentRelation ? "AND" : "OR",
										species: c.components && c.components.map(componentName => ({
											species_id: componentGeneIdMap[componentName].SpeciesId,
											GeneId: componentGeneIdMap[componentName].id,
											...defaultAttrs,
										})),
										...defaultAttrs
									})),
									...defaultAttrs
								});

								mRegulatorsMap.push({
									GeneId: mReactionGeneComponentMap[componentName].GeneId,
									ReactionId: mReactionGeneComponentMap[componentName].ReactionId
								})

								
							}
						}
				}
			
			const metabolic = new ModelMetabolic(this.dbInstance, transaction);
			const metabolicMap = new ModelMetabolicMap();
			const modelReactions = model.reactions.map((v, k) => {
				v.newId = newMReactionsArr[k].id;
				return v;
			})

				if ( model.annotation ) {
					getNewMAnnotationArr(model.annotations, {
						ConstraintBasedModelId: mModel.id,
						...defaultAttrs
					}).forEach(x => newMAnnotationArr.push(x));
				}
			
				logOutput.info(`Creating ${newMReactionCoefficientArr.length} ReactionCoefficient...`);
				logOutput.info(`Creating ${newMRegulatorsArr.length} Regulators...`);
				// logOutput.info(`Creating ${newMConditionsArr.length} Conditions...`);
				logOutput.info(`Adding ${newMReactionsArr.length} Reactions to Constraint-Based Model ${mModel.id}...`);
				logOutput.info(`Creating ${newMAnnotationArr.length} Annotations...`);
			
				const responses = await Promise.all([
					this.dbInstance.ReactionCoefficient.bulkCreate(newMReactionCoefficientArr, { transaction }),
					this.dbInstance.Regulator.bulkCreate(newMRegulatorsArr, {
						include: [{
							association: this.dbInstance.Regulator.ReactionGene,
							as: "reactionGene",
							ignoreDuplicates: true
						}, {
							association: this.dbInstance.Regulator.Conditions,
							as: "conditions",
							include: [{
								association: this.dbInstance.Condition.Species,
								as: "species",
								ignoreDuplicates: true
							}]
						}],
						transaction
					}),
					this.dbInstance.Annotation.bulkCreate(newMAnnotationArr, { transaction }),
					mModel.addReactions(newMReactionsArr, { transaction })
					// this.dbInstance.ConditionSpecies.bulkCreate(newMConditionsSpeciesArr, { ignoreDuplicates: true })
				]);

				logOutput.info(`Created...`);

				const mAnnotationsArr = responses[2];
				mRegulatorsArr = responses[1];

				logOutput.info(`Building Conditions Map`)

				logOutput.info(`Building Metabolites...`)

				modelAttrs.metabolites = _objectify(newMetabolitiesArr, (next, i) => ({
					[next.id]: {
						name: model.metabolites[i].name, speciesId: model.metabolites[i].id,
						formula: next.formula, charge: next.charge,
						compartment: next.CompartmentId,
						annotations: _fastMap(_fastFilter(mAnnotationsArr, i => i.MetaboliteId == next.id), i => i.id)
					}
				}))

				logOutput.info(`Building Genes...`)
				modelAttrs.genes = _objectify(newGeneArr, (next) => {
					let mGenes = model.genes.filter(g => g.position == next.position);
					mGenes = mGenes[0];
					return {
						[next.id]: { name: mGenes.name, speciesId: mGenes.id,
							annotations: _fastMap(_fastFilter(mAnnotationsArr, i => i.GeneId == next.id), i => i.id)
						}
				}});
				logOutput.info(`Building Annotations...`)

				modelAttrs.annotations = _objectify(mAnnotationsArr, (next, i) => ({
					[next.id]: { source: next.source, annotations: next.annotations }
				}));

				logOutput.info(`Building Reactions...`)

				modelAttrs.reactions = _objectify(newMReactionsArr, (next, i) => {
					const subName = model.reactions[i].subsystem

					const subsystem = subName in mSubSystemMap ? mSubSystemMap[subName].id : null;

					return {
						[next.id]: {
							annotations: _fastMap(_fastFilter(mAnnotationsArr, i => i.ReactionId == next.id), i => i.id),
							name: next.name, reactionId: next.reactionId,
							lowerBound: next.lowerBound, upperBound: next.upperBound,
							objectiveCoefficient: next.objectiveCoefficient,
							metabolites: reactionCoefficientMap[next.id],
							subsystem: subsystem
						}
					}
				})

				logOutput.info(`Building Regulators`)

				modelAttrs.regulators = _objectify(mRegulatorsArr, (next, i) => ({
					[next.id]: {
						type: next.type,
						conditionRelation: next.conditionrelation,
						gene: mRegulatorsMap[i].GeneId,
						reaction: mRegulatorsMap[i].ReactionId
					}
				}))

				modelAttrs.subsystems = _objectify(mSubSystemArr, (next, i) => ({
					[next.id]: {
						name: next.name
					}
				}))
				modelAttrs.compartments = _objectify(mCompartmentMapArr, (next, i) => ({
					[next.id]: { name: next.name, compartmentId: next.compartmentId }
				}))

				const pageDefaultAttrs = {
					creationdate: this.dbInstance.Sequelize.fn('NOW'),
					creationuser: user && user.id,
					updatedate: this.dbInstance.Sequelize.fn('NOW'),
					updateuser: user && user.id
				};

				modelAttrs.pageMap = {};
				modelAttrs.sectionMap = {};
				modelAttrs.contentMap = {};
				modelAttrs.contentReferenceMap = {};	
				modelAttrs.referenceMap = {};
		
				logOutput.info("Creating Page Model Map...");

				var pageMap = []; 

				const createPage = (reactionId, geneId, speciesId, metaboliteId, compartmentId) => {
					return {
							reactionId: reactionId,
							geneId: geneId,
							speciesId: speciesId,
							metaboliteId: metaboliteId,
							compartmentId: compartmentId
					};
				};
			
				model['metabolites'].forEach(metabolite => {
						pageMap.push(createPage(null, null, mMetaboliteMap[metabolite.id]?.speciesId, mMetaboliteMap[metabolite.id]?.id, mCompartmentMap[metabolite.compartment]?.id));
				});
			
				model['reactions'].forEach(reaction => {
						pageMap.push(createPage(mReactionMap[reaction.id]?.id, null, null, null, null));
				});
			
				model['genes'].forEach(gene => {
						pageMap.push(createPage(null, mGeneMap[gene.id]?.id, null, null, null));
				});
			
				
				const mPageModelMap = await this.dbInstance.PageModel.bulkCreate(
						pageMap.map(page => ({
								...page,
								...pageDefaultAttrs,
								ModelVersionId: mModelVersion.id
						})),
						{ transaction }
				);

				const pageMapModelAttrs = {};

				mPageModelMap.forEach(item => {
					pageMapModelAttrs[item.id] = {
						"newType": true,
						"reactionId": item.reactionId,
						"geneId": item.geneId,
						"metaboliteId": item.metaboliteId,
						"compartmentId": item.compartmentId
					};
				});

				modelAttrs.pageMap = pageMapModelAttrs;

				logOutput.info("Page Model Map created.");

				logOutput.info("Creating Section Model Map...");

				var sectionMap = []; 

				const createSection = (pageModelId, title) => {
					return {
							pageModelId: pageModelId,
							title: title,
							type: "Description",
							position: 0
					};
				};
			
				model['metabolites'].forEach(metabolite => {
						const pageModelId = mPageModelMap.find(page => page.metaboliteId == mMetaboliteMap[metabolite.id]?.id)?.id;
						sectionMap.push(createSection(pageModelId, metabolite.name));
				});
				
				model['reactions'].forEach(reaction => {
						const pageModelId = mPageModelMap.find(page => page.reactionId == mReactionMap[reaction.id]?.id)?.id;
						sectionMap.push(createSection(pageModelId, reaction.name));
				});
				
				model['genes'].forEach(gene => {
						const pageModelId = mPageModelMap.find(page => page.geneId == mGeneMap[gene.id]?.id)?.id;
						sectionMap.push(createSection(pageModelId, gene.name));
				});
			
				
				const mSectionModelMap = await this.dbInstance.SectionModel.bulkCreate(
						sectionMap.map(section => ({
								...section,
								...pageDefaultAttrs
						})),
						{ transaction }
				);

				const sectionMapModelAttrs = {};

				mSectionModelMap.forEach(item => {
					sectionMapModelAttrs[item.id] = {
						"position": item.position,
						"pageId": item.pageModelId,
						"type": item.type,
						"title": item.title
					};
				});

				modelAttrs.sectionMap = sectionMapModelAttrs;
				
				logOutput.info("Section Model Map created.");

				logOutput.info("Creating Content Model Map...");
				
				var contentMap = []; 

				const addContentForNotes = (entity, entityType, idMap, pageIdKey) => {
					if (entity.notes) {
							const entityPageId = idMap[entity.id]?.id;
							const page = mPageModelMap.find(page => page[pageIdKey] == entityPageId);
							const sectionModelId = page ? mSectionModelMap.find(section => section.pageModelId == page.id)?.id : null;
			
							if (sectionModelId) {
									const contentEntries = Object.keys(entity.notes).map(key => ({
											sectionModelId: sectionModelId,
											text: key,
											position: 0,
											flagged: false
									}));	
									contentMap.push(...contentEntries);							
									
								logOutput.info(`Creating ${entityType} Notes...`);
							}
					}
			};		
				
				model['metabolites'].forEach(metabolite => {
						addContentForNotes(metabolite, 'metabolite', mMetaboliteMap, 'metaboliteId');
				});
				
				model['reactions'].forEach(reaction => {
						addContentForNotes(reaction, 'reaction', mReactionMap, 'reactionId');
				});
				
				model['genes'].forEach(gene => {
						addContentForNotes(gene, 'gene', mGeneMap, 'geneId');
				});
			

				const mContentModelMap = await this.dbInstance.ContentModel.bulkCreate(
						contentMap.map(content => ({
								...content,
								...pageDefaultAttrs
						})),
						{ transaction }
				);

				const contentModelMapAttrs = {};

				mContentModelMap.forEach(item => {
					contentModelMapAttrs[item.id] = {
						"position": item.position,
						"sectionId": item.sectionModelId,
						"text": item.text,
						"flagged": item.flagged
					};
				});

				modelAttrs.contentMap = contentModelMapAttrs;

				logOutput.info("Content Model Map created.");


				logOutput.info("Creating Reference Map...");

				var referenceSet = new Set(); 

				const addReferences = (entity) => {
					if (entity.notes) {
							for (const [key, value] of Object.entries(entity.notes)) {
									if (key == 'References') {
										const identifiers = (typeof value === 'string' && value !== "without references") ? value.split(',') : [];
										identifiers.map(n => n && ReferPmidDoi.testValidValue(n)).forEach(identifier => identifier && referenceSet.add(identifier));
									}
							}
					}
				};
				model['metabolites'].forEach( metabolite => {
						addReferences(metabolite);
				});
				
				model['reactions'].forEach( reaction => {
						addReferences(reaction);
				});
				
				model['genes'].forEach( gene => {
						addReferences(gene);
				});

				addReferences(model) // save  model references

				const referencesValue = [...referenceSet].map(id => `${id}`);
				if (referencesValue.length > 0) {
				const appResponse = await AppService.request.post(`/knowledge/lookupRefs`, {
					refs: referencesValue
				}, {
					headers: {
						"Content-Type": "application/json",
						"Content-Length": Buffer.byteLength(JSON.stringify({ refs: referencesValue }))
					}
				});
				
				const mReferenceMap = Object.entries(appResponse.data).map(([id, details]) => ({
					id,
					...details
				}));
				
				logOutput.info("Reference Map created.");

				const referenceMapAttrs = {};

				mReferenceMap.forEach(item => {
					referenceMapAttrs[item.id] = {
						"shortCitation": item.shortCitation,
						"creationUser": item.creationUser,
						"text": item.text,
						"creationDate": item.creationDate,
						"updateUser": item.updateUser,
						"updateDate": item.updateDate,
						"pmid": item.pmid,
						"doi": item.doi
					};
				});

				modelAttrs.referenceMap = referenceMapAttrs;

				logOutput.info("Creating Content Reference Map...");

				const contentReferenceMap = [];
				var maxId = await this.dbInstance.ContentModelReference.max('id');

				const getNextContentReferenceIdSequenceValue = async  () => {
					const result = (await this.dbInstance.sequelize.query("SELECT nextval('public.content_reference_id_seq')",{ 
						type: QueryTypes.SELECT, 
					}))[0];

					return result.nextval;
				}
				
				const processNotes = async (entity, idMap, idKey) => {
					if (entity.notes) {
							const pageModelId = idMap[entity.id]?.id;
							const page = mPageModelMap.find(page => page[idKey] == pageModelId);
							const sectionModelId = page ? mSectionModelMap.find(section => section.pageModelId == page.id)?.id : null;
			
							if (!sectionModelId) {
									return; 
							}
			
								const notesEntries = Object.entries(entity.notes)
								for(let i = 0; i < notesEntries.length; i++) {
									const [key, value] = notesEntries[i]
									const identifiers = value != "without references" ? value.split(',') : [];
			
										for(let j = 0; j < identifiers.length; j++) {
											const identifier = identifiers[j]
											const contentModelId = mContentModelMap.find(content => content.text == key && content.sectionModelId == sectionModelId)?.id;
											const referenceId = mReferenceMap.find(reference => reference.pmid == identifier || reference.doi == identifier)?.id;
											maxId = (maxId || 0) + 1;
											if (contentModelId && referenceId) {
													const content = {
															id: maxId,
															content_id: contentModelId,
															reference_id: referenceId,
															position: 0,
															dataType: null,
															citationType: null
													};
			
													contentReferenceMap.push(content);
											}
									}
							}
					}
			};		

			// process notes using await to ensure bulkcreate is called after contentReferenceMap is resolved
			const processNotesHelper = async (entityMap, entityIdName, entityArr) => {
				for(let i = 0; i < entityArr.length; i++){
					const entity = entityArr[i]
					await processNotes(entity, entityMap, entityIdName);
				}
			}
			
			await processNotesHelper(mMetaboliteMap, 'metaboliteId', model['metabolites']);
			await processNotesHelper(mReactionMap,'reactionId', model['reactions']);
			await processNotesHelper(mGeneMap, 'geneId', model['genes']);
			

				const mContentReferenceMap = await this.dbInstance.ContentModelReference.bulkCreate(
					contentReferenceMap.map(content => ({
							...content,
							...pageDefaultAttrs

					})),
					{ transaction }
				);

				const contentReferenceMapAttrs = {};

				mContentReferenceMap.forEach(item => {
					contentReferenceMapAttrs[item.id] = {
						"position": item.position,
						"creationDate": item.creationdate,
						"creationUser": item.creationuser,
						"contentId": item.content_id,
						"citationType": item.citationtype,
						"dataType": item.datatype,
						"referenceId": item.reference_id
					};
				});

				modelAttrs.contentReferenceMap = contentReferenceMapAttrs;

				logOutput.info("Content Reference Map created.");
				}

				logOutput.info(`Metabolic built...`)
			} else if (modelType === "kinetic") {
				// TODO: finish Kinetic model
				mModel = await this.dbInstance.KineticModel.create({
					name: model.name,
					ModelVersionId: mModelVersion.id, ...defaultAttrs,
				}, { transaction });

				const unitDefinitions = await this.dbInstance.UnitDefinitions.findAll();
				const mapNameToUnitDefinitionId = unitDefinitions.reduce((map, unitDefinition) => {
					map[unitDefinition.name] = unitDefinition.id;
					return map;
				}, {});

				// ==== Compartment ====
				let modelCompartments = model.compartments.map(compartment => ({
					name: compartment.id,
					KineticModelId: mModel.id, 
					...defaultAttrs
				}));
				logOutput.info(`Creating ${modelCompartments.length} compartments.`);
				modelCompartments = await this.dbInstance.KineticCompartment.bulkCreate(modelCompartments, { transaction, returning: true });
				
				logOutput.info(`Created ${modelCompartments.length} compartments.`);
				const mapIdToCompartment = modelCompartments.reduce((map, compartment) => {map[compartment.name] = compartment; return map;}, {});

				// ==== Species Metabolite ====
				let modelSpecies = model.species.map(species => ({
					name: species.name, 
					species_id: species.id,
					initial_concentration: species.initial_concentration,
					unit_definition_id: mapNameToUnitDefinitionId[species.unit],
					KineticCompartmentId: species.compartment ? mapIdToCompartment[species.compartment].id : null, // if compartment is present get database id or null
					KineticModelId: mModel.id, 
					...defaultAttrs
				}));
				logOutput.info(`Creating ${modelSpecies.length} species.`);
				modelSpecies = await this.dbInstance.KineticSpecies.bulkCreate(modelSpecies, { transaction, returning: true });
				
				logOutput.info(`Created ${modelSpecies.length} species.`);
				const mapIdToSpecies = modelSpecies.reduce((map, species) => {map[species.species_id] = species; return map;}, {});

				// === Global Parameters ===
				// Extract global parameters from the model and save them
				let modelParameters = model.parameters.map(parameter => ({
					name: parameter.name || parameter.id,
					parameter_id: parameter.id,
					value: parameter.value,
					unit_definition_id: parameter.unit ? mapNameToUnitDefinitionId[parameter.unit] : null,
					KineticModelId: mModel.id,
					...defaultAttrs
				}));
				logOutput.info(`Creating ${modelParameters.length} global parameters.`);
				modelParameters = await this.dbInstance.KineticGlobalParams.bulkCreate(modelParameters, { transaction, returning: true });

				logOutput.info(`Created ${modelParameters.length} global parameters.`);
				// const mapIdToParameter = modelParameters.reduce((map, parameter) => { map[parameter.parameter_id] = parameter; return map; }, {});


				// === species content and page references === 
				const pageDefaultAttrs = {
					creationdate: this.dbInstance.Sequelize.fn('NOW'),
					creationuser: user && user.id,
					updatedate: this.dbInstance.Sequelize.fn('NOW'),
					updateuser: user && user.id
				};

				modelAttrs.pageMap = {};
				modelAttrs.sectionMap = {};
				modelAttrs.contentMap = {};
				modelAttrs.contentReferenceMap = {};	
				modelAttrs.referenceMap = {};
		
				logOutput.info("Creating Page Model Map...");

				var pageMap = []; 

				const createPage = (reactionId, geneId, speciesId, metaboliteId, compartmentId) => {
					return {
							reactionId: reactionId,
							geneId: geneId,
							speciesId: speciesId,
							metaboliteId: metaboliteId,
							compartmentId: compartmentId
					};
				};

				modelSpecies.forEach(species => {
					pageMap.push(createPage(null, null,species.id, null, null));
				});
		
					// Uncomment the following lines if you want to create pages for parameters
					/*
					modelParameters.forEach(parameter => {
						pageMap.push(createPage(null, null, null, null, null)); // Adjust as needed
					});
					*/
			
			const mPageModelMap = await this.dbInstance.PageModel.bulkCreate(
					pageMap.map(page => ({
							...page,
							...pageDefaultAttrs,
							ModelVersionId: mModelVersion.id
					})),
					{ transaction }
			);
			
			const pageMapModelAttrs = {};

			mPageModelMap.forEach(item => {
				pageMapModelAttrs[item.id] = {
					"newType": true,
					"reactionId": item.reactionId,
					"geneId": item.geneId,
					"metaboliteId": item.speciesId,
					"compartmentId": item.compartmentId
				};
			});

			modelAttrs.pageMap = pageMapModelAttrs;

			logOutput.info("Page Model Map created.");

			logOutput.info("Creating Section Model Map...");

			var sectionMap = []; 

			const createSection = (pageModelId, title) => {
				return {
						pageModelId: pageModelId,
						title: title,
						type: "Description",
						position: 0
				};
			};
		
			modelSpecies.forEach(species => {
					const pageModelId = mPageModelMap.find(page => page.speciesId == species.id)?.id;
					sectionMap.push(createSection(pageModelId, species.name));
			});
		
		
			
			const mSectionModelMap = await this.dbInstance.SectionModel.bulkCreate(
					sectionMap.map(section => ({
							...section,
							...pageDefaultAttrs
					})),
					{ transaction }
			);
			
			const sectionMapModelAttrs = {};

			mSectionModelMap.forEach(item => {
				sectionMapModelAttrs[item.id] = {
					"position": item.position,
					"pageId": item.pageModelId,
					"type": item.type,
					"title": item.title
				};
			});

			modelAttrs.sectionMap = sectionMapModelAttrs;
			
			logOutput.info("Section Model Map created.");

			logOutput.info("Creating Content Model Map...");
			
			var contentMap = []; 
			let pageModelReferenceMap = []
			var referenceSet = new Set(); 

			// const batch page refs
			const batchReferences = (pageRefsArr, type, typeId, refMap) => {
				const batchedRefs = pageRefsArr.map(id => { 
					referenceSet.add(id)
					if(type = "page"){
						return {
						id,
						pageModelId: typeId,
						...pageDefaultAttrs
						}					
					} else if (type == "content") {
						return {
							id,
							content_id: typeId,
							...pageDefaultAttrs
							}		
					}

				});
				refMap.push(...batchedRefs)
			}
			
			const addContentForNotes = async (entity, entityType, idMap, pageIdKey) => {
				if (entity.notes) {
						const entityPageId = idMap[entity.id]?.id;
						const page = mPageModelMap.find(page => page[pageIdKey] == entityPageId);
						const sectionModelId = page ? mSectionModelMap.find(section => section.pageModelId == page.id)?.id : null;

						if(sectionModelId){
								const notesStr = entity.notes; 
								if(notesStr && notesStr.length > 0 ){
									notesStr.forEach(note => {
										// batch content
										if(note.text){
											contentMap.push({	sectionModelId: sectionModelId,
												text: note.text,
												position: 0,
												flagged: false})										
										}
										// batch content references
										if(note.references && note.references.length > 0){
											note.references.forEach(id => {
												referenceSet.add(id)
											})
										}
										//  batch page references 
										if(note.pageReferences && note.pageReferences.length > 0){
											batchReferences(note.pageReferences, "page", page.id, pageModelReferenceMap)
										}

									})							
								}

							logOutput.info(`Creating ${entityType} Notes...`);				
						}
				}
			};		
		

			for(const species of model["species"]){
				await addContentForNotes(species, 'KineticSpecies', mapIdToSpecies, 'speciesId');
			}

			const mContentModelMap = await this.dbInstance.ContentModel.bulkCreate(
					contentMap.map(content => ({
							...content,
							...pageDefaultAttrs
					})),
					{ transaction }
			);

			const contentModelMapAttrs = {};

			mContentModelMap.forEach(item => {
				contentModelMapAttrs[item.id] = {
					"position": item.position,
					"sectionId": item.sectionModelId,
					"text": item.text,
					"flagged": item.flagged
				};
			});

			modelAttrs.contentMap = contentModelMapAttrs;

			logOutput.info("Content Model Map created.");

			logOutput.info("Creating Reference Map...");

			const addReferences = (entity, references = false) => {
				if (entity.notes) {
					for (const [key, value] of Object.entries(entity.notes)) {
							if (key == 'References') {
								const identifiers = (typeof value === 'string' && value !== "without references") ? value.split(',') : [];
								identifiers.map(n => n && ReferPmidDoi.testValidValue(n)).forEach(identifier => identifier && referenceSet.add(identifier));
							}
					}
				} else if (references && references.length > 0){
					references.forEach(identifier => referenceSet.add(identifier))
				} 
			};

			// check model for model references
			let modelRefs = []
			if(model.modelReferences){
				modelRefs = model.modelReferences.split('references:')[1]?.split(',')	 
				if(modelRefs && modelRefs.length > 0){
					addReferences(model, modelRefs)					
				}
			}

			const referencesValue = [...referenceSet].map(id => `${id}`);
			if (referencesValue.length > 0) {
			const appResponse = await AppService.request.post(`/knowledge/lookupRefs`, {
				refs: referencesValue
			}, {
				headers: {
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(JSON.stringify({ refs: referencesValue }))
				}
			});

			const mReferenceMap = Object.entries(appResponse.data).map(([id, details]) => ({
				id,
				...details
			}));
			
			logOutput.info("Reference Map created.");
			// save model references if they exist
			if(modelRefs && modelRefs.length > 0){
				const modelReferenceMap = []
				modelRefs.map(ref => {
					const identifier = ref.trim()
					const referenceId = mReferenceMap.find(reference => reference.pmid == identifier || reference.doi == identifier)?.id;
					if(referenceId) {
						modelReferenceMap.push({
						reference_id: referenceId,
						model_id: mBaseModel.id,
						position: 0,
						...pageDefaultAttrs
					})
				}
				});

				logOutput.info(`Creating ${modelReferenceMap.length} model references.`)
				
				await this.dbInstance.model_reference.bulkCreate(modelReferenceMap, {transaction, returning: true})

				logOutput.info(`Created ${modelReferenceMap.length} model references.`)							
			}
			

			// save page model references if they exist
			if(pageModelReferenceMap && pageModelReferenceMap.length > 0){
				const updatedPageModelReferencesMap = []

				pageModelReferenceMap.map( ref => {
					const identifier = ref?.id
					const referenceId = mReferenceMap.find(reference => reference.pmid == identifier || reference.doi == identifier)?.id;
					if(referenceId){
						delete ref.id
						updatedPageModelReferencesMap.push({...ref, referenceId })
					}
				})

				logOutput.info(`Creating ${updatedPageModelReferencesMap.length} pageModel references.`)
			
				pageModelReferenceMap = await this.dbInstance.PageModelReference.bulkCreate(updatedPageModelReferencesMap, {transaction, returning: true})
				const pageReferenceMapAttrs = {};

				pageModelReferenceMap.forEach(item => {
					pageReferenceMapAttrs[item.id] = {
						"pageId": item.pageModelId,
						"referenceId": item.referenceId,
						"creationdate": item.creationdate,
					};
				});

				modelAttrs.pageReferenceMap = pageReferenceMapAttrs;
				
				logOutput.info(`Created ${updatedPageModelReferencesMap.length} pageModel references.`)	
			}

			const referenceMapAttrs = {};

			mReferenceMap.forEach(item => {
				referenceMapAttrs[item.id] = {
					"shortCitation": item.shortCitation,
					"creationUser": item.creationUser,
					"text": item.text,
					"creationDate": item.creationDate,
					"updateUser": item.updateUser,
					"updateDate": item.updateDate,
					"pmid": item.pmid,
					"doi": item.doi
				};
			});

			modelAttrs.referenceMap = referenceMapAttrs;

			logOutput.info("Creating Content Reference Map...");

			var maxId = await this.dbInstance.ContentModelReference.max('id');
			const contentReferenceMap = []

			const processNotes = async (entity, idMap, idKey) => {
				if (entity.notes) {
						const pageModelId = idMap[entity.id]?.id;
						const page = mPageModelMap.find(page => page[idKey] == pageModelId);
						const sectionModelId = page ? mSectionModelMap.find(section => section.pageModelId == page.id)?.id : null;

						if (!sectionModelId) {
								return; 
						}

						const notesStr = entity.notes; 

						if(notesStr && notesStr.length > 0){
							notesStr.forEach(note => {
								if(note.text){
									const contentModelId = mContentModelMap.find(c => note.text == c.text )?.id
									if(contentModelId){
										if(note.text && note.references && note.references.length > 0 ) {
											const contentModelId = mContentModelMap.find(c => note.text == c.text )?.id
											const identifiers = note.references
											for(let j = 0; j < identifiers.length; j++) {
												const identifier = identifiers[j]
												const referenceId = mReferenceMap.find(reference => reference.pmid == identifier || reference.doi == identifier)?.id;
												maxId = (maxId || 0) + 1;
												if (contentModelId && referenceId) {
														const content = {
																id: maxId,
																content_id: contentModelId,
																reference_id: referenceId,
																position: 0,
																dataType: null,
																citationType: null,
																...pageDefaultAttrs
														};
				
														contentReferenceMap.push(content);
												}
											}									
										}
									}								
								}

							})
						}
				}
		};		

		// process notes using await to ensure bulkcreate is called after contentReferenceMap is resolved
		const processNotesHelper = async (entityMap, entityIdName, entityArr) => {
			for(let i = 0; i < entityArr.length; i++){
				const entity = entityArr[i]
				await processNotes(entity, entityMap, entityIdName);
			}
		}

		await processNotesHelper(mapIdToSpecies, 'speciesId', model['species']);

		const mContentReferenceMap = await this.dbInstance.ContentModelReference.bulkCreate(contentReferenceMap,{ transaction });

			const contentReferenceMapAttrs = {};

			mContentReferenceMap.forEach(item => {
				contentReferenceMapAttrs[item.id] = {
					"position": item.position,
					"creationDate": item.creationdate,
					"creationUser": item.creationuser,
					"contentId": item.content_id,
					"citationType": item.citationtype,
					"dataType": item.datatype,
					"referenceId": item.reference_id
				};
			});

			modelAttrs.contentReferenceMap = contentReferenceMapAttrs;

			logOutput.info("Content Reference Map created.");
			}
				// TODO: support for annotations

				// ==== Reactions ====
				
				let modelReactions = [];
				const modelKineticLaws = [];

				logOutput.info('Kinetic Creating reactions...');
				
				let kineticLawMissingNotificationCount = 0;
				modelReactions = model.reactions.map(reaction => {
					kineticLawMissingNotificationCount < 1 && reaction.kinetic_law.formula == undefined && ++kineticLawMissingNotificationCount;
					return {
					reaction_id: reaction.id,
					name: reaction.name,
					KineticModelId: mModel.id,
					...defaultAttrs,

					KineticLaw: {
						formula: reaction.kinetic_law.formula,
						KineticLawTypeId: reaction.kinetic_law.type || 1,
						...defaultAttrs,

						KineticLocalParams: reaction.kinetic_law.parameters.map(param => ({
							name: param.id,
							value: param.value,
							unit_definition_id: mapNameToUnitDefinitionId[param.unit], // set unit definition name
							...defaultAttrs
						})),
					}
				}});
				if(kineticLawMissingNotificationCount > 0) {
					notify(`kinetic:laws`, {
						type: "warning",
						message: `Some reactions are missing kinetic laws so the simulation abilities may be impacted.`
					}, { user });				
				}

				
				modelReactions = await this.dbInstance.KineticReaction.bulkCreate(modelReactions, 
					{
						include: [
							{ model: this.dbInstance.KineticLaw , include: [{ model: this.dbInstance.KineticLocalParams }]},
						],
						transaction, 
						returning: true 
					}
				);
				
				for (let i = 0; i < modelReactions.length; i++) {
					await modelReactions[i].addReactants(model.reactions[i].reactants.map(reactant => mapIdToSpecies[reactant.species]), { transaction });
					await modelReactions[i].addProducts(model.reactions[i].products.map(product => mapIdToSpecies[product.species]), { transaction });
					if (!isEmpty(model.reactions[i].modifiers)) {
						await modelReactions[i].addModifiers(model.reactions[i].modifiers.map(modifier => mapIdToSpecies[modifier.species]), { transaction });
					}
				}

				logOutput.info(`Created...`);

				// === Build Model Attributes ===

				// Build species attributes
				logOutput.info(`Building Species...`);

				modelAttrs.species = _objectify(modelSpecies, (species, i) => ({
					[species.id]: {
						name: species.name, species_id: species.species_id,
						initial_concentration: species.initial_concentration,
						compartment: species.KineticCompartmentId,
						unitDefinitionId: species.unit_definition_id,
						// annotations: _fastMap(_fastFilter(mAnnotationsArr, i => i.MetaboliteId == next.id), i => i.id)
					}
				}));

				// Build global parameters attributes
				logOutput.info(`Building Global Parameters...`);
				modelAttrs.parameters = _objectify(modelParameters, (parameter, i) => ({
					[parameter.id]: {
						name: parameter.name,
						parameter_id: parameter.parameter_id,
						value: parameter.value,
						unitDefinitionId: parameter.unit_definition_id,
					}
				}));

				// TODO: build annotations

				logOutput.info(`Building Reactions...`)

				modelAttrs.reactions = _objectify(modelReactions, (reaction, i) => {
					const model_reaction = model.reactions[i];
					return {
						[reaction.id]: {
							// annotations: _fastMap(_fastFilter(mAnnotationsArr, i => i.ReactionId == next.id), i => i.id),
							name: reaction.name,
							reaction_id: reaction.reaction_id,
							kinetic_law: reaction.KineticLaw.id,
							reversible: reaction.reversible,
							reactants: model_reaction.reactants.map(reactant => mapIdToSpecies[reactant.species].id),
							products: model_reaction.products.map(product => mapIdToSpecies[product.species].id),
							modifiers:  model_reaction.modifiers.map(modifier => mapIdToSpecies[modifier.species].id)// model.reaction[i].modifiers ? model.reaction[i].modifiers.map(modifier => mapIdToSpecies[modifier.species].id) : [],
						}
					}
				});

				logOutput.info(`Building Kinetic Laws...`)
				
				modelAttrs.kinetic_laws = _objectify(modelReactions, (reaction, i) => ({
					[reaction.KineticLaw.id]: {
						formula: reaction.KineticLaw.formula,
						type: reaction.KineticLaw.KineticLawTypeId,
						description: reaction.KineticLaw.description,
						reaction: reaction.id,
						parameters: _objectify(reaction.KineticLaw.KineticLocalParams, (param, i) => ({
							[param.id]: {
								name: param.name,
								value: param.value,
								unit: param.unit_definition_id,
							}
						}))
					}
				}));

				modelAttrs.compartments = _objectify(modelCompartments, (compartment, i) => ({
					[compartment.id]: { name: compartment.name }
				}));


			} else if (modelType === "pharmacokinetic") {
				modelAttrs = await savePharmacokineticJSONModel(mModelVersion, model, modelAttrs, defaultAttrs);
				console.log(modelAttrs)
			}

			await transaction.commit();

			if (modelType === 'kinetic'){
				// to avoid exporting the imported model without model references due to cached version missing modelReferenceIds
				const modelKinetic = new ModelKinetic(this.dbInstance);
				const modelIdsArr = await modelKinetic.getModelReferenceMapByKineticModel(mBaseModel.id);
				modelAttrs.modelReferenceIds = modelIdsArr[0]
			}

			if (modelType === 'metabolic') {
				logOutput.info(`Building Conditions...`);
				const mConditionsMap = await this.dbInstance.Condition.findAll({
					where: {
						regulator_id: _fastMap(mRegulatorsArr, i => i.id)
					}
				});
				const mConditonGenes = await this.dbInstance.ConditionSpecies.findAll({
					where: {
						condition_id: _fastMap(mConditionsMap, i => i.id)
					}
				});
				modelAttrs.conditions = _objectify(mConditionsMap, (next, i) => ({
					[next.id]: {
						type: next.type,
						state: next.state,
						regulator: parseInt(next.regulator_id),
						speciesRelation: next.speciesrelation,
						genes: _fastMap(_fastFilter(mConditonGenes, i => i.condition_id == next.id), i => parseInt(i.GeneId))
					}
				}));
				logOutput.info(`Building reactionMetabolites...`);
				modelAttrs.reactionMetabolites = {};
				const mReactions = await mModel.getReactions({
					include: [
						{
							model: this.dbInstance.SubSystem,
						},
					],
					where: { _deleted: { [this.dbInstance.Sequelize.Op.ne]: true } },
				});
				const mReactionIds = mReactions.map(r => r.id);
				const mReactionCoefficients = await this.dbInstance.ReactionCoefficient.findAll({
					where: {
						ReactionId: mReactionIds,
						MetaboliteId: { [this.dbInstance.Sequelize.Op.ne]: null },
					},
					include: [
						{
							model: this.dbInstance.Metabolite,
						},
					],
				});
				for ( let k = 0, b = mReactions.length ; k < b ; ++k ) {
					const mReaction     = mReactions[k];
				const tmReactionCoefficients = mReactionCoefficients.filter(r => r.ReactionId == mReaction.id);

				for (const mReactionCoefficient of tmReactionCoefficients) {
					modelAttrs.reactionMetabolites[_negateId(mReactionCoefficient.id, false)] = {
						reaction: mReactionCoefficient.ReactionId,
						metabolite: mReactionCoefficient.MetaboliteId,
						coefficient: mReactionCoefficient.coefficient,
					};
				}
			}
			}
			if (this.settings.addCache) {
				await cache.call("JSON.SET", `model:${mBaseModel.id}:version:${mModelVersion.id}:slim:true`, ".", JSON.stringify(modelAttrs));
			}			
			return mBaseModel;
		} catch (e) {
			logOutput.info(`Unable to save ${modelType} model: ${e.toString()}`)

			await transaction.rollback();

			throw e;
		}
	}
}