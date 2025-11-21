import { Seq } from "immutable";

import BaseAnalysis from "../../../Analysis/BaseAnalysis";

import { removeReaction } from "../../../Model/ReactionsView";

export default class ContextSpecificAnalysis extends BaseAnalysis {
	mutateModel (params) {
		const { context, props } = this;
		const { model } = props;

		const { removeReactions, removeReactionOrphans } = params;

		const version = context.modelAddVersion(model, model.top);

		if ( removeReactions ) {
			Seq(removeReactions)
				.forEach(e => {
					const bReaction = model.Reaction[e];
					const tReaction = Seq(version.Reaction)
						.find(r => (r.reactionId == bReaction.reactionId) || (r.name == bReaction.name))
						
					// shitty hack to map old ids to new...

					removeReaction(props, tReaction, { confirm: false, model: version, orphans: removeReactionOrphans })
				});
		}

		this.onExperimentSuccess();
	}
}