import React from "react";
import { Seq, Map } from "immutable";

import SliderInput from "../../base/sliderInput";
import { ExperimentSettingsViewBuilder } from "../../analysis/experimentView";
import { ExperimentDrugSettingsViewBuilder } from "./DrugIdentification/experimentDrugSettingsView";
import {
	getCompartments,
	getSubSystem
} from "../../../entity/metabolic/Reaction"

const downloadCSV 	= (data) => {
	const csvContent 	= `data:text/csv;charset=utf-8,${data.map(e => e.map(e => `"${e}"`).join(",")).join("\n")}`;
	const encodedUri 	= encodeURI(csvContent);
	window.open(encodedUri);
}

const downloadExperimentResults = (props, experimentType) => {
	const { model, modelState, selected: { Experiment: e } } = props;

	const experimentState = e && modelState.getIn(["Experiment", experimentType, e.id]);
	if ( experimentState && experimentState.get("state") == "COMPLETED" ) {
		const data 			= [ ];
		const eColumns 	= {
			"fba": ["Flux Value"],
			"fba-dge": ["Flux Value"],
			"fva": ["Minimum Flux Value", "Maximum Flux Value"]
		}
		const columns 	= ["Reaction", "Compartment", "Sub System", "Objective Coefficient",
			...eColumns[experimentType]];
		data.push(columns);

		Seq(model.Reaction)
			.forEach(r => {
				const row = [ ];
				const compartments 	= Seq(getCompartments(props, r)).map(c => c.name).join(",");
				let subsystem 		= getSubSystem(props, r);
				subsystem	= (subsystem && subsystem.name) || "";

				row.push(r.name || r.reactionId || r.id);
				row.push(compartments);
				row.push(subsystem);
				row.push(r.objectiveCoefficient);
				
				const experimentData = experimentState.get("data");

				if ( experimentType == "fba" ) {
					const fluxValue = Map(experimentData.get("fluxes"));
					row.push(fluxValue.get(r.id));
				} else
				if ( experimentType == "fva" ) {
					const minimumFlux = Map(experimentData.get("minimumFlux"))
					const maximumFlux = Map(experimentData.get("maximumFlux"));

					row.push(minimumFlux.get(r.id));
					row.push(maximumFlux.get(r.id));
				}
				
				data.push(row);
			});

		downloadCSV(data);
	}
}

export default {
	"fba": ExperimentSettingsViewBuilder({
		modelType: "metabolic",
		experimentType: "fba",
		onDownload: props => downloadExperimentResults(props, "fba")
	}),
	//differential gene expression
	"fba-dge": ExperimentDrugSettingsViewBuilder({
		modelType: "metabolic",
		experimentType: "fba-dge",
		onDownload: props => downloadExperimentResults(props, "fba-dge")
	}),
	"fva": ExperimentSettingsViewBuilder({
		modelType: "metabolic",
		experimentType: "fva",
		onDownload: props => downloadExperimentResults(props, "fva"),
		experimentSettings: ({ selected: { Experiment: e }, actions }) => (
			<span>
				<dl>
					<dt>
						Optimum
					</dt>
					<SliderInput
						min={1}
						max={100}
						value={e.fvaOptimum}
						onEdit={actions.onEdit.bind(null, e, "fvaOptimum")}/>
				</dl>
			</span>
		)
	})
};