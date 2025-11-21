import React from 'react';
import { Seq } from 'immutable';
import Utils from '../../utils';
import view from '../base/view';
import Panel from '../base/panel';
import Options from '../base/options';
import Scrollable from '../base/scrollable';
import Checkbox from '../base/checkbox';
import Spinner from '../base/spinner';

import Add from '../../action/add';
import Update from '../../action/update';
import UpdateProperty from '../../action/updateProperty';
import EditableProperty from '../model/editableProperty';
import SimulationTypeControl from '../model/simulationTypeControl';
import InitialStateControl from '../model/initialStateControl';
import FlowControl from '../model/flowControl';
import OutputRangesControl from './outputRangesControl';
import Application from '../../application';
import Experiment from '../../entity/Experiment';
import OutputRange from '../../entity/outputRange';
import Environment from '../../entity/Environment';
import EnvironmentSelect from './environmentSelect';
import { FormattedMessage } from 'react-intl';
import { EXPER_COMPLETED, EXPER_RUNNING } from '../../analysis';
import ExperEnvironmentSetup, { doSelectDefaultEnvironment } from '../../analysis/experimentEnvironment';

const conditionOptions = Seq({
    GROWTH: "Growth",
    DEATH:  "Death"/*,
    QUISCENCE: "Quiescence"*/
}).map((v, k) => ({ id: k, name: v })).toObject();

const ExperimentalConditionsSelect = ({value, onChange: change}) => (
    <dl>
			<dt>Experimental Condition:</dt>
			<Options value={conditionOptions[value]} def={conditionOptions.DEATH} options={Seq(conditionOptions)} enabled={change} onChange={e => change(e && e.id)}/>
    </dl>
);

