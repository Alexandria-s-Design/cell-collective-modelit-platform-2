import Entity  from "../Entity";

export default class ObjectiveReaction extends Entity { }

Entity.init({ ObjectiveReaction }, {
	reactionId: {ref: "reactions"},
	objectiveFunctionId: {ref: "objectiveFunctions"},
	coefficient: { defaultVal: 1 }
});