import React from "react";
import { Seq } from "immutable";
import Application from "../../../application";
import view from "../../base/view";
import Panel from "../../base/panel";
import Table from "../../base/table";
import Add from "../../../action/add";
import Remove from "../../../action/remove";
import Update from "../../../action/update";
import Checkbox from "../../base/checkbox";
import Experiment from "../../../entity/Experiment";
import OutputRange from "../../../entity/outputRange";

export const ExperimentsViewBuilderKinetic = ({
	experimentType = null
} = { }) => {
	class Content extends React.Component {
		render ( ) {        
			const {view, model, modelState, persisted, entities, selected, actions} = this.props;
			const state = modelState.get("Experiment");
			const selection = modelState.getIn(["selection", "Experiment"]);
			// const gs = e => selection.get(e.id);
			const gs = e => (selection && typeof selection.get === 'function') ? selection.get(e.id) : null;

			
			const completed = e => {
				const f = e => (e === "COMPLETED" ? 1 : null);
				let ss, s = state.get(e.id);
				return s ? ((ss = s.get("state")) === "RUNNING" ? s.get("percentComplete") : f(ss)) : f(e.state);
			};
			
								
			return (
				<Panel {...view} className="bar analysis1-phase1">
					<Table {...actions}
						onAdd={e => actions.batch([new Add(e, true), new Add(new OutputRange({ parent: e, from: Experiment.transientTime, to: Experiment.runTime }), true)])}
						onDrag={null}
						persisted={persisted.Experiment}
						references={[entities.get("Experiment"), state, selection]}
						owner={model}
						selected={selected.Experiment}
						data={Seq(model.Experiment)}
						creator={() => new Experiment({ name: Application.defName(model.Experiment, "New Experiment "), env: "value", created: new Date(), numSimulations: 100, bits: false, initialState: selected.InitialState })}
						search="name"
						editable={e => !e.userId}
						columns={[
							{ get: "name", label: "Name", editable: true, def: "_name" },
							{ get: completed, format: e => (e = completed(e), e != null ? Math.round(100*e) + "%" : e), style: "percentage" },
							{ get: "created", format: e => e.created.toLocaleDateString(), label: "Created", style: "date", minWidth: 250 },
							{ get: gs, format: e => (<Checkbox value={gs(e)} onEdit={(v, _) => (actions.onEditModelState(["selection", "Experiment", e], v), _.stopPropagation())}/>), style: "checkbox selection" }
						]}>
					</Table>
				</Panel>
			);
		}    
	}
	const updateActivities = (actions, activities, experiment, environment) => {     
		const filteredActivities = activities.filter(e => e.parent === environment);
		return filteredActivities.map(e => new Update(e, "experiment", experiment)).toIndexedSeq();
	};

	const addExperiment = ({ model, selected, actions }) => {
		let kineticLaws = Seq();
		if (model.modelType === 'kinetic') {
			kineticLaws = model.KineticLaw
		}
		const e = new Experiment({
			experimentType,
			name: Application.defName(model.Experiment, "New Experiment "),
			created: new Date(),
			numSimulations: 100,
			bits: false,
			initialState: selected.InitialState,
			parameters: kineticLaws 
		});
		actions.batch([new Add(e, true), new Add(new OutputRange({
			parent: e,
			from: Experiment.transientTime,
			to: Experiment.runTime
		}), true)]);
	}

	const removeExperiment = (e, actions, model, environment) => { 
		if(!(e != null && !e.userId && null)) {        
			actions.batch(updateActivities(actions, Seq(model.ExperimentActivity), null, environment).concat([new Update(e, "environment", null), new Remove(e, true)]).toArray());
		}
	};
	
	const Actions = (props) => {
		const {model, modelState, selected: { Experiment: e, Environment : environment }, actions} = props;
		const experiments = model.Experiment;
		const selection = modelState.getIn(["selection", "Experiment"]);
		const state = modelState.get("Experiment");
		const f = (v, k) => v && state.getIn([k, "state"]) !== "RUNNING";
			
		return {
			add: () => model.id !== undefined && addExperiment(props),
			remove: () => e && removeExperiment(e, actions, model, environment), //e != null && !e.userId && null,
			copy: {
				action: e != null && (() => actions.batch(e.copy({ name: Application.defNameCopy(experiments, e), state: undefined, userId: null }).map((e, i) => new Add(e.entity, !i)).toArray())),
				title: "Copy"
			},
			run: selection !== undefined && selection.some(f) && (e => selection.filter(f).forEach((_, k) => actions.onStartExperiment(experiments[k], props, e.ctrlKey,
				experiments[k] && experiments[k].experimentType || experimentType)))
		};
	};
	
	return view(Content, null, Actions);
}

export default ExperimentsViewBuilderKinetic();