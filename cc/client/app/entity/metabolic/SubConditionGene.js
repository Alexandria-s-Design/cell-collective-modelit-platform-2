import Entity from "./../Entity";
import Interaction from "./../interaction";

export default class SubConditionGene extends Entity {
	delete(context, entities) {
		super.delete(context, entities);
		Interaction.remove(this, context, entities);
	}
}

Entity.init({SubConditionGene}, {
	parentId: { ref: "genes" },
	geneId: { ref: "subConditions" }
});