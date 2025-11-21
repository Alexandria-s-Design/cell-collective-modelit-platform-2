export default class UpdateProperty {
	constructor(property, value) {
		this.property = property;
		this.value = value;
	}

	apply(state, model) {
		const path = model.path.slice(1);
		model.set(state.entities.getIn(path));
		return state.entities = state.entities.setIn(path, model.update(this.property, this.value).self);
	}
}
