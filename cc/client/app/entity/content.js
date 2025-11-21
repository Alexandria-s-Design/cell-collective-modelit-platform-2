import Entity from "./Entity";

export default class Content extends Entity {}

Entity.init({Content}, {
	parentId: { ref: "contents" },
	position: null,
	flagged: null,
	text: null
}, {
	references: false
});