import Entity from "./Entity";

export default class Sharing extends Entity {}

Entity.init({Sharing}, {
	email: { maxLength: 255 },
	userId: null,
	access: null
});