import React from "react";

import Editable from "../../base/editable";
import { ExperimentSettingsViewBuilder } from "../../analysis/experimentView";

const downloadCSV = (data) => {
	const csvContent = `data:text/csv;charset=utf-8,${data.map(e => e.map(e => `"${e}"`).join(",")).join("\n")}`;
	const encodedUri = encodeURI(csvContent);
	window.open(encodedUri);
}

const downloadExperimentResults = (props) => {
	const {selected: { Experiment: e } } = props;
	const experimentState = e; 
	const data = [];

	if (experimentState ) {
		const row = [];
		const columns = [];

		columns.push("Experiment Name/Id")
		row.push(experimentState.name || experimentState.id)
		columns.push("Bits")
		row.push(experimentState.bits || false)
		columns.push("No. of Simulations")
		row.push(experimentState.numSimulations)
		const keys = Object.keys(experimentState.parameters)
		keys.forEach(key => {
		columns.push("parameter")
		row.push(experimentState.parameters[key].formula)
		})
		columns.push("Initial State")
		row.push(experimentState.initialState)
		columns.push("Experiment Type")
		row.push(experimentState.experimentType)
		experimentState.x && [...experimentState.x.values()].forEach(xMet => {
		columns.push("x-Axis Species")
		row.push(xMet.species_id)
		})
		experimentState.y && [...experimentState.y.values()].forEach(yMet => {
			columns.push("y-Axis Species")
			row.push(yMet.species_id)
		})
		data.push(columns);
		data.push(row);	
	}
	downloadCSV(data);
}

export default ExperimentSettingsViewBuilder({
	modelType: "kinetic",
	onDownload: props => downloadExperimentResults(props),
	experimentSettings: ({ selected: { Experiment: e }, actions }) => (
		<span>
			<dl>
				<dt>
					Time [s]:
				</dt>
				<Editable
					min={1}
					max={1000}
					value={e.numTimesteps}
					onEdit={actions.onEdit.bind(null, e, "numTimesteps")} />
				<br />

				{/* Solver:
				<Options
					editable={false}
					onEdit={selectSolver}
					none={solver[0]}
					options={solver}
				/>
				<br /> */}

				{/* I.C Range
				<RangeInput min={0} max={100} value={{ min: 25, max: 75 }} onEdit={(type, value) => {
					console.log(type, value); // Type will be "min" or "max"
				}} />
				<br /> */}

				{/* Reference Conditions:
				<Options
					editable={false}
					onEdit={selectCondition}
					none={conditions[0]}
					options={conditions}
				/> */}

			</dl>
		</span>
	)
});