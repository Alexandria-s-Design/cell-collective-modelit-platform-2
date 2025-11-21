import Entity from "../Entity";

export default class ParameterVariability extends Entity { }

Entity.init({ ParameterVariability }, {
	type: null,
	distributionId: { ref: "distributions" }, 
	parameterId: { ref: "parameters" },
}, {});