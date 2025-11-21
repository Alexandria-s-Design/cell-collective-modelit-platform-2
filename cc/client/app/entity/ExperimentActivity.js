import Entity from "./Entity";

export default class ExperimentActivity extends Entity {}

Entity.init({ ExperimentActivity }, {
	componentId: { ref: "experimentActivities" },
	parentId: { ref : "envExperimentActivities" },
	min: null,
	max: null,
	// Metabolic Extensions
	reactionId: { ref: "experimentActivities" },
	core: null
});