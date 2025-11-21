import React from "react";
import { Seq } from "immutable";
import Application from "../../../application";
import view from "../../base/view";
import Panel from "../../base/panel";
import Table from "../../base/table";
import Checkbox from "../../base/checkbox";
import CompartmentControl from "./CompartmentControl";
import Persist from "../../../mixin/persist";
import Add from "../../../action/add";
import utils from "../../../utils"

import Metabolite from "../../../entity/kinetic/Metabolite";
import Compartment from "../../../entity/kinetic/Compartment";
import { removeReaction } from "./ReactionsView";

export const onSelectKBEntity = ({ actions }, e) => {
	actions.onSelect(e);
};

export const createMetabolite = ({ model, selected: { Compartment: compartment }, actions }) => {
	const updates = [ ];

	if ( !compartment ) {
		compartment = new Compartment({
			name: Application.defNameExt(model.Compartment, "c", /^c[A-Z]\d*$/i)
		});

		updates.push(new Add(compartment));
	}

	const metabolite = new Metabolite({
		species_id: Application.defNameExt(model.Metabolite, "m", /^m[A-Z]\d*$/i, { propertyName: "species_id" }),
		name: Application.defNameExt(model.Metabolite, "", /^[A-Z]\d*$/i),
		compartmentId: compartment._id || compartment.id
	});

	updates.push(new Add(metabolite));

	actions.batch(updates);
};

export const removeMetabolite = (props, e, { confirm = true } = { }) => {
	const { model, selected: { Metabolite: m }, actions } = props;

	e = e ? e : m;

	if ( confirm ) {
		const message = `Do you wish to delete ${e.name} from all of its associated reactions as well?`;
		const options = {
			okText: "FORCE",
			cancelText: "DELETE",
			onCancel: () => {
				// TODO(metabolic): Subtract Metabolite from Reactions it belongs to...
				actions.onRemove(e);
			}
		}
		actions.onConfirm(message, () => {
			const reactions = Seq(model.ReactionMetabolite)
				.filter(r => `${r.metaboliteId}` == `${e.id}`)
				.map(r => model.Reaction[r.reactionId]);
	
			reactions.forEach(r => removeReaction(props, r, { confirm: false }));
	
			actions.onRemove(e);
		}, options);
	} else {
		actions.onRemove(e);
	}
};

export const MetabolitesViewBuilder = ({
	viewable = false,
	expandedView = false,
	showVisibility = false
} = { }) => {
	const Content = (props) => {
		const { view, model, modelState, persisted, selected: { Compartment: compartment, Metabolite: metabolite }, 
			entities, draggable, actions } = props;
		let { editable } = props;
		editable = editable && !viewable;

		const state = view.getState();
		expandedView = state.expandedView;

		let data = Seq(model.Metabolite);
		
		if (compartment) {
			data = data.filter(m => `${m.compartmentId}` == `${compartment.id}`);
		}

		const getModelState = (metabolite, p) => {
			const key = modelState.getIn(["Metabolite", p]);
			return key.get(metabolite.id, true);
		}

		const editModelState = (metabolite, p, v) => actions.onEditModelState(["Metabolite", p, metabolite], v)
		
		return (
			<Panel {...view} className="bar">
				<Table {...actions}
					onDrag={editable && actions.onDrag.bind(null, draggable)}
					persisted={persisted.Metabolite}
					references={[
						entities.get("Metabolite"),
						entities.get("Compartment"),
						metabolite,
						compartment,
						expandedView,
						modelState.get("Metabolite"),
						modelState.get("recentlySelectedMetabolicEntity")
					]}
					owner={model}
					selected={metabolite}
					onSelect={e => onSelectKBEntity(props, e)}
					data={data}
					creator={() => createMetabolite(props)}
					search="name"
					columns={[
						showVisibility && {
							get: e => getModelState(e, "visibility"),
							title: "Visible",
							format: e => (
								<Checkbox
									value={getModelState(e, "visibility")}
									onEdit={editable && editModelState.bind(null, e, "visibility")}/>
							),
							style: "checkbox visibility"
						},
						{ get: "species_id", label: "ID", 	editable: editable, def: "_species_id" },
						expandedView && { get: "name", label: "Name", editable: editable, def: "_name" },
						{ get: "initial_concentration", label: "Initial Concentration", editable: editable, def: "_initial_concentration"},
					].filter(Boolean)}>
				</Table>
			</Panel>
		);
	}

	const Actions = (props) => {
		const { view, selected: { Metabolite: e } } = props;
		let { editable } = props;
		editable = editable && !viewable;
		const state = view.getState();
		expandedView = state.expandedView;

		return utils.pick({
			compartment: (
				<span>
					<CompartmentControl {...props} editable={editable}/>
				</span>
			),
			add: editable && {
				title: "Create a new Metabolite",
				action: () => createMetabolite(props)
			},
			remove: editable && e != null && {
				title: "Remove selected Metabolite",
				action: () => removeMetabolite(props)
			},
			table: {
				title: "View/Hide Information",
				type: Checkbox,
				value: expandedView,
				style: "icon base-table checkbox",
				onEdit: e => view.setState({ expandedView: e })
			}
		}, editable)
	}

	const persist = Persist(
		{ expandedView: false },
		null,
		null,
		null,
		{ expandedView: false }
	)

	return view(Content, null, Actions, {}, [persist])
}

export default MetabolitesViewBuilder();