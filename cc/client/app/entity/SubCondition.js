import Entity from "./Entity";

export default class SubCondition extends Entity {
	get isEmpty() {
		return !this.components;
	}

	get form() {
		return !(this.type ^ this.state);
	}
}

Entity.init({SubCondition}, {
	name: { maxLength: 60 },
	parentId: { ref: "conditions" },
	componentRelation: null,
	state: null,
	type: null
}, {
	genes: false,
	components: false
});