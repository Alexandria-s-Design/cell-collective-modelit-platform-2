import Entity from "../Entity";

export default class KParameter extends Entity { }

Entity.init({ KParameter }, {
	name: null,
	value: null,
	unitDefinitionId: { ref: 'species' },
});