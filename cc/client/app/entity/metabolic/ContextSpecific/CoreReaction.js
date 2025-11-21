import Entity  from "../../Entity";

export const ContextType = { iMAT: 'iMAT', FastCore: 'FASTCORE'}

export default class CoreReaction extends Entity { }

Entity.init({ CoreReaction }, {
	reactionId: null,
	contextType: null
});