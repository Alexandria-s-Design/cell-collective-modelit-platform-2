import Entity from "./Entity";
import Citation from "./citation";

export default class PageReference extends Entity {
	delete(context, entities) {
		super.delete(context, entities);
		Citation.remove(this, context, entities);
	}
}

Entity.init({PageReference}, {
	parentId: { ref: "references" },
	referenceId: { ref: "pages" }
});