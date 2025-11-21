import { Seq } from "immutable";
import isEmpty from "lodash.isempty";

import Entity from "../Entity";

import { getCompartment } from "./Metabolite";
import ReactionMetabolite from "./ReactionMetabolite";

export const getCompartments = (props, e) => {
	const { model, selected: { Reaction: r } } = props;
	e = e ? e : r;
	return Seq(e && e.metabolites)
		.map((v, metaboliteId) => getCompartment(props, model.Metabolite[metaboliteId]))
		.toSetSeq()
		.toArray();
}

export const getSubSystem = ({ model, selected: { Reaction: r } }, e) => {
	e = e ? e : r;
	return r && r.subsystem ? model.SubSystem[r.subsystem] : null;
}

export default class Reaction extends Entity {
	static checkMassBalance ({ model, selected: { Reaction: e } }, r) {
		e = e ? e : r;

		const results	= { };
		let hasElements = true;

		if ( e ) {
			const metabolites = Seq(model.ReactionMetabolite)
				.filter(r => `${r.reactionId}` == `${e.id}`)
				.toArray()
		
			for ( const rm of metabolites ) {
				const { metaboliteId, coefficient } = rm;
				const metabolite	= model.Metabolite[metaboliteId];
		
				if ( metabolite.charge !== null ) {
					if ( !results.charge ) {
						results.charge = 0;
					}

					results.charge += metabolite.charge * coefficient;
				}
		
				if ( !isEmpty(metabolite.elements) ) {
					for ( const element in metabolite.elements ) {
						const ratio = metabolite.elements[element];

						if ( !results[element] ) {
							results[element] = 0
						}

						results[element] += coefficient * ratio
					}
				} else {
					console.warn(`No elements found in metabolite: ${metabolite.elements}`);
					hasElements = false;
					
					break;
				}
			}
		}
		
		return !hasElements ? { } : Seq(results)
			.filter(x => x !== 0)
			.toObject();
	}

	get knockedOut ( ) {
		return this.lowerBound == 0 && this.upperBound == 0;
	}

	get reversible ( ) {
		return this.lowerBound < 0 && this.upperBound > 0;
	}

	/**
	 * Return a list of reactants for this reaction.
	 */
	get reactants ( ) {
		return Seq(this.metabolites)
			.filter(v => v < 0)
			// .map((v, k) => this.Metabolite[k]);
	}

	/**
	 * Return a list of products for this reaction.
	 */
	get products ( ) {
		return Seq(this.metabolites)
			.filter(v => v > 0)
			// .map((v, k) => this.Metabolite[k]);
	}

	/**
	 * Check if this reaction is a boundary reaction.
	 */
	get boundary ( ) {
		return Seq(this.metabolites).count() == 1 
		// && (
		// 	Seq(this.reactants).count() && Seq(this.products).count()
		// )
	}
}

Reaction.DEFAULT_LOWER_BOUND = -1000;
Reaction.DEFAULT_UPPER_BOUND =  1000;

Entity.init({ Reaction }, {
	name:       	null,
	reactionId:		null,
	subsystem:  	null,
	lowerBound: 	null,
	upperBound: 	null,
	metabolites: 	null,
	annotations: 	null,
	objectiveCoefficient: { defaultVal: 0 },
	annotationIds: null,
	boundary: null,
}, {
	pages: 				null,
	regulators: 	null,
	experimentActivities: { nullable: false, ref: "parentId" },
	fluxActivities: { nullable: false, ref: "parentId" },
	experimentMutations: { nullable: false, ref: "parentId" },
	reactionMetabolites: { nullable: false, defaultVal: { }, ref: "parentId" }
});