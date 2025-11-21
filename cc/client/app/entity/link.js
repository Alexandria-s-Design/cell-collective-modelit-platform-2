import Entity from "./Entity";

export default class Link extends Entity {}

Entity.init({Link}, {
	accessCode: null,
	access: null,
	start: null,
	end: null,
	created: null,
	accessCount: null
});