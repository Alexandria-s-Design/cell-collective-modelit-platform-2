import React from 'react';
import { Seq, Map } from 'immutable';
import Add from '../../action/add';
import Update from '../../action/update';
import view from '../base/view';
import Panel from '../base/panel';
import Table from '../base/table';
import RangeInput from '../base/rangeInput';
import FlowActivity from '../../entity/FlowActivity';
import ExperimentActivity from '../../entity/ExperimentActivity';
import EnvironmentControl from './environmentControl';
import Experiment from '../../entity/Experiment';
import Environment from '../../entity/Environment';
import Application from '../../application';

export default (selectable) => {
    const Content = ({view, model, modelState, entities, selected, selected: { Experiment: experiment, Environment: environment, Component: component }, editable, actions}) => {
        let activity, range, flow, edit, min, max;
        const isEmpty = e => e.min === 0 && e.max === 100;

				const [getRangeActivity, setRangeActivity] = React.useState(null);
        if(!selectable) component = undefined;

				const tableData = Seq(model.Component).filter(e => e.isExternal)
				const ComponentActivity = modelState.getIn(["ComponentExternalActivity"]);

				const createNumericalEnv = () => {
					const newEnv = new Environment({name : Application.defName(model.Environment, "New Env ")});
					actions.batch([new Add(newEnv, true)]);
					return newEnv;
				}

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

				const initRangectivity = ({min, max}, env) => {
					let rangeActivities = {};
					tableData.forEach(c => rangeActivities[c.id] = {min, max});
					actions.onEditModelState(["ComponentExternalActivity"], new Map(rangeActivities));
					if (env) {						
						let updateActivities = Seq(model.ExperimentActivity).toMap()
							.filter(ac => ac.parentId == env.id)
							.map(ac => {
								let newRangeActivity = rangeActivities[ac.componentId];
								if (newRangeActivity) {
									return [
										new Update(ac, "min", newRangeActivity.min),
										new Update(ac, "max", newRangeActivity.max)
									]
								}
							}).filter(ac => ac).flatten().toArray().flat();
						actions.batch(updateActivities);
					}
				}

				if (!tableData.isEmpty() && ComponentActivity.isEmpty()) {
					initRangectivity({min:0, max:100}, environment);
				}

        if (environment) {
            if (experiment && (flow = experiment.flow) && (range = selected.FlowRange)) {
                activity = entities.get("FlowActivity");
                const id = range.id;
                min = e => ((e = e.flowActivities) && (e = e[id]) ? (e.min != null ? e.min : e.value) : 0);
                max = e => ((e = e.flowActivities) && (e = e[id]) ? (e.max != null ? e.max : e.value) : 100);
								if (getRangeActivity !== null) {
									min = () => getRangeActivity.min;
									max = () => getRangeActivity.max;
								}
                edit = editable && ((c, p, v) => {
									let r, e = c.flowActivities;
									e && (e = e[id]) ? (!e.value && (r = { min: e.min, max: e.max }, r[p] = v, isEmpty(r)) ? actions.onRemove(e) : actions.onEdit(e, p, v)) : (e = { parent: range, component: c, min: 0, max: 100 }, e[p] = v, !isEmpty(e) && actions.onAdd(new FlowActivity(e)));
                });
            }
            else {
								min = () => 0;
            		max = () => 100;
                activity = entities.get("ExperimentActivity");
								edit = true;
            }
        }
        else {
            min = () => 0;
            max = () => 100;
						if (getRangeActivity !== null) {
							min = () => getRangeActivity.min;
							max = () => getRangeActivity.max;
						}
						edit = true; //getDefaultEnvironment(true);
						if (experiment && !experiment.flow) {
							activity = entities.get("ExperimentActivity");
						}
        }

				const setComponentState = ({checkboxInUse}) => {
					let getEnv = environment || getDefaultEnvironment(true);
					if (getEnv) {
						const addRows = [];
						tableData.filter(e => {
							return !e.experimentActivities || !e.experimentActivities[getEnv.id];
						}).forEach(e => {
							let newExpActivity = {
								parent: getEnv,
								component: e,
								min: 0,
								max: 0,
								experiment: undefined
							}
							if (checkboxInUse === true) {
								newExpActivity.max = 100;
							}
							addRows.push(new Add(new ExperimentActivity(newExpActivity)));
						});
						if (addRows.length) {
							actions.batch(addRows);
						}
						if (checkboxInUse === true) {
							initRangectivity({min:0, max:100}, getEnv);
						}	else {
							initRangectivity({min:0, max:0}, getEnv);
						}
					}					
				};

				const setSliderValue = (c, v) => { }

				const getRangeValue = (e) => {				
					let _range = {min: 0, max: 100};
					if (e.experimentActivities) {
						let activityElem;
						let getEnv = environment || getDefaultEnvironment();
						if (getEnv) {
							activityElem = e.experimentActivities[getEnv.id];
						}
						if (activityElem) {
							_range.min = activityElem.min;
							_range.max = activityElem.max;
						}
					}
					return _range;
				}

				const editRangeValue = (e, p, v) => {
					if (getRangeActivity !== null) { setRangeActivity(null)	};

					let getEnv = environment || getDefaultEnvironment(true);
					if (editable === false && getEnv.isDefault === true) {
						getEnv = createNumericalEnv();
					}
					if (getEnv) {
						let activityElem;
						if (e.experimentActivities) {
							activityElem = e.experimentActivities[getEnv.id];
						}
						if (activityElem) {
							actions.onEdit(activityElem, p, v)
						} else {
							let newExpActivity = {
								parent: getEnv,
								component: e,
								min: 0,
								max: 100,
								experiment: undefined
							}
							newExpActivity[p] = v;
							actions.onAdd(new ExperimentActivity(newExpActivity))
						}
					}				
				}

        return (
            <Panel {...view} className="bar analysis2-phase1">
							<Table
								{...(selectable ? actions : {})}
								references={[entities.get("Component"), activity, experiment, flow, range, environment]}
								owner={model}
								data={tableData}
								selected={component}
								search="name"
								setCheckboxRef = {() => {}}
								setSliderValue = {setSliderValue}
								setComponentState = {setComponentState}
								columns={[
									{ get: "name", label: "Name" },
									{ get: e => max(e) - min(e),
										format: e => (											
											<RangeInput
												value={getRangeValue(e)}
												onEdit={edit && ((p,v) => {
													if (getRangeActivity !== null) {
														setRangeActivity(null);
													};
													editRangeValue(e,p,v);
												})} units="%"/>
											),
										label: "Activity Range",
										style: "activity range",
										showCheckbox: true
									}
								]}>
							</Table>
            </Panel>
        );
    	}

    const Actions = props => {
        return {
            layout : <span><EnvironmentControl  {...props}/></span>
        }
    }

		return view(Content, null, Actions);
}
