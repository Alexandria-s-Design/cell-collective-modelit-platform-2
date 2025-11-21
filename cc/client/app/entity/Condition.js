import Utils from "../utils";
import Entity from "./Entity";

export default class Condition extends Entity {
	static comparator(a, b) {
		let an, bn;
		return a.id < 0 || b.id < 0 ? a.id - b.id : ((an = Utils.toLower(a.name)) < (bn = Utils.toLower(b.name)) ? -1 : (an > bn ? 1 : (a.form > b.form ? -1 : (a.form < b.form ? 1 : (a.id - b.id)))));
	}

	get form() {
		return !(this.type ^ this.state);
	}

	get isEmpty() {
		return !this.components && !this.conditions;
	}
}

Entity.init({ Condition }, {
	name: { maxLength: 60 },
	parentId: { ref: "conditions" },
	componentRelation: null,
	state: null,
	subConditionRelation: null,
	type: null
}, {
	genes: false,
	components: false,
	conditions: false
});