import Entity from "./Entity";

export default class Dominance extends Entity {}

Entity.init({Dominance}, {
	positiveId: { ref: "dominants" },
	negativeId: { ref: "recessives" }
});