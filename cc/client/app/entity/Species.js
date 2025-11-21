import Entity from "./Entity";

export default class Species extends Entity { }

Entity.init({ Species }, {
	speciesId: null,
	name:      null
});