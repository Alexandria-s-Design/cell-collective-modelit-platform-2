import { Map } from "immutable";
import BaseAnalysis from "../BaseAnalysis";
import BooleanAnlaysis from "ccbooleananalysis";
import fbaModule  from './fba_vite.js';

export default class FluxBalanceAnalysis extends BaseAnalysis {
	async run () {
		super.run();
		let data = null, eData = new Map({});
		try {
			const FBA = await fbaModule();
			const modelJSON = this.getExperimentModelJSON();
			let fbaJson = this.constraintBasedModelJSONtoFBAJSON(modelJSON);
			let fbaJsonString = JSON.stringify(fbaJson);
			data = FBA.analyze_fba(fbaJsonString);
			data = JSON.parse(data);
		} catch(err) {
			console.error('There seems to be an error while reading the Flux Balance binary file: ', err)
		}

		if (data) {
			const {	objective_value: objectiveValue, fluxes }	= data;
			eData = new Map({ objectiveValue, fluxes });
		}

		this.setExperimentData(eData);
	}

	constraintBasedModelJSONtoFBAJSON = (cbm) => {
		const data = {
			id: `${cbm.id}`,
			name: `${cbm.name}`,
			modelType: `${cbm.modelType}`
		};

		if (cbm.name) {
			data.name	= cbm.name;
		}

		const compartments = {};

		for (const c of cbm.compartments) {
			compartments[`${c.id}`] = c.name;
		};

		const metabolites = [];

		for (const m of cbm.metabolites) {
			const metabolite = {
				id: `${m.id}`,
				name:	m.name,
				formula: m.formula,
				compartment: `${m.compartment}`,
				charge:	m.charge,
				speciesId: `${m.speciesId}`,
			};

			if (m.annotations) {
				metabolite.annotation = {};
				for (const annotation of m.annotations) {
					metabolite.annotation[annotation.source] = annotation.annotations;
				}
			}

			metabolites.push(metabolite);
		}

		data.metabolites = metabolites;

		const reactions	= [];

		for (const r of cbm.reactions) {
			const reaction 	= {
				id:	`${r.id}`,
				reactionId: r.reactionId,
				name:	r.name,
				lower_bound: r.lowerBound !== undefined ? parseFloat(r.lowerBound) : -1000,
				upper_bound: r.upperBound !== undefined ? parseFloat(r.upperBound) : 1000,
				objective_coefficient: r.objectiveCoefficient,
				subsystem: r.subsystem
			};

			reaction.metabolites = {};

			for (const metabolite in r.fbaMetabolites) {
				const stoichiometry = r.fbaMetabolites[metabolite];
				reaction.metabolites[`${metabolite}`] = stoichiometry;
			}

			if (r.annotations) {
				reaction.annotation = {};
				for (const annotation of r.annotations) {
					reaction.annotation[annotation.source] = annotation.annotations;
				}
			}

			const regulators = cbm.regulators.filter(regulator => `${regulator.reaction}` == `${r.id}`);
			const regulatorIds = regulators.map(r => `${r.id}`)
			const conditions = cbm.conditions.filter(condition => regulatorIds.includes(`${condition.regulator}`));
			const geneIds	= regulators.map(regulator => `${regulator.gene}`);
			const genes	= cbm.genes.filter(gene => geneIds.includes(`${gene.id}`));

			const constructs = {
				absentState: false
			};
			constructs.components	= genes.reduce((prev, next) => ({ ...prev, [`${next.id}`]: { name: `${next.id}` }}), { })
			constructs.regulators	= regulators.reduce((prev, next) => {
					const id = `${next.id}`;

					const rConditions	= conditions
						.filter(({ regulator }) => `${regulator}` == `${id}`)
						.map(({ state, type, speciesRelation, genes }) => ({
							state: state == "ON" ? true : false,
							type: type == "IF_WHEN" ? true : false,
							componentRelation: speciesRelation == "AND" ? true : false,
							components: genes.map(g => `${g}`)
						}))

					const regulator	= {
						component: `${next.gene}`,
						type: next.type == "POSITIVE" ? true : false,
						conditionRelation: next.conditionRelation == "AND" ? true : false,
						conditions: rConditions
					}

					return { ...prev, [id]: regulator }
			}, {});

			genes.filter(g => g.knockOut == true).forEach(g => {
				if (g.knockOut == true) {
					reaction.lower_bound = 0;
					reaction.upper_bound = 0;
				}
			});

			let gene_reaction_rule = BooleanAnlaysis.fromBiologicalConstructs(constructs);
			gene_reaction_rule = gene_reaction_rule.replace(/\*/g, " and ")
			gene_reaction_rule = gene_reaction_rule.replace(/\+/g, " or ")
			gene_reaction_rule = gene_reaction_rule.replace(/\~/g, " not ")

			reaction.gene_reaction_rule = gene_reaction_rule;

			reactions.push(reaction);
		}

		data.reactions = reactions;

		const genes	= [];

		for (const g of cbm.genes) {
			const gene = {
				id: `${g.id}`,
				name:	g.name,
				knockOut: g.knockOut || false
			}

			genes.push(gene);
		}

		data.genes = genes;

		data.objective = cbm.objective || [];

		return data;
	}

}