export default ({
	experimentType = null,
	download = null
} = { }) => {
    const Content = props => {
        const {model, selected, actions:{onEditModelState} } = props;
        const actions = props.actions;
        const copy = (s, n, p) => Seq(s).map(e => e.copy(p, null, n)).flatten(true).map(e => new Add(e.entity)).toArray();
				const e = props.selected.Experiment;
				const eType = (e && e.experimentType) || experimentType;
        const changeable = e && !e.userId;
        const editable = changeable && props.editable;
        let ss, state = e && props.modelState.getIn(["Experiment", eType, e.id]);
        const completed = state && ((ss = state.get("state")) === EXPER_RUNNING ? state.get("percentComplete") : (ss === EXPER_COMPLETED ? 1 : null));
        const ep = { entity: e, onEdit: changeable && actions.onEdit, parentWidth: props.parentWidth };
        const rDL = (n, v) => (
					<dl>
						<dt>{n + ":"}</dt>
						<dd>{v}</dd>
					</dl>
        );

        const addExperiment = () => {
					const selectEnvSetup = ExperEnvironmentSetup({ model, modelState: props.modelState, actions });
					const getIdSelecteEnv = doSelectDefaultEnvironment(selectEnvSetup, true);
					const e = new Experiment({
						experimentType,
						name: Application.defName(model.Experiment, "New Experiment "),
						created: new Date(),
						numSimulations: 100,
						bits: false,
						initialState: selected.InitialState,
						environment: getIdSelecteEnv
					});	
					const addRows = [];
					addRows.push(new Add(e, true))
					addRows.push(new Add(new OutputRange({ parent: e, from: Experiment.transientTime, to: Experiment.runTime }), true))
					if (!getIdSelecteEnv) {
						addRows.push(new Add(new Environment({name: "Default", isDefault: true})));
						addRows.push(new Add(new Environment({name : Application.defName(model.Environment, "New Env ")}), true))
					}
					actions.batch(addRows);
        };

        const rCompleted = (t) => (
            typeof t === 'number' ?
              Math.round(100*completed) + '%' :
              (<Spinner before={Math.round(100*completed.from) + '% - '} after={' - ' + Math.round(100*completed.to) + '%'} />)
        );

				const getDefaultEnvironment = (create) => {
					let findDefault;
					if (model.Environment) {
						findDefault = Seq(model.Environment).toMap().filter(e => e.isDefault).first();
					}
					if (!findDefault && create) {
						const newEnv = new Environment({name: "Default", isDefault: true});
						const newEnv1 = new Environment({name : Application.defName(model.Environment, "New Env ")});
						actions.batch([new Add(newEnv), new Add(newEnv1, true)]);
						findDefault = newEnv1;
					}
					return findDefault;
				}

        const runExperiment = _ => {
            const {selected: {Experiment: experiment} } = props;
						const { environment } = experiment;
						const getEnv = environment || getDefaultEnvironment(true);
						const eType = (experiment && experiment.experimentType) || experimentType;
						const updates = [];
						if (!environment) {
							updates.push(new Update(experiment, 'environment', getEnv));
						}
						if (getEnv) {
							actions.batch([new Update(experiment, 'lastRunEnvironment', getEnv)].concat(updates));
						}
            return actions.onStartExperiment(experiment, props, _.ctrlKey, eType);
        }

        return (
            <Panel {...props.view} className="analysis3-phase1 analysis2-phase2">
                <Scrollable>
                    <div className="simulation control">
											<input type="button" className={Utils.css("icon", "large-run")} disabled={Utils.enabled(e && ss !== EXPER_RUNNING && ss !== "WAITING" && e.validRanges.first() && ((e.lastRunEnvironment !== null || e.environment !== null) && (e.lastRunEnvironment ||!props.modelState.getIn(["Experiment", e.id]) || e.environment !== null)))} onClick={runExperiment}/>
											{completed != null && rDL("Completed", rCompleted(completed))}
											{state && state.has("elapsedTime") && rDL("Elapsed", state.get("elapsedTime") + 's')}
                    </div>
                    {e ? (
                        <div className="simulation settings">
                            <EditableProperty {...ep} property="name" label="Name"/>
                            <EditableProperty {...ep} property="numSimulations" label="Number of Simulations" min="1" max="10000"/>
                            <EnvironmentSelect {...props} canEdit={false}/>
                            <InitialStateControl {...props} value={e.initialState} editable={editable} onChange={changeable && (v => (actions.batch([new Update(e, "initialState", v),
                                props.editable && new UpdateProperty("initialState", v)]), actions.onSelect(v || "InitialState")))}
                                onAdd={v => actions.batch([new Add(v, true), new Update(e, "initialState", v), new UpdateProperty("initialState", v)])}/>
                            <OutputRangesControl {...props}/>
                            <SimulationTypeControl value={e.type} onChange={changeable && actions.onEdit.bind(null, e, "type")}/>
                            <dl>
                                <dt>
                                    <FormattedMessage id="ModelDashBoard.AnalysisExperiementBaseView.LabelGenerateBits"
                                        defaultMessage="Generate Bits"/>
                                </dt>
                                <Checkbox value={e.bits} onEdit={changeable && props.user.id !== undefined && actions.onEdit.bind(null, e, "bits")}/>
                            </dl>
                            <hr/>
                            <span>
                              <FlowControl {...props} flow={e.flow} range={props.selected.FlowRange} editable={editable} onChange={changeable && (v => (actions.onEdit(e, "flow", v), actions.onSelect(v || "Flow")))}
                                onAdd={(v, p) => actions.batch([new Add(v, true), new Update(e, "flow", v)].concat(p))}
                                onAddRange={p => actions.batch([new Add(p, true)].concat(copy(e.activities, "FlowActivity", { parent: p }), copy(e.mutations, "FlowMutation", { parent: p })))}/>
                            </span>
                      </div>
                    ) :
                    (
                        <div className="panel-instruction" onClick={addExperiment}>
													<div>
														<FormattedMessage id="ModelDashBoard.AnalysisExperimentSettingsView.LabelInstruction" defaultMessage="Click Here to Add New Experiment"/>
													</div>
                        </div>
                    )
                    }
                </Scrollable>
            </Panel>
        );
    };

    const Actions = props => {
				const {selected: {Experiment: e}} = props;
				const eType = (e && e.experimentType) || experimentType
        const state = e && props.modelState.getIn(["Experiment", eType, e.id]);

        return {
            download: state != null && download && download(props, state)
        };
    };

    return view(Content, null, Actions);
};
