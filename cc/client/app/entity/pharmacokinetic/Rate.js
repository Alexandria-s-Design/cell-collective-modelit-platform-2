import Entity from "../Entity";

export default class Rate extends Entity { }

Entity.init({ Rate }, {
	name: null,
	fromCompartmentId: { ref: 'upStreams' },
	toCompartmentId: { ref: 'downStreams' },
}, {
});
