import Entity from "./Entity";

export default class FlowMutation extends Entity {}

Entity.init({ FlowMutation }, {
	parentId: { ref: "mutations" },
	componentId: { ref: "flowMutations" },
	// Metabolic...
	geneId: { ref: "flowMutations" },
	state: null
});