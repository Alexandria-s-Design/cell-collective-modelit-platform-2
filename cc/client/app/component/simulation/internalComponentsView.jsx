import React from "react";
import { Seq } from "immutable";
import view from "../base/view";
import Panel from "../base/panel";
import Table from "../base/table";
import Checkbox from "../base/checkbox";
import CheckboxN from "../base/checkboxN";
import Remove from "../../action/remove";
import InitialStateComponent from "../../entity/initialStateComponent";
import FlowMutation from "../../entity/flowMutation";

export default view(({view, simulation, model, modelState, entities, selected, editable, actions}) => {
	const visibility = modelState.getIn(["simulation", "visibility"]);
	const gv = e => visibility.get(e.id, false);
	const edit = (e, p, v) => actions.onEditModelState(["simulation", p, e], v);
	let activity, initialState, step = simulation.step - 1;
	let range, flow = selected.Flow;
	let mutation, gm, em;

	if (step < 0) {
		initialState = selected.InitialState;
		if (initialState) {
			const id = initialState.id;
			const f = e => ((e = e.initialStates) && e[id]) !== undefined;
			activity = { get: f, format: e => (<Checkbox value={f(e)} onEdit={editable && (v => (v ? actions.onAdd(new InitialStateComponent({ parent: initialState, component: e })) :
				actions.onRemove(e.initialStates[id])))}/>), title: "Initial State", style: "checkbox initialState" };
		}
		else {
			activity = { get: () => null, style: "checkbox" };
		}
	}
	else {
		const s = simulation.state;
		const f = e => (s[e.id] ? s[e.id].avg[step] : undefined);
		activity = { get: f, format: e => Math.round(100 * f(e)) + "%", title: "Current Activity", style: "checkbox percentage current" };
	}

	if (flow && (step >= 0 || (range = selected.FlowRange))) {
		mutation = entities.get("FlowMutation");

		if (step < 0) {
			const id = range.id;
			gm = e => ((e = e.flowMutations) && (e = e[id]) ? e.state : 0);
			em = editable && ((c, v) => {
				let e = c.flowMutations;
				e && (e = e[id]) ? (!v ? actions.onRemove(e) : actions.onEdit(e, "state", v)) : actions.onAdd(new FlowMutation({ parent: range, component: c, state: v }));
			});
		}
		else {
			const ranges = Seq(flow.ranges);
			range = ranges.map(e => e.from).concat(ranges.map(e => e.to)).filter(e => e <= step).max();
			const id = flow.id;
			const f = e => e.filter(e => e.from <= step && e.to > step).minBy(e => e.to - e.from);
			gm = c => {
				const e = f(Seq(c.flowMutations).map(e => e.parent).filter(e => e.parentId == id));
				return e ? c.flowMutations[e.id].state : 0;
			};
			const min = f(ranges);
			em = editable && min && ((c, v) => {
				let e;
				!v ? actions.batch(Seq(c.flowMutations).filter(e => (e = e.parent, e.parentId == id && e.from <= step && e.to > step)).map(e => new Remove(e)).toArray()) :
					((e = f(Seq(c.flowMutations).map(e => e.parent).filter(e => e.parentId == id))) ? actions.onEdit(c.flowMutations[e.id], "state", v) : actions.onAdd(new FlowMutation({ parent: min, component: c, state: v})));
			});            
		}
	}
	else {
		mutation = modelState.getIn(["simulation", "mutation"]);
		gm = e => mutation.get(e.id, 0);
		em = (e, v) => edit(e, "mutation", v);
	}

	return (
		<Panel {...view} className="bar sim2-phase1">
			<Table
				references={[entities.get("Component"), entities.get("InitialStateComponent"), modelState.get("simulation"), initialState, mutation, flow, range]}
				owner={model}
				data={Seq(model.Component).filterNot(e => e.isExternal)}
				search="name"
				columns={[
					{ get: gv, format: e => (<Checkbox value={gv(e)} onEdit={edit.bind(null, e, "visibility")}/>), title: "Graph Visibility", style: "checkbox visibility" },
					{ get: "name", label: "Name" },
					activity,
					{ get: gm, format: e => (<CheckboxN value={gm(e)} onEdit={em && em.bind(null, e)}/>), title: "Mutation", style: "checkbox mutation sim1-phase2" }
				]}>
			</Table>
		</Panel>
	);
});
