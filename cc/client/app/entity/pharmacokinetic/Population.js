import Entity from "../Entity";

export default class Population extends Entity { }

Entity.init({ Population }, {
	name: null,
	type: null,
	distributionId: { ref: "distributions" },
}, {});