import React from "react"
import { ExperimentSettingsViewBuilder } from "../../../analysis/experimentView"
import { FormattedMessage } from 'react-intl'
import EditableMapProperty from "../../../model/editableMapProperty"

export default ExperimentSettingsViewBuilder({
	modelType: "pharmacokinetic",
	experimentGroupType: "contextSpecific",
	disableExperimentControl: true,
	experimentSettings: (props) => {
	const { modelState } = props
	const {onEditModelState} = props.actions
	const local = modelState.get("simulation")
	const ep = { entity: local, onEdit: (_, property, value) => onEditModelState(["simulation", property], value), parentWidth: props.parentWidth }
	return (
		<>
			<FormattedMessage id="ModelDashboard.Analysis.SimulationEndTime" defaultMessage="Simulation end time">
				{(message) => (<EditableMapProperty {...ep} property="endTime" label={message} min="1" max="10000" postfix=" hr" />)}
			</FormattedMessage>
			<FormattedMessage id="ModelDashboard.Analysis.SimulationTimeStep" defaultMessage="Simulation time step">
				{(message) => (<EditableMapProperty {...ep} property="stepSize" label={message} min="0" max="10000" />)}
			</FormattedMessage>
			<FormattedMessage id="ModelDashboard.Analysis.SimulationSubjectCount" defaultMessage="Number of simulated subjects">
				{(message) => (<EditableMapProperty {...ep} property="subjectCount" label={message} min="1" max="10000" />)}
			</FormattedMessage>
			<dl>
				<FormattedMessage id="ModelDashboard.Analysis.SimulationPopulation" defaultMessage="Population">
					{(message) => (<>{message} <b>Reference</b></>)}
				</FormattedMessage>
			</dl>
		</>
	)
	}
})
