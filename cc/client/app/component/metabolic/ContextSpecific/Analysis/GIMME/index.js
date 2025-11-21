import { Map } from "immutable";
import ContextSpecificAnalysis from "./ContextSpecificAnalysis";

import cc from "../../../../../cc"

export default class GIMMEAnalysis extends ContextSpecificAnalysis {
	async run ( ) {
    super.run();
        
		const modelJSON = this.getExperimentModelJSON();

		const params 	= {
			type: "gimme",
			model: modelJSON
		};

		const { data } 	= await cc.request.post(`/api/model/analyse`, params);
    const eData = {
			removeReactions: data.data,
			removeReactionOrphans: true
		}

		this.mutateModel(eData);
	}
}