import { Seq } from "immutable";
import Entity from "./Entity";

export default class Citation extends Entity {
	static remove({ reference: e }, context, entities) {
		e.citations && !e.models && !e.pages && !e.contents && Seq(e.citations).first().delete(context, entities);
	}
}

Entity.init({Citation}, {
	parentId: { ref: "citations" },
	literatureType: null,
	dataType: null
});