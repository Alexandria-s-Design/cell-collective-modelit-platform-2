import Entity from "./Entity";
import Citation from "./citation";

export default class ModelReference extends Entity {
	delete(context, entities) {
		super.delete(context, entities);
		Citation.remove(this, context, entities);
	}
}

Entity.init({ModelReference}, {
	referenceId: { ref: "models" }
});