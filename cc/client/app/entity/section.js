import Entity from "./Entity";

export default class Section extends Entity {
	get isEmpty() {
		return !this.contents;
	}
}

Entity.init({Section}, {
	parentId: { ref: "sections" },
	position: null,
	title: null,
	type: null
}, {
	contents: false
});