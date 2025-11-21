import Entity from "./Entity";

export default class LearningActivity extends Entity {}

Entity.init({LearningActivity}, {
	name: null,
	groupId: { ref: "activities" },
	position: null,
	workspaceLayout: null,
	views: null,
	version: null//VERSION NUMBER of associated one (INTEGER)
});
