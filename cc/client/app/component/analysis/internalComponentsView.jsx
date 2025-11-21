import React from "react";
import { Seq } from "immutable";
import view from "../base/view";
import Panel from "../base/panel";
import Table from "../base/table";
import Checkbox from "../base/checkbox";
import CheckboxN from "../base/checkboxN";
import InitialStateComponent from "../../entity/initialStateComponent";
import FlowMutation from "../../entity/flowMutation";
import ExperimentMutation from "../../entity/ExperimentMutation";
import { FormattedMessage } from "react-intl";

export default view(({view, model, entities, selected, selected: { Experiment: experiment }, editable, actions}) => {
	let initialState;
	let mutation, range, flow, edit;
	let activity = { get: () => null, style: "checkbox" };
	let gm = () => 0;

	if (experiment) {
		if ((flow = experiment.flow) && (range = selected.FlowRange)) {
			mutation = entities.get("FlowMutation");
			const id = range.id;
			gm = e => ((e = e.flowMutations) && (e = e[id]) ? e.state : 0);
			edit = editable && ((c, v) => {
				let e = c.flowMutations;
				e && (e = e[id]) ? (!v ? actions.onRemove(e) : actions.onEdit(e, "state", v)) : actions.onAdd(new FlowMutation({ parent: range, component: c, state: v }));
			});
		}
		else {
			mutation = entities.get("ExperimentMutation");
			const id = experiment.id;
			gm = e => ((e = e.experimentMutations) && (e = e[id]) && e.state) || 0;
			edit = !experiment.userId && ((c, v) => {
				let e = c.experimentMutations;
				e && (e = e[id]) ? (v ? actions.onEdit(e, "state", v) : actions.onRemove(e)) : actions.onAdd(new ExperimentMutation({ parent: experiment, component: c, state: v }));
			});
		}
		if (initialState = experiment.initialState) {
			const id = initialState.id;
			const f = e => ((e = e.initialStates) && e[id]) !== undefined;
			activity = { get: f, format: e => (<Checkbox value={f(e)} onEdit={editable && (v => (v ? actions.onAdd(new InitialStateComponent({ parent: initialState, component: e })) :
				actions.onRemove(e.initialStates[id])))}/>), title: "Initial State", style: "checkbox initialState" };
		}
	}

	return (
		<Panel {...view} className="bar">
			<FormattedMessage id="ModelDashBoard.AnalysisInternalComponentsView.LabelName">
				{messages => 
					<Table
						references={[entities.get("Component"), entities.get("InitialStateComponent"), mutation, experiment, initialState, flow, range]}
						owner={model}
						data={Seq(model.Component).filterNot(e => e.isExternal)}
						search="name"
						columns={[
							{ get: "name", label: messages },
							activity,
							{ get: gm, format: e => (<CheckboxN value={gm(e)} onEdit={edit && edit.bind(null, e)}/>), title: "Mutation", style: "checkbox mutation" }
						]}>
					</Table>
				}
			</FormattedMessage>
		</Panel>
	);
});
