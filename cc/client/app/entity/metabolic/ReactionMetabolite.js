import Entity  from "../Entity";

export default class ReactionMetabolite extends Entity { }

Entity.init({ ReactionMetabolite }, {
	reactionId: { type: "Reaction" },
	metaboliteId: { type: "Metabolite" },
	coefficient: { defaultVal: 0 },
	parentId: { ref: "reactionMetabolites" }
});