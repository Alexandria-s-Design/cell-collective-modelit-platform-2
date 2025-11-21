import Entity from "../Entity";

export default class ParameterValue extends Entity { }

Entity.init({ ParameterValue }, {
	value: null,
	type: null,
	parameterId: null,
}, {});