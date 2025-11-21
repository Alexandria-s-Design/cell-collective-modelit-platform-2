import Utils from "../utils";
import Entity from "./Entity";

export default class Reference extends Entity {
	static comparator(a, b) {
		return a.id < 0 || b.id < 0 ? a.id - b.id : (Utils.toLower(a.shortCitation) < Utils.toLower(b.shortCitation) ? -1 : 1);
	}

	get isAttached() {
		return this.models || this.pages || this.contents;
	}
}

Entity.init({Reference}, {
	pmid: null,
	doi: null,
	text: null,
	shortCitation: null
}, {
	models: false,
	pages: false,
	contents: false,
	citations: false
});