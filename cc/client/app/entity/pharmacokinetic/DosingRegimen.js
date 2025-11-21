import Entity from "../Entity";

export default class DosingRegimen extends Entity { }

Entity.init({ DosingRegimen }, {
	type: null,
	route: null,
	amount: null,
	duration: null,
	interval: null,
	parameterId: { ref: "parameters" },
}, {});