import Entity from "./Entity";

export default class FlowActivity extends Entity {}

Entity.init({FlowActivity}, {
	parentId: { ref: "activities" },
	componentId: { ref: "flowActivities" },
	reactionId: { ref: "flowActivities" },
	value: null,
	min: null,
	max: null
});