import Entity from "./Entity";

export default class OutputRange extends Entity {}

Entity.init({OutputRange}, {
	parentId: { ref: "ranges" },
	from: null,
	to: null
});