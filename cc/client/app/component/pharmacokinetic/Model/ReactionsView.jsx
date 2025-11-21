import React from "react";
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
import Add from "../../../action/add";
import ExperimentActivity from "../../../entity/ExperimentActivity";
import Update from "../../../action/update";
import { removeMetabolite } from "./MetabolitesView";
import { getGenes } from "./ReactionView";
import { removeGene } from "../GeneRegulation/GenesView";
import { onSelectKBEntity } from "./MetabolitesView"

const getMetabolites = (metabolites, e) => {
	metabolites = metabolites ?
		Map(Seq(metabolites).reduce((prev, next) => ({...prev, [next.id]: next }), { })) : Map();

	metabolites = Object.keys(e.metabolites)
		.map(id => metabolites.get(id));

	return Seq(metabolites)
}

const getKnockedOutGenes = ({ model, selected: { Experiment: experiment, Reaction: e } }, r) => {
	let genes = [];
	
	e = e ? e : r;

	if ( experiment && experiment.mutations ) {
		genes = Seq(experiment.mutations)
			.filter(m => m.state)
			.map(m => model.Gene[m.geneId])
			.toArray();
	}

	return genes;
}


export const isFunctional = (props, r) => {
	const { selected: { Experiment: experiment } } = props;
	let { selected: { Reaction: e } } = props;
	
	e = e ? e : r;
	// Let's assume that the genes associated are from the gene control.
	const genes = getKnockedOutGenes(props, e);
	
	// if ( Seq(genes).count() ) {
	// 	const geneReactionRule = getGeneReactionRule(props, r);
	// }

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

export const removeReaction = (props, e, { model = null, confirm = true, orphans = false } = { }) => {
	const { selected: { Reaction: r }, actions } = props;
	model = model || props.model;

	e = e ? e : r;

	const removeOrphans = () => {
		// Remove Metabolites from Reaction...
		const metabolites = getMetabolites(model.Metabolite, e);
		metabolites.forEach(m => m && removeMetabolite(props, m, { confirm: false }));

		// Remove Genes from Reaction...
		const genes = getGenes(props, e);
		genes.forEach(g => g && removeGene(props, g));
	}

	if ( confirm ) {
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
		if ( orphans ) {
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

	actions.onAdd(reaction, true);
}

export const ReactionsViewBuilder = ({
	viewable = false,
	showVisibility = true,
	fluxControl = false,
	// showFluxValue = false,
	// showFVA = false,
	// showObjectiveValue = false,
	isDraggable = false,
	expandedView = false,
	showAdd = true,
	showRemove = true,
	// showCore = false
} = { }) => {
	const Content = (props) => {
		const { view, entities, model, persisted,
			selected: { Experiment: experiment, Environment: environment,
			Reaction: reaction },
			actions, draggable, modelState } = props;
		let { editable } = props;
		editable = editable && !viewable;

		// window._props = props;

		const state = view.getState();
		expandedView = state.expandedView;
		
		let data = Seq(model.Reaction);

		const getModelState = (reaction, p) => {
			const key = modelState.getIn(["Reaction", p]);
			return key.get(reaction.id, true);
		}
	
		const editModelState = (reaction, p, v) => actions.onEditModelState(["Reaction", p, reaction], v)

		// if ( fluxControl ) {
		// 	if ( environment ) {
		// 		if ( experiment ) {
		// 			activity = entities.get("ExperimentActivity");
		// 			const environmentId = environment.id;

		// 			let x;

		// 			getLowerBound = r => (isFunctional(props, r) ? ((x = r.experimentActivities) && (x = Seq(x).find(o => o.parent && o.parent.id == environmentId))
		// 				? x.min : r.lowerBound) : 0);
		// 			getUpperBound = r => (isFunctional(props, r) ? ((x = r.experimentActivities) && (x = Seq(x).find(o => o.parent && o.parent.id == environmentId))
		// 				? x.max : r.upperBound) : 0);
		// 			getKnockedOut	= r => ((x = r.experimentActivities) && (x = Seq(x).find(o => o.parent && o.parent.id == environmentId))
		// 				? isKnockedOut(x.min, x.max) : isKnockedOut(r.lowerBound, r.upperBound))

		// 			editBounds = ((r, p, v) => {
		// 				let e = r.experimentActivities;
		// 				e && (e = Seq(e).find(o => o.parent && o.parent.id == environmentId)) ? actions.onEdit(e, p, v)
		// 				:
		// 				(e = {
		// 						parent: environment,
		// 						reaction: r,
		// 						min: r.lowerBound,
		// 						max: r.upperBound,
		// 						experiment: undefined
		// 					},
		// 					e[p] = v,
		// 					actions.onAdd(new ExperimentActivity(e))
		// 				)
		// 			});

		// 			editKnockOut = ((r, knockOut) => {
		// 				let e = r.experimentActivities;
		// 				e && (e = Seq(e).find(o => o.parent && o.parent.id == environmentId)) ?
		// 				actions.batch([
		// 					new Update(e, "min", knockOut ? 0 : r.lowerBound),
		// 					new Update(e, "max", knockOut ? 0 : r.upperBound)
		// 				])
		// 				:
		// 				(e = {
		// 						parent: environment,
		// 						reaction: r,
		// 						min: knockOut ? 0 : r.lowerBound,
		// 						max: knockOut ? 0 : r.upperBound,
		// 						experiment: undefined
		// 					},
		// 					actions.onAdd(new ExperimentActivity(e))
		// 				)
		// 			});
		// 		}
		// 	} else {

		// 		// No environment has been created.
		// 		editBounds = ((r, p, v) => {
		// 			const environments = model.Environment ? Seq(model.Environment) : Seq();
		// 			const environment  = new Environment({
		// 				name: Application.defName(environments, "New Env ")
		// 			});
		// 			actions.batch(Seq([new Add(environment, true)]));
	
		// 			activity = entities.get("ExperimentActivity");
		// 			const environmentId = environment.id;
		// 			let x;
		// 			getLowerBound = r => (isFunctional(props, r) ? ((x = r.experimentActivities) && (x = Seq(x).find(o => o.parent && o.parent.id == environmentId))
		// 				? x.min : r.lowerBound) : 0);
		// 			getUpperBound = r => (isFunctional(props, r) ? ((x = r.experimentActivities) && (x = Seq(x).find(o => o.parent && o.parent.id == environmentId))
		// 				? x.max : r.upperBound) : 0);
		// 			getKnockedOut	= r => ((x = r.experimentActivities) && (x = Seq(x).find(o => o.parent && o.parent.id == environmentId))
		// 				? isKnockedOut(x.min, x.max) : isKnockedOut(r.lowerBound, r.upperBound));

		// 			let e = r.experimentActivities;
		// 			e && (e = Seq(e).find(o => o.parent && o.parent.id == environmentId)) ? actions.onEdit(e, p, v)
		// 				:
		// 				(e = {
		// 					parent: environment,
		// 					reaction: r,
		// 					min: r.lowerBound,
		// 					max: r.upperBound,
		// 					experiment: undefined
		// 				}),
		// 				actions.onAdd(new ExperimentActivity(e))
		// 		});
		// 	}
		// }

		// const getFluxValue = (r, experimentType, dataKey) => {
		// 	let value = null;
			
		// 	if ( experiment ) {
		// 		const experimentId = experiment.id;

		// 		let dataValues = modelState.getIn([
		// 			"Experiment",
		// 			experimentType,
		// 			experimentId,
		// 			"data",
		// 			dataKey
		// 		]);
		// 		dataValues		 = new Map(dataValues)
				
		// 		if ( dataValues ) {
		// 			value = dataValues.get(r.id);
		// 		}
		// 	}

		// 	return value;
		// }

		// const getObjectiveValue = () => {
		// 	let objectiveValue = null;

		// 	if ( experiment ) {
		// 		objectiveValue = modelState.getIn([
		// 			"Experiment",
		// 			"fba",
		// 			experiment.id,
		// 			"data",
		// 			"objectiveValue"
		// 		]);
		// 	}

		// 	return objectiveValue;
		// }

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
						// modelState.getIn(["Experiment", "fba"]),
						// modelState.getIn(["Experiment", "fva"]),
						// showCore && entities.get("Experiment")
					]}
					owner={model}
					selected={reaction}
					onSelect={e => onSelectKBEntity(props, e)}
					data={data}
					creator={() => createReaction(props)}
					search="name"
					columns={[
						// showVisibility && {
						// 	get: e => getModelState(e, "visibility"),
						// 	title: "Visible",
						// 	format: e => (
						// 		<Checkbox
						// 			value={getModelState(e, "visibility")}
						// 			onEdit={editable && editModelState.bind(null, e, "visibility")}/>
						// 	),
						// 	style: "checkbox visibility"
						// },
						expandedView && {
							get: "reaction_id", label: "ID", editable: editable, def: "_reaction_id"
						},
						{
							get: "name", label: "Name", editable: editable, def: "_name"
						},
						// fluxControl && {
						// 	get: "knockedOut",
						// 	title: "Knock Out",
						// 	style: "metabolic-mutation checkbox",
						// 	format: e => (
						// 		<Checkbox
						// 			value={getKnockedOut(e)}
						// 			onEdit={editKnockOut && editKnockOut.bind(null, e)}/>
						// 	),
						// },
						// showFluxValue && {
						// 	get: e => getFluxValue(e, "fba", "fluxes"), label: "Flux Value", editable: editable
						// },
						// showFVA && {
						// 	get: e => getFluxValue(e, "fva", "minimumFlux"),
						// 	label: "Minimum"
						// },
						// showFVA && {
						// 	get: e => getFluxValue(e, "fva", "maximumFlux"),
						// 	label: "Maximum"
						// },
						// showCore && {
						// 	get: getCoreReaction,
						// 	title: "Core Reactions",
						// 	style: "metabolic-mutation checkbox",
						// 	format: e => (
						// 		<Checkbox
						// 			value={getCoreReaction && getCoreReaction(e)}
						// 			onEdit={editCoreReaction && editCoreReaction.bind(null, e)}/>
						// 	)
						// }
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
			remove: showRemove && editable && e !== null && {
				title: "Remove selected Reaction", // TODO (Metabolic): Translate
				action: (() => removeReaction(props, e))
			},
			environment: fluxControl && (
				<span>
					<EnvironmentControl {...props} editable={true}/>
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