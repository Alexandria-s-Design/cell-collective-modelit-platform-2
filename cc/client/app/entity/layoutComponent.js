import Entity from "./Entity";

export default class LayoutComponent extends Entity {}

Entity.init({LayoutComponent}, {
	parentId: { ref: "components" },
	componentId: { ref: "layouts" },
	x: null,
	y: null
});