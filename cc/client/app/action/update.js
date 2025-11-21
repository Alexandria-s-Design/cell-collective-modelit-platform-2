import Action from "./action";
import Application from "../application";
import Immutable from "immutable";

export const _DRAFTKEY = '_DRAFT';
export default class Update extends Action {
	constructor(entity, property, value) {
		super(entity);
		this.property = property;
		this.value = value;
	}

	apply(state, model) {
		const e = this.entity;
		if( (Application.entities[e.className] || {}).global ) model = model.top;
		const path = model.path.slice(1).concat([e.className, e.id]);
		if(e.className === "Model"){
			return state.entities = state.entities.set(this.property, this.value);
		}if(["BooleanModel", "ConstraintBasedModel", "KineticModel", "PharmacokineticModel"].includes(e.className)){
			return state.entities = state.entities.mergeIn([path[0]], {[this.property]: this.value});
		}else{
			if (!state[this.key]) {
				return Immutable.Map();
			}
			return state[this.key].getIn(path) && (state[this.key] = state[this.key].setIn(path, e.update(this.property, this.value).self));
		}
	}

	/**
	 * USAGE:
	 * state[this.key] = state[this.key].setIn(path, e.update(this.property, this.value).self)
	 * return this.addDraftValue(state, e, path);
	 */
	addDraftValue(state, e, path) {		
		let _draft;
		if (state[this.key].getIn(path).has(_DRAFTKEY)) {
			let prev = state[this.key].getIn(path).get(_DRAFTKEY);
			prev[this.property] = this.value;
			_draft = state[this.key].setIn(path, e.update(_DRAFTKEY, prev).self)
		} else {
			_draft = state[this.key].setIn(path, e.update(_DRAFTKEY, {[this.property]: this.value}).self)
		}
		state[this.key] = _draft;
		return state[this.key];
	}
}
