import Entity from "./Entity";

export default class ExperimentMutation extends Entity {}

Entity.init({ ExperimentMutation }, {
	parentId: { ref: "mutations" },
	componentId: { ref: "experimentMutations" },
	// Metabolic Extensions...
	geneId: { ref: "experimentMutations" },
	reactionId: { ref: "experimentMutations" },
	state: null,
	expressionState: null,
	core: null
});