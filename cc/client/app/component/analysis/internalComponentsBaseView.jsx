import React from 'react';
import Immutable, { Seq } from 'immutable';
import view from '../base/view';
import Panel from '../base/panel';
import Table from '../base/table';
import Checkbox from '../base/checkbox';
import CheckboxN from '../base/checkboxN';
import InitialStateComponent from '../../entity/initialStateComponent';
import FlowMutation from '../../entity/flowMutation';
import ExperimentMutation from '../../entity/ExperimentMutation';


//TODO: (Ales) remove this once environmental sensitivity is fixed for multiple nodes
const OPTIMIZATION_JUST_SINGLE = false;

export default (selectable, optimization) => {
    return view(({view, modelState, model, entities, selected, selected: { Experiment: experiment, Component: component }, editable, actions}) => {
        let initialState;
        let mutation, range, flow, edit;
        let optimizationCol = { get: () => null, title: "Optimization", style: "checkbox optimization" };
        let activity = { get: () => null, title: "Inital State", style: "checkbox initialState" };
        let gm = () => 0;

        if(!selectable) component = undefined;

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

            const editOptimization = (e, v) => {
                let curMap = modelState.getIn(['Experiment', 'EnvironmentSensitivity', experiment && experiment.id, 'optimizeNodes']) || new Immutable.Map();
                if(OPTIMIZATION_JUST_SINGLE)
                    {curMap = new Immutable.Map();}
                curMap = curMap.set(e.id, v);
                actions.onEditModelState(['Experiment', 'EnvironmentSensitivity', experiment && experiment.id, 'optimizeNodes'], curMap);
            }
            const ge = (e) => modelState.getIn(['Experiment', 'EnvironmentSensitivity', experiment && experiment.id, 'optimizeNodes', e.id]) || 0;
            optimizationCol = { get: ge, format: e => (<CheckboxN title={`Specie ID: ${e.id}`} value={ge(e)} onEdit={editOptimization.bind(null, e)}/>), title: "Optimize", style: "checkbox optimization" };
        }

        const columns = [
          { get: "name", label: "Name" },
          activity,
          { get: gm, format: e => (<CheckboxN value={gm(e)} onEdit={edit && edit.bind(null, e)}/>), title: "Mutation", style: "checkbox mutation" }
        ];
        optimization && columns.push(optimizationCol);


        return (
            <Panel {...view} className="bar">
                <Table
                    {...(selectable ? actions : {})}
                    references={[entities.get("Component"), entities.get("InitialStateComponent"), mutation, experiment, initialState, flow, range, modelState]}
                    owner={model}
                    data={Seq(model.Component).filterNot(e => e.isExternal)}
                    selected={component}
                    search="name"
                    columns={columns}>
                </Table>
            </Panel>
        );
    });
}
