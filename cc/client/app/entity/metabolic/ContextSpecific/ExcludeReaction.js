import Entity  from "../../Entity";

export const ContextType = { iMAT: 'iMAT', FastCore: 'FASTCORE', GIMME: 'GIMME'}

export default class ExcludeReaction extends Entity { }

Entity.init({ ExcludeReaction }, {
	reactionId: null,
	contextType: null
});