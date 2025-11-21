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
import Update from "../../../action/update";
import Options from "../../base/options";

import Metabolite from "../../../entity/kinetic/Metabolite";
import { removeReaction } from "./ReactionsView";

export const onSelectKBEntity = ({ actions }, e) => {
	actions.onSelect(e);
};


export const createSpecies = ({ model, selected: { Compartment: compartment }, actions }) => {

	const updates = [];

	const metabolite = new Metabolite({
		species_id:  Application.defNameExt(model.Metabolite, "", /^[A-Z]\d*$/i),
		name:  Application.defNameExt(model.Metabolite, "", /^[A-Z]\d*$/i),
		compartment: compartment,
		unitDefinition: model.UnitDefinition[1]
	});

	updates.push(new Add(metabolite));

	actions.batch(updates);
};

export const removeMetabolite = (props) => {
	const { model, selected: { Metabolite: e, Reaction: reaction }, actions } = props;

	const message = `Do you wish to delete ${e.name} from all of its associated reactions as well?`;

	const options = {
		okText: "FORCE",
		cancelText: "DELETE",
		onCancel: () => {
			// TODO(metabolic): Subtract Metabolite from Reactions it belongs to...

			if (reaction) {
				let reactants = [...reaction.reactants];
				let products = [...reaction.products];
	
				const updates = [];
	
				if (reactants.length > 0) {
					reactants = reactants.filter(item => item !== e.id)
					updates.push(new Update(reaction, "reactants", reactants));
				}
	
				if (products.length > 0) {
					products = products.filter(item => item !== e.id)
					updates.push(new Update(reaction, "products", products));
				}
	
				actions.batch(updates);
	
			}

			actions.onRemove(e);
		}
	}
	
	actions.onConfirm(message, () => {
		const reactions = Seq(model.ReactionMetabolite)
			.filter(r => `${r.metaboliteId}` == `${e.id}`)
			.map(r => model.Reaction[r.reactionId]);

		reactions.forEach(r => removeReaction(props, r, { confirm: false }));

		actions.onRemove(e);

		if (reaction) {
			let reactants = [...reaction.reactants];
			let products = [...reaction.products];
			const updates = [];
	
			if (reactants.length > 0) {
				reactants = reactants.filter(item => item !== e.id)
				updates.push(new Update(reaction, "reactants", reactants));
			}
	
			if (products.length > 0) {
				products = products.filter(item => item !== e.id)
				updates.push(new Update(reaction, "products", products));
			}
	
			actions.batch(updates);
		}

	}, options);
};

export const SpeciesViewBuilder = ({
	viewable = false,
	expandedView = false,
	showVisibility = false
} = {}) => {
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

		const units = Seq(model.UnitDefinition).filter(u => u.name.match(/(molar|mmol\/L)$/));

		const getUnitDefinition = (unitDefinitionId) => {
			return units.find(u => `${u.id}` == `${unitDefinitionId}`);
		}

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
					onClick={e => onSelectKBEntity(props, e)}
					data={data}
					creator={() => createSpecies(props)}
					search="species_id"
					columns={[
						showVisibility && {
							get: e => getModelState(e, "visibility"),
							title: "Visible",
							format: e => (
								<Checkbox
									value={getModelState(e, "visibility")}
									onEdit={editable && editModelState.bind(null, e, "visibility")} />
							),
							style: "checkbox visibility"
						},
						{ get: "species_id", label: "ID", editable: editable, def: "_species_id" },
						expandedView && { get: "name", label: "Name", editable: true, def: "_name" },
						{ get: "initial_concentration", label: "Initial Concentration", editable: true, def: "_initial_concentration" },
						{ get: "unitDefinitionId", label: "Unit", format: e => <Options dropdowIcon="icon-inheritb-bg" options={units} def={e.unitDefinition || getUnitDefinition(e.unitDefinitionId)} value={e.unitDefinition} onChange={u => actions.onEdit(e, "unitDefinition", u)} /> },
					].filter(Boolean)}>
				</Table>
			</Panel>
		);
	}

	const Actions = (props) => {
		const { view, selected: { Metabolite: e, Compartment: compartment } } = props;
		let { editable } = props;
		editable = editable && !viewable;
		const state = view.getState();
		expandedView = state.expandedView;

		return {
			compartment: (
				<span>
					<CompartmentControl
						{...props}
						editable={editable}
						panel="species" />
					Species:
				</span>
			),
			add: compartment && editable && {
				title: "Create a new Metabolite",
				action: () => createSpecies(props)
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
		}
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

export default SpeciesViewBuilder();