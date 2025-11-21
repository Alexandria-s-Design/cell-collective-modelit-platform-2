import Entity from "../Entity";

export default class Compartment extends Entity { }

Entity.init({ Compartment }, {
	name:           null,
	volume: { defaultVal: 1 },
	volumeUnitId: { defaultVal: 1 },
}, {
	metabolites: true
});