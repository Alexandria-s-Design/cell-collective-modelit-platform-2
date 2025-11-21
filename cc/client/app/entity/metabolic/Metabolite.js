import Entity  from "../Entity";
//import Species from "../Species";
import { TMetaboliteAttrs } from "../types/TMetabolite";

const REGEX_FORMULA = new RegExp("([A-Z][a-z]?)([0-9.]+[0-9.]?|(?=[A-Z])?)", "g")

export const getCompartment = ({ model, selected: { Metabolite: m } }, e) => {
	e = e ? e : m;
	return  m && m.compartmentId ? model.Compartment[m.compartmentId] : null;
}
export default class Metabolite extends Entity {
	/**
	 * Get a list of elements for this metabolite.
	 */
	get elements ( ) {
		const formula = this.formula;
		const composition = { }

		if ( formula ) {
			const parsed = formula.match(REGEX_FORMULA);
			
			for ( const m of parsed ) {
				const index = m.search(/\d/);

				let element = m;
				let ratio   = 1

				if ( index > 0 ) {
					element = m.slice(0, index);
					ratio		= parseInt(m.slice(index));
				}

				if ( element in composition ) {
					composition[element] += ratio;
				} else {
					composition[element]  = ratio;
				}
			}
		}

		return composition;
	}
}

Entity.init({ Metabolite }, {
	...TMetaboliteAttrs(),
}, {
	pages: 					null
});