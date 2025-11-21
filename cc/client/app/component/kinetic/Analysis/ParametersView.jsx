import React from "react";
import { Seq, Map } from "immutable";

import Application from "../../../application";
import view from "../../base/view";
import Editable from "../../base/editable";

import Panel from "../../base/panel";
import Table from "../../base/table";
import Checkbox from "../../base/checkbox";
import EnvironmentControl from "../../analysis/environmentControl";
import Persist from "../../../mixin/persist";

import Reaction from "../../../entity/kinetic/Reaction";
import { kineticLawTypeMap } from "../Model/KineticLaw";

import utils from "../../../utils";

export const ParametersViewBuilder = ({
	viewable = false,
	isDraggable = false,
	expandedView = false,
	showCore = false
} = {}) => {
	const Content = (props) => {
		const { view, entities, model, persisted,
			selected: { Experiment: experiment, Environment: environment,
				Reaction: reaction },
			actions, draggable, modelState } = props;
		let { editable } = props;
		editable = editable && !viewable;
	
		const state = view.getState();
		expandedView = state.expandedView;

		let kineticLaw = reaction && model.KineticLaw[typeof reaction.kinetic_law === 'object' ? reaction.kinetic_law.id : reaction.kinetic_law];
		let parameters = kineticLaw && experiment && experiment.parameters[kineticLaw.id].parameters
		let data = Seq(parameters);

		return (
			<Panel {...view} className="bar">
				<Table key={kineticLaw && kineticLaw.id} {...actions} top="10%"
					onDrag={false}
					references={[
						entities.get("Reaction"),
						entities.get("KineticLaw"),
						entities.get("Experiment"),
						experiment,
						modelState.get("Reaction"),
					]}
					owner={model}
					data={data}
					search="name"
					columns={[
						{
							get: "name", label: "Name"
						},
						{
							get: "value", label: "Value", format: e => (<Editable value={e.value} onEdit={val =>
								actions.onEdit(experiment.parameters[kineticLaw.id], "parameters", Seq(parameters).map(
									(param) => {
										if (param.name == e.name) {
											return {
												...param,
												value: val
											};
										}
										return param;
									}
								).toObject())
							} />), editable: true, style: "kineticParameter editable"
						}
					].filter(Boolean)}>
				</Table>
			</Panel>
		);
	}

	const Actions = (props) => {
		let { view, model, editable, selected: { Reaction: e }, actions } = props;
		editable = editable && !viewable;
		const state = view.getState();
		expandedView = state.expandedView;


		let kineticLaw = e && model.KineticLaw[typeof e.kinetic_law === 'object' ? e.kinetic_law.id : e.kinetic_law];

		return utils.pick({
			type: (kineticLaw ?
				<span>
					<dl>
						<dt>Type:</dt>
						<dd>
							{kineticLawTypeMap[kineticLaw.type]}
						</dd>
					</dl>
				</span> : <span></span>
			),
		}, editable)
	}

	const persist = Persist(
		{ expandedView: false },
		null,
		null,
		null,
		{ expandedView: false }
	)

	return view(Content, null, Actions, {}, [persist]);
}

export default ParametersViewBuilder();