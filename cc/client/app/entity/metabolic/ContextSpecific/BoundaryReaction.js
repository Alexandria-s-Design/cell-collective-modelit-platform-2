import Entity  from "../../Entity";

export const ContextType = { iMAT: 'iMAT', FastCore: 'FASTCORE', GIMME: 'GIMME'}

export default class BoundaryReaction extends Entity { }

Entity.init({ BoundaryReaction }, {
	boundary: null,
	reactionId: null,
	lowerBound: null,
	contextType: null,
	upperBound: null,
	compartmentId: null
});