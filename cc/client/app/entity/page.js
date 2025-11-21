import Entity from "./Entity";

export default class Page extends Entity {
	get isEmpty() {
		return !this.sections && !this.references;
	}
}

Entity.init({ Page }, {
	parentId: { ref: "pages" }
}, {
	sections: false,
	references: false
});