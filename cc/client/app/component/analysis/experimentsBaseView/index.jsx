import React from 'react';
import { Seq } from 'immutable';
import Application from '../../../application';
import view from '../../base/view';
import Panel from '../../base/panel';
import Table from '../../base/table';
import Add from '../../../action/add';
import Remove from '../../../action/remove';
import Update from '../../../action/update';
import Checkbox from '../../base/checkbox';
import Spinner from '../../base/spinner';
import Experiment from '../../../entity/Experiment';
import Environment from '../../../entity/Environment';
import OutputRange from '../../../entity/outputRange';
import { injectIntl } from 'react-intl';
import messages from "./messages"
import { EXPER_COMPLETED, EXPER_RUNNING } from '../../../analysis';
import ExperEnvironmentSetup, { doSelectDefaultEnvironment } from '../../../analysis/experimentEnvironment';


function experimentCreator({ model, modelState, actions, initialState, selectedExper }) {
	const newExper = new Experiment({
		name: Application.defName(model.Experiment, "New Experiment "),
		env: "value", created: new Date(),
		numSimulations: 100, bits: false, initialState
	})
	const selectEnvSetup = ExperEnvironmentSetup({ model, modelState, actions });
	const getIdSelecteEnv = doSelectDefaultEnvironment(selectEnvSetup, true);
	if (getIdSelecteEnv) {
		selectedExper.environment = getIdSelecteEnv;
	}
	let addRows = [];
	addRows.push(new Add(newExper, true));
	addRows.push(new Add(new OutputRange({ parent: newExper, from: Experiment.transientTime, to: Experiment.runTime }), true));
	if (!getIdSelecteEnv) {
		addRows.push(new Add(new Environment({name: "Default", isDefault: true})));
		addRows.push(new Add(new Environment({name : Application.defName(model.Environment, "New Env ")}), true))
	}
	actions.batch(addRows);
}


export default (sensitivity) => {
    const experimentType = sensitivity ? "EnvironmentSensitivity" : "";

    class Content extends React.Component {
        render ( ) {
            const {view, model, modelState, persisted, entities, selected, intl, actions} = this.props;
            const state = modelState.getIn(["Experiment", experimentType]);
            const selection = modelState.getIn(["selection", "Experiment"]);
            const gs = e => selection?.get(e.id);

            const completed = e => {
                const f = e => (e === EXPER_COMPLETED ? 1 : null);
                let ss, s = state.get(e.id);
                return s ? ((ss = s.get("state")) === EXPER_RUNNING ? s.get("percentComplete") : f(ss)) : (experimentType.length ? null : f(e.state));
            };

						// let formatCompleted = e => typeof e == 'number' ? (Math.round(100*e) + '%') : (<span {...e}>{Math.round(e.from)+'%'}<Spinner />{Math.round(e.to)+'%'}</span>);
            const formatCompleted = e => {
              return (typeof e == 'number') ? (Math.round(100*e) + '%') : (<Spinner className={"spinner wide"}/>);
            }

            return (
                <Panel {...view} className="bar analysis1-phase1">
                    <Table {...actions}
                        onAdd={e => {
													const selectEnvSetup = ExperEnvironmentSetup({ model, modelState, actions });
													const getIdSelecteEnv = doSelectDefaultEnvironment(selectEnvSetup, true);
													if (getIdSelecteEnv) {
														e.environment = getIdSelecteEnv;
													}
													let addRows = [];
													addRows.push(new Add(e, true));
													addRows.push(new Add(new OutputRange({ parent: e, from: Experiment.transientTime, to: Experiment.runTime }), true));
													if (!getIdSelecteEnv) {
														addRows.push(new Add(new Environment({name: "Default", isDefault: true})));
														addRows.push(new Add(new Environment({name : Application.defName(model.Environment, "New Env ")}), true))
													}													
													actions.batch(addRows);
												}}
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
                            { get: "name", label: intl.formatMessage(messages.ModelDashBoardExperimentsViewLabelName), editable: true, def: "_name" },
                            { get: completed, format: e => (e = completed(e), e != null ? formatCompleted(e) : e), style: "percentage" },
                            { get: "created", format: e => e.created.toLocaleDateString(), label: intl.formatMessage(messages.ModelDashBoardExperimentsViewLabelCreated), style: "date", minWidth: 250 },
                            { get: gs, format: e => (<Checkbox value={gs(e)} onEdit={(v, _) => (actions.onEditModelState(["selection", "Experiment", e], v), _.stopPropagation())}/>), style: "checkbox selection" }
                        ]}>
                    </Table>
                </Panel>
            );
        }
    }

    const translatedContent = injectIntl(Content)

    const updateActivities = (actions, activities, experiment, environment) => {
        return Seq();
//        let filteredActivities = activities.filter(e => e.parent === environment);
//        return filteredActivitiesSeq().map(e => new Update(e, 'experiment', experiment)).toIndexedSeq();
    };

    const removeExperiment = (e, actions, model, environment) => {
        if(e && !(e != null && !e.userId && null)) {
             actions.batch(updateActivities(actions, Seq(model.ExperimentActivity), null, environment).concat([new Update(e, 'environment', null), new Remove(e, true)]).toArray());
        }
    }

    const Actions = ({model, modelState, selected: { Experiment: e, Environment : environment, InitialState: initState }, actions}) => {
				const experiments = model.Experiment;
				const eType = (e && e.experimentType) || experimentType
        const selection = modelState.getIn(["selection", "Experiment"]);
        const state = modelState.getIn(["Experiment", eType]);
        const f = (v, k) => v && state.getIn([k, "state"]) !== "RUNNING";

        return {
            add: model.id !== undefined && experimentCreator.bind(this, {
							model, modelState, actions, initialState: initState,  selectedExper: e
						}),
            remove: () => {removeExperiment(e, actions, model, environment)}, //e != null && !e.userId && null,
            copy: { action: e != null && (() => actions.batch(e.copy({ name: Application.defNameCopy(experiments, e), state: undefined, userId: null }).map((e, i) => new Add(e.entity, !i)).toArray())), title: "Copy" },
            run: selection !== undefined && selection.some(f) && (e => selection.filter(f).forEach((_, k) => actions.onStartExperiment(experiments[k], { model }, e.ctrlKey, experiments[k].experimentType)))
        };
    };

    return view(translatedContent, null, Actions);
}
