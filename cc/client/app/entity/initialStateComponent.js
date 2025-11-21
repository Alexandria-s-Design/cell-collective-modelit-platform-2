import Entity from "./Entity";

export default class InitialStateComponent extends Entity {}

Entity.init({InitialStateComponent}, {
	parentId: { ref: "components" },
	componentId: { ref: "initialStates" }
});