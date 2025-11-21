import React, {useState} from "react";
import { Seq, Map } from "immutable";

import Application from "../../../application";
import view from "../../base/view";

import Panel from "../../base/panel";
import Table from "../../base/table";
import Checkbox from "../../base/checkbox";
import EnvironmentControl from "../../analysis/environmentControl";
import Persist from "../../../mixin/persist";

import Reaction from "../../../entity/kinetic/Reaction";

import utils from "../../../utils";
import Update from "../../../action/update";

const getKnockedOutGenes = ({ model, selected: { Experiment: experiment, Reaction: e } }, r) => {
	let genes = [];

	e = e ? e : r;

	if (experiment && experiment.mutations) {
		genes = Seq(experiment.mutations)
			.filter(m => m.state)
			.map(m => model.Gene[m.geneId])
			.toArray();
	}

	return genes;
}
 
const onSelectKBEntity = ({ actions }, e) => {
	actions.onSelect(e);
};


export const isFunctional = (props, r) => {
	const { selected: { Experiment: experiment } } = props;
	let { selected: { Reaction: e } } = props;

	e = e ? e : r;
	const genes = getKnockedOutGenes(props, e);

	return true;
}

export const knockOutReaction = (props, e, knockOut) => {
	const { selected: { Reaction: r }, actions } = props;

	e = e ? e : r;

	actions.batch([
		new Update(e, "lowerBound", knockOut ? 0 : Reaction.DEFAULT_LOWER_BOUND),
		new Update(e, "upperBound", knockOut ? 0 : Reaction.DEFAULT_UPPER_BOUND)
	])
}

export const removeReaction = (props, e, { model = null, confirm = true, orphans = false } = {}) => {
	const { selected: { Reaction: r }, actions } = props;
	model = model || props.model;

	e = e ? e : r;

	const removeOrphans = () => {
		// Remove Metabolites from Reaction...
		// const metabolites = getMetabolites(model.Metabolite, e);
		// metabolites.forEach(m => m && removeMetabolite(props, m, { confirm: false }));
		// if(+e.id < 0 && e.kinetic_law){
		// 	console.log(`1yy :`, e.kinetic_law)
		// }
		// +e.id < 0 && 
		// e.kinetic_law && actions.onRemove(e.kinetic_law);
		let kineticLaw = e && model.KineticLaw && model.KineticLaw[e.kinetic_law && typeof e.kinetic_law === 'object' ? e.kinetic_law.id : e.kinetic_law];
		kineticLaw && actions.onRemove(kineticLaw);
	}

	if (confirm) {
		const message = `Do you wish to delete all metabolites and genes corresponding to ${e.name}?`
		const options = {
			okText: "FORCE",
			cancelText: "DELETE",
			onCancel: () => {
				actions.onRemove(e);
			}
		}

		actions.onConfirm(message, () => {
			removeOrphans();
			actions.onRemove(e);
		}, options);
	} else {
		if (orphans) {
			removeOrphans();
		}

		actions.onRemove(e);
	}
}

// helpers...
const filterReactions = (reactions, subsystem) =>
(reactions ?
	subsystem ? Seq(reactions).filter(r => `${r.subsystem}` == `${subsystem.id}`) : Seq(reactions) : Seq());


export const createReaction = ({ model, selected: { SubSystem: subsystem }, actions }) => {
	const reactions = filterReactions(model.Reaction, subsystem);

	const reaction = new Reaction({
		name: Application.defNameExt(model.Reaction, "", /^[A-Z]\d*$/i),
		reaction_id: Application.defNameExt(model.Reaction, "r", /^r[A-Z]\d*$/i, { propertyName: "reaction_id" }),
	});

	actions.onAdd(reaction, false);
}

export const ReactionsViewBuilder = ({
	viewable = false,
	showVisibility = true,
	fluxControl = false,
	isDraggable = false,
	expandedView = false,
	showAdd = true,
	showRemove = true,
} = {}) => {
	const Content = (props) => {
		const { view, entities, model, persisted,	selected: { Experiment: experiment, Environment: environment,
				Reaction: reaction }, actions, draggable, modelState } = props;
		let { editable } = props;
		editable = editable && !viewable;

		const state = view.getState();
		expandedView = state.expandedView;

		let data = Seq(model.Reaction);

		return (
			<Panel {...view} className="bar">
				<Table {...actions} top="10%"
					onDrag={(editable || isDraggable) && actions.onDrag.bind(null, draggable)}
					persisted={persisted.Reaction}
					references={[
						entities.get("Reaction"),
						entities.get("Experiment"),
						reaction,
						experiment,
						environment,
						expandedView,
						modelState.get("Reaction"),
					]}
					owner={model}
					selected={reaction}
					onClick={(e) => {
						onSelectKBEntity(props, e);
					}}
					data={data}
					creator={() => createReaction(props)}
					search="name"
					columns={[
						expandedView && {
							get: "reaction_id", label: "ID", editable: editable, def: "_reaction_id"
						},
						{
							get: "name", label: "Name", editable: editable, def: "_name"
						},
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

		return utils.pick({
			add: showAdd && editable && {
				title: "Create a new Reaction", // TODO (Metabolic): Translate
				action: (() => createReaction(props))
			},
			remove: showRemove && editable && e && {
				title: "Remove selected Reaction", // TODO (Metabolic): Translate
				action: (() => removeReaction(props, e))
			},
			environment: fluxControl && (
				<span>
					<EnvironmentControl {...props} editable={true} />
				</span>
			),
			table: {
				title: "View/Hide Information",
				type: Checkbox,
				value: expandedView,
				style: "icon base-table checkbox",
				onEdit: e => view.setState({ expandedView: e })
			}
		}, [showAdd && editable, showRemove && editable, editable, fluxControl])
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

export default ReactionsViewBuilder();