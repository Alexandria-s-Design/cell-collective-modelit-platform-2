import Entity from "./Entity";
import Citation from "./citation";

export default class ContentReference extends Entity {
	delete(context, entities) {
		super.delete(context, entities);
		Citation.remove(this, context, entities);
	}
}

Entity.init({ContentReference}, {
	parentId: { ref: "references" },
	referenceId: { ref: "contents" },
	literatureType: null,
	dataType: null
});