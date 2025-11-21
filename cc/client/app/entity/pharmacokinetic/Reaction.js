import { Seq } from "immutable";

import Entity from "../Entity";

import { getCompartment } from "./Metabolite";

export const getCompartments = (props, e) => {
	const { model, selected: { Reaction: r } } = props;
	e = e ? e : r;
	return Seq(e && e.metabolites)
		.map((v, metaboliteId) => getCompartment(props, model.Metabolite[metaboliteId]))
		.toSetSeq()
		.toArray();
}

export default class Reaction extends Entity {
	// TODO: add getters for reactants, products and modifiers
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
}

Entity.init({ Reaction }, {
	name:       	null,
	reaction_id:	null,
	kinetic_law:	null,
	reactants: 	{ defaultVal: [] },
	products: 	{ defaultVal: [] },
	modifiers: { defaultVal: [] },
	annotations: 	null,
}, {
	pages: 				null,
	regulators: 	null,
	experimentActivities: { nullable: false, ref: "parentId" },
	fluxActivities: { nullable: false, ref: "parentId" },
	experimentMutations: { nullable: false, ref: "parentId" },
	reactionMetabolites: { nullable: false, defaultVal: { }, ref: "parentId" }
});