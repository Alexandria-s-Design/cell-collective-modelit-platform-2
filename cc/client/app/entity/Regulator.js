import Utils from "../utils";
import Entity from "./Entity";
import Interaction from "./interaction";

export default class Regulator extends Entity {
	static comparator(a, b) {
		let an, bn;
		return a.id < 0 || b.id < 0 ? a.id - b.id : ((an = Utils.toLower(a.component && a.component.name || a.reaction && a.reaction.name)) < (bn = Utils.toLower(b.component && b.component.name || b.reaction && b.reaction.name)) ? -1 : (an > bn ? 1 : (a.type > b.type ? -1 : (a.type < b.type ? 1 : (a.id - b.id)))));
	}

	delete(context, entities) {
		super.delete(context, entities);
		(this.root || this.parent) && Interaction.remove(this, context, entities);
	}
}

Entity.init({ Regulator }, {
	// base properties
	type: null,
	conditionRelation: null,
	// property extensions to logical models
	parentId: { ref: "upStreams" },
	componentId: { ref: "downStreams" },
	// property extensions to metabolic models
	reactionId: { ref: "regulators" },
	geneId: { ref: "gene" }
}, {
	conditions: false,
	dominants: false,
	recessives: false
});