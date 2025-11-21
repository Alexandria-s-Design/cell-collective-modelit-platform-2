import Utils from "../utils";
import Entity from "./Entity";
import Interaction from "./interaction";

export default class ConditionSpecies extends Entity {
	static comparator(a, b) {
		let an, bn;
		return a.id < 0 || b.id < 0 ? a.id - b.id : ((an = Utils.toLower((a.species || a.component).name)) < (bn = Utils.toLower((b.species || b.component).name)) ? -1 : (an > bn ? 1 : a.id - b.id));
	}

	delete(context, entities) {
		super.delete(context, entities);
		Interaction.remove(this, context, entities);
	}
}

Entity.init({ ConditionSpecies }, {
	parentId: { ref: "components" },
	componentId: { ref: "conditions" },
	// Metabolic Extensions...
	geneId: { ref: "conditions" }
});