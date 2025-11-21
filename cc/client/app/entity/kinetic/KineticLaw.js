import Entity  from "../Entity";

export default class KineticLaw extends Entity {}

Entity.init({ KineticLaw }, {
	 formula: null,
	 type: null,
	 parameters: null,
	 numSubstrates: null,
	 numProducts: null,
	 description: null,
	 reaction_id: { ref: "reaction", type: "Reaction" }
}, {
	// pages: 					null
});