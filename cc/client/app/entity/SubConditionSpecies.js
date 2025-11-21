import Entity from "./Entity";
import Interaction from "./interaction";

export default class SubConditionSpecies extends Entity {
	delete(context, entities) {
		super.delete(context, entities);
		Interaction.remove(this, context, entities);
	}
}

Entity.init({SubConditionSpecies}, {
	parentId: { ref: "components" },
	componentId: { ref: "subConditions" }
});