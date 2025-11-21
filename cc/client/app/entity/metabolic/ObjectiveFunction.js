import { Seq } from "immutable";

import Entity  from "../Entity";

export default class ObjectiveFunction extends Entity {
	get json ( ) {
		const objective 		= { };

		objective.name			= this.name;

		objective.reactions	= this.reactions ? 
			Seq(this.reactions)
				.map(({ reaction, coefficient }) => ({ reaction: reaction.id, coefficient }))
				.toArray()
			:
			[ ]
		
		return objective;
	}
}

Entity.init({ ObjectiveFunction }, {
	name: null,
	reactions: { defaultVal: { } },
	default: false
});