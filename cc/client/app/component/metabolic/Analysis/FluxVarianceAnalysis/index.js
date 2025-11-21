import { Map } from "immutable";
import BaseAnalysis from "../BaseAnalysis";

import cc from "../../../../cc"

export default class FluxVariabilityAnalysis extends BaseAnalysis {
	async run ( ) {
		super.run();

		const { experiment: e } = this;
		const modelJSON = this.getExperimentModelJSON();
		
		const params 	= {
			type: "fva",
			model: modelJSON,
			parameters: {
				optimum: e.fvaOptimum / 100
			}
		};

		const { data } 	= await cc.request.post(`/api/model/analyse`, params);
		const { minimum: minimumFlux, maximum: maximumFlux } = data.data;

		const eData = new Map({
			minimumFlux,
			maximumFlux
		})

		this.setExperimentData(eData);
	}
}