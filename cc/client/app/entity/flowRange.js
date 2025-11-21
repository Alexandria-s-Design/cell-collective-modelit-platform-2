import Entity from "./Entity";

export default class FlowRange extends Entity {}

Entity.init({FlowRange}, {
	name: { maxLength: 100 },
	parentId: { ref: "ranges" },
	from: null,
	to: null
}, {
	mutations: false,
	activities: false
});