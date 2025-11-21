import Entity  from "../Entity";
import { TMetaboliteAttrs } from "../types/TMetabolite";

const REGEX_FORMULA = new RegExp("([A-Z][a-z]?)([0-9.]+[0-9.]?|(?=[A-Z])?)", "g")

export const getCompartment = ({ model, selected: { Metabolite: m } }, e) => {
	e = e ? e : m;
	return  m && m.compartmentId ? model.Compartment[m.compartmentId] : null;
}
export default class Metabolite extends Entity {
}

Entity.init({ Metabolite }, {
	...TMetaboliteAttrs(),
	name: null,
	species_id: null,
	initial_concentration: { defaultVal: 1 },
	compartmentId: null,
}, {
	pages: 					null
});