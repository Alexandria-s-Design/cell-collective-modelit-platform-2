import { Map } from "immutable";
import BaseAnalysis from "../../../Analysis/BaseAnalysis";

import cc from "../../../../../cc"

export default class FastCoreAnalysis extends BaseAnalysis {
	async run ( ) {
        super.run();
        
		const modelJSON = this.getExperimentModelJSON();
		
		const params 	= {
			type: "fcore",
			model: modelJSON
		};

		const { data } 	= await cc.request.post(`/api/model/analyse`, params);

        const eData = new Map();

		this.setExperimentData(eData);
	}
}