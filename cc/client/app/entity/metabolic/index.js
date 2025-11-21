import { Seq } from "immutable";

import Entity from "../Entity";
import ModelVersion, {
	references
} from "../ModelVersion";

import { _objectify } from "../../fluxviz";

import Annotation from "./Annotation";

export default class ConstraintBasedModel extends ModelVersion {

	constructor(...args) {
		super(...args);
		if (this.SubSystem === undefined) { this.SubSystem = {}	}
		if (this.Compartment === undefined) { this.Compartment = {}	}
		if (this.ReactionMetabolite === undefined) { this.ReactionMetabolite = {} }
	}

	get cobra ( ) {
		return this.getCobraPyModel();
	}
	
	getCobraPyModel ({ compartments = true, subsystems = true } = { }) {
		const model = { modelType: 'metabolic' };

		if ( compartments ) {
			model.compartments 	= this.Compartment ?
				_objectify(
					Seq(this.Compartment)
						.valueSeq()
						.toArray(),
					next => ({ [`${next.id}`]: next.name })
				)
				:
				{ }
		}
		
		model.metabolites		= this.Metabolite ?
			Seq(this.Metabolite)
				.valueSeq()
				.map(m => ({
					id: m.id,
					name: m.name,
					...( compartments ? { compartment: `${m.compartmentId}` } : { } )
				}))
				.toArray()
			:
			[ ]

		let rctMetabolite = Seq();
		if (this.ReactionMetabolite) {
			rctMetabolite = [];
			Seq(this.ReactionMetabolite).forEach(eRM => {
				rctMetabolite.push({
					reactionId: eRM.reactionId,
					coefficient: eRM.coefficient,
					metaboliteId: eRM.metaboliteId,
				})
			});
			rctMetabolite = Seq(rctMetabolite);
		}

		model.reactions			= this.Reaction ?
			Seq(this.Reaction)
				.valueSeq()
				.map(r => {
					const metabolites		= { }

					if (!rctMetabolite.isEmpty()) {
						rctMetabolite.filter(eRM => eRM.reactionId == r.id).forEach(eRM => {
							metabolites[eRM.metaboliteId] = eRM.coefficient;
						});
					}

					return {
						id: r.id,
						name: r.name,
						...( subsystems ?
							{ subsystem: this.SubSystem[r.subsystem] && this.SubSystem[r.subsystem].name }
							:
							{ }
						),
						metabolites: metabolites,
						boundary: r.boundary
					}
				})
				.toArray()
			:
			[ ]

		return model;
	}

	get json ( ) {
		const model 				= super.json;

		model.compartments 	= this.Compartment ?
			Seq(this.Compartment)
				.map(({ id, compartmentId, name }) => ({ id, compartmentId: compartmentId || name, name }))
				.toArray()
			:
			[ ];

		model.metabolites		= this.Metabolite ?
			Seq(this.Metabolite)
				.map(({ id, speciesId, name, compartmentId, charge }) => ({
					id, speciesId, name, compartment: compartmentId, charge }))
				.toArray()
			:
			[ ];

		model.reactions			= this.Reaction ?
			Seq(this.Reaction)
				.map(({ id, reactionId, name, lowerBound, upperBound, metabolites, subsystem,
					objectiveCoefficient, reactionMetaboites }) => ({
					id, reactionId, name, lowerBound, upperBound, subsystem,
					objectiveCoefficient,
					metabolites: reactionMetaboites && Seq(reactionMetaboites)
						.toArray()
						.reduce((prev, e) => ({ ...prev, [e.metaboliteId]: e.coefficient } ), { }),
					fbaMetabolites: metabolites
				}))
				.toArray()
			:
			[ ];

		model.genes					= this.Gene ?
			Seq(this.Gene)
				.map(({ id, geneId, name }) => ({ id, geneId, name }))
				.toArray()
			:
			[ ];

		model.regulators    = this.Regulator ?
			Seq(this.Regulator)
				.map(({ id, type, reactionId, geneId, conditionRelation }) => ({
					id, 
					type: type ? "POSITIVE" : "NEGATIVE",
					reaction: reactionId,
					gene: geneId,
					conditionRelation: conditionRelation ? "AND" : "OR"
				}))
				.toArray()
			:
			[ ];

		model.conditions		= this.Condition ?
			Seq(this.Condition)
				.map(({ id, type, state, parentId, speciesRelation, genes }) => ({
					id,
					type: type ? "IF_WHEN" : "UNLESS",
					state: state ? "ON" : "OFF",
					regulator: parentId,
					speciesRelation: speciesRelation ? "AND" : "OR",
					genes: Seq(genes).map(c => c.geneId).toArray() }))
				.toArray()
			:
			[ ];

		return model;
	}

	get nodes ( ) {
		return Seq();
	}

	get edges ( ) {
		return Seq();
	}

	get modelType ( ) {
		return "metabolic";
	}

	get compartments ( ) {
		return Seq(this.Compartment);
	}

	get subsystems ( ) {
		return Seq(this.SubSystem);
	}

	get metabolites ( ) {
		return Seq(this.Metabolite);
	}

	get reactions ( ) {
		return Seq(this.Reaction);
	}

	/**
	 * Get the list of boundary reactions
	 */
	get boundary ( ) {
		return Seq(this.Reaction)
			.filter(r => r.boundary);
	}

	/**
	 * Get the list of exchange reactions
	 */
	get exchange ( ) {
		// TODO(metabolic): Fetch Exchange Reactions

		if ( ! Seq(this.boundary).count() ) {
			// Warning: No boundary reactions.
			return Seq();
		}

		throw new Error("UNREACHABLE ( lint error )");

		// find external compartment
	}

	get genes ( ) {
		return Seq(this.Gene);
	}

	build (g) {
		super.build(g);

		Seq(this.Metabolite).forEach(e => 
			(e.compartment = this.Compartment[e.compartmentId])
		);
		Seq(this.ReactionMetabolite).forEach(e => 
			(e.metabolite = this.Metabolite[e.metaboliteId])
			&& (e.reaction = this.Reaction[e.reactionId])
			&& (this.Reaction[e.reactionId].reactionMetabolites = e)
		);

		Seq(this.ObjectiveReaction).forEach(e => 
			(e.objectiveFunction = this.ObjectiveFunction[e.objectiveFunctionId])
			&& (e.reaction = this.Reaction[e.reactionId])
		);

		Seq(this.Regulator).forEach(e => (e.species = e.target = e.gene = this.Gene[e.geneId]).regulators = (e.source = e.reaction = this.Reaction[e.reactionId]).regulators = e);
		this.buildRegulatorReferences();
		Seq(this.Page).forEach(e => {
				if ([undefined, null].includes(e.parentId)) {
					if (e.self.get('reactionId')){
						this.Reaction[e.self.get('reactionId')].pages = e;
					} else if (e.self.get('metaboliteId')) {
						this.Metabolite[e.self.get('metaboliteId')].pages = e;
					} else if (e.self.get('geneId')) {
						this.Gene[e.self.get('geneId')].pages = e;
					}
				} else if (this.Reaction[e.parentId]) {
					e.parent = this.Reaction[e.parentId].pages = e;
				}
		})
		this.buildPageReferences();
	}
}

Entity.init({ ConstraintBasedModel }, {
	objective: null,
	...references
});
