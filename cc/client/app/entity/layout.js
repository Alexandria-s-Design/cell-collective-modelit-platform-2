import Entity from "./Entity";

export default class Layout extends Entity {}

Entity.init({ Layout }, {
	name: { maxLength: 80 },
	minX: null,
	maxX: null,
	minY: null,
	maxY: null
}, {
	components: { nullable: false, key: "componentId" },
	layoutParents: true
});