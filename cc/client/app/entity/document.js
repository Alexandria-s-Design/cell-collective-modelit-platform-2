import Entity from "./Entity";

export default class Document extends Entity {}

Entity.init({Document}, {
	name: null,
	type: null,
	description: null,
	token: null,
	uploaded: null
}, {
	bindings: false
});