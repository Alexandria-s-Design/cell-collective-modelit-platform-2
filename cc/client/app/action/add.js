import Action from "./action";
import Application from "../application";

export default class Add extends Action {
	constructor(entity, select) {
		super(entity);
		this.select = select;
	}

	apply(state, model) {
		const e = this.entity;
		const type = e.className;
		const id = e.id;
		if((Application.entities[e.className] || {}).global) model = model.top;
		const path = model.path.slice(1).concat([type, id]);
		state.entities = state.entities.setIn(path, e.self);
		this.select && (state.selected = state.selected.set(type, id));
		if (!model[type]) {
			model[type] = model['_' + type] = {};
		} else if (!model['_' + type]) {
			model['_' + type] = model[type];
		}
		return model["_" + type][id] = model[type][id] = e;
	}
}
