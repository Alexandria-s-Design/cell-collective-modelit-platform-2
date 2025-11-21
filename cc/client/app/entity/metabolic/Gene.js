import Entity  from "../Entity";
import Species from "../Species";

export default class Gene extends Species { }

Entity.init({ Gene }, {
	name:		   null,
	speciesId:	   null,
	
	annotationIds: null,
	// Indicates if a gene is functional...
	// TODO(metabolic): Functional Genes...
	// functional: { defaultVal: true },

	reactions: null
}, {
	upStreams: false,
	downStreams: false,
	conditions: null,
	subConditions: null,
	pages:			null,
	regulators: null,
	experimentMutations: { nullable: false, ref: "parentId" }
});