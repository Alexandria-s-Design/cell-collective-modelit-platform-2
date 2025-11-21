import { Seq } from "immutable";
import Action from "./action";
import Application from "../application";

export default class Remove extends Action {
	constructor(entity, selected) {
		super(entity);
		this.selected = selected;
	}

	apply(state, model, entities) {
		const e = this.entity;
		if( (Application.entities[e.className] || {}).global ) model = model.top;
		const path = model.path.slice(1);
		const ent = Seq(entities).filter((_,k) => model[k] !== undefined);
		state.entities = state.entities.setIn(path, state.entities.getIn(path).withMutations(c => {
			ent.forEach((_, k) => c.has(k) && !c.get(k).isEmpty() && c.set(k, c.get(k).asMutable()));
			this.entity.delete(model, c);
			ent.forEach((_, k) => c.has(k) && !c.get(k).isEmpty() && c.get(k).asImmutable());
		}));
		return state.selected = state.selected.set(this.entity.className, this.selected && this.selected.id);
	}
}
