import React from "react";
import { Seq } from "immutable";
import Add from "../../action/add";
import view from "../base/view";
import Panel from "../base/panel";
import Table from "../base/table";
import RangeInput from "../base/rangeInput";
import FlowActivity from "../../entity/FlowActivity";
import ExperimentActivity from "../../entity/ExperimentActivity";
import EnvironmentControl from "./environmentControl";
import Experiment from "../../entity/Experiment";
import Environment from "../../entity/Environment";
import Application from "../../application";
import messages from "./externalComponentsMessages"


const Content = ({ view, model, entities, selected, selected: { Experiment: experiment, Environment: environment }, editable, actions }) => {
	let activity, range, flow, edit, min, max;
	const isEmpty = e => e.min === 0 && e.max === 100;


	if (environment) {
		if (experiment && (flow = experiment.flow) && (range = selected.FlowRange)) {
			activity = entities.get("FlowActivity");
			const id = range.id;
			min = e => ((e = e.flowActivities) && (e = e[id]) ? (e.min != null ? e.min : e.value) : 0);
			max = e => ((e = e.flowActivities) && (e = e[id]) ? (e.max != null ? e.max : e.value) : 100);
			edit = editable && ((c, p, v) => {
				let r, e = c.flowActivities;
				e && (e = e[id]) ? (!e.value && (r = { min: e.min, max: e.max }, r[p] = v, isEmpty(r)) ? actions.onRemove(e) : actions.onEdit(e, p, v)) : (e = { parent: range, component: c, min: 0, max: 100 }, e[p] = v, !isEmpty(e) && actions.onAdd(new FlowActivity(e)));
			});
		}
		else {
			activity = entities.get("ExperimentActivity");
			const id = environment.id;
			min = e => ((e = e.experimentActivities) && (e = e[id]) ? e.min : 0);
			max = e => ((e = e.experimentActivities) && (e = e[id]) ? e.max : 100);
			edit = ((c, p, v) => {
				let r, e = c.experimentActivities;
				e && (e = e[id]) ? (r = { min: e.min, max: e.max }, r[p] = v, isEmpty(r) ? actions.onRemove(e) : actions.onEdit(e, p, v))
				:
				(e = { parent: environment, component: c, min: 0, max: 100, experiment: undefined }, e[p] = v, !isEmpty(e)
					&& actions.onAdd(new ExperimentActivity(e)));
			});
		}
	}
	else {
		min = () => 0;
		max = () => 100;

		edit = ((c, p, v) => {
			const data = model.Environment ? Seq(model.Environment) : Seq();
			const environment = new Environment({ name: Application.defName(data, "New Env ") });
			actions.batch(Seq([new Add(environment, true)]));

			activity = entities.get("ExperimentActivity");
			const id = environment.id;
			min = e => ((e = e.experimentActivities) && (e = e[id]) ? e.min : 0);
			max = e => ((e = e.experimentActivities) && (e = e[id]) ? e.max : 100);
			let r, e = c.experimentActivities;
			e && (e = e[id]) ? (
				r = { min: e.min, max: e.max },
				r[p] = v,
				isEmpty(r) ? actions.onRemove(e) : actions.onEdit(e, p, v))
			:
			(e = { parent: environment, component: c, min: 0, max: 100, experiment: undefined }, e[p] = v, !isEmpty(e)
				&& actions.onAdd(new ExperimentActivity(e)));
		});
	}

	const props = this.props;
	const intl = props.intl;

	return (
		<Panel {...view} className="bar analysis2-phase1">
			<Table
				references={[entities.get("Component"), activity, experiment, flow, range, environment]}
				owner={model}
				data={Seq(model.Component).filter(e => e.isExternal)}
				search="name"
				columns={[
					{ get: "name", label: intl.formatMessage(messages.ModelDashBoardAnalysisExternalComponentsLabelName) },
					{
						get: e => max(e) - min(e),
						format: e => (
							<RangeInput
								value={{ min: min(e), max: max(e) }}
								onEdit={edit && edit.bind(null, e)} units="%"
							/>
						),
						label: "Activity Range",
						style: "activity range"
					}
				]}>
			</Table>
		</Panel>
	);
};

const Actions = props => {
	return {
		layout: <span><EnvironmentControl  {...props} /></span>
	};
};


export default view(Content, null, Actions);
