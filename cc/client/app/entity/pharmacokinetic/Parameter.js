import Entity from "../Entity";

export default class Parameter extends Entity { }

Entity.init({ Parameter }, {
	name: null,
	type: null,
	value: null,
	value_type: null,
	rateId: { ref: "rates" },
	compartmentId: { ref: "compartments" },
}, {});