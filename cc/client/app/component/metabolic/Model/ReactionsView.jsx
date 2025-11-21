import React from "react";
import { Seq, Map } from "immutable";

import Application from "../../../application";
import view from "../../base/view";

import Panel from "../../base/panel";
import Table from "../../base/table";
import Checkbox from "../../base/checkbox";
import RangeInput from "../../base/rangeInput";
import SubSystemControl from "./SubSystemControl";
import BoundaryControl from "./BoundaryControl";
import EnvironmentControl from "../../analysis/environmentControl";
import Persist from "../../../mixin/persist";

import Environment from "../../../entity/Environment";
import Reaction from "../../../entity/metabolic/Reaction";

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
			if ( orphans ) {
				removeOrphans();
			}
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

const getMinimumLowerBound = reactions => Math.min.apply(Reaction.DEFAULT_LOWER_BOUND,
	Seq(reactions).map(e => (Number.isInteger(e.lowerBound) ? e.lowerBound : Reaction.DEFAULT_LOWER_BOUND)).toArray()
);
const getMaximumUpperBound = reactions => Math.max.apply(Reaction.DEFAULT_UPPER_BOUND,
	Seq(reactions).map(e => (Number.isInteger(e.upperBound) ? e.upperBound : Reaction.DEFAULT_UPPER_BOUND)).toArray()
);
// const getMinimumLowerBound = () => Reaction.DEFAULT_LOWER_BOUND;
// const getMaximumUpperBound = () => Reaction.DEFAULT_UPPER_BOUND;

export const createReaction = ({ model, selected: { SubSystem: subsystem }, actions }) => {
	const reactions = filterReactions(model.Reaction, subsystem);
	console.log("reactions", model.Reaction);
	const minimumLowerBound = getMinimumLowerBound(reactions)
	const maximumUpperBound = getMaximumUpperBound(reactions);
	
	const reaction = new Reaction({
		name: Application.defNameExt(model.Reaction, "", /^[A-Z]\d*$/i),
		reactionId: Application.defNameExt(model.Reaction, "r", /^r[A-Z]\d*$/i, { propertyName: "reactionId" }),
		subsystem: 	subsystem && subsystem.id,
		lowerBound: minimumLowerBound,
		upperBound: maximumUpperBound,
	});

	actions.onAdd(reaction, true);
}

export const ReactionsViewBuilder = ({
	viewableSubSystems = false,
	viewable = false,
	showBounds = true,
	showVisibility = true,
	fluxControl = false,
	showFluxValue = false,
	showFVA = false,
	showObjectiveValue = false,
	showObjectiveCoefficient = true,
	isDraggable = false,
	expandedView = false,
	showAdd = true,
	showRemove = true,
	showCore = false
} = { }) => {
	const Content = (props) => {
		const { view, entities, model, persisted,
			selected: { Experiment: experiment, Environment: environment,
			Reaction: reaction, SubSystem: subsystem },
			actions, draggable, modelState } = props;
		let { editable } = props;
		window._props = props;

		expandedView 		= view.getState().expandedView;
		editable				= editable && !viewable;
		
		const reactions = filterReactions(model.Reaction, subsystem);
		
		const minimumLowerBound = getMinimumLowerBound(reactions)
		const maximumUpperBound = getMaximumUpperBound(reactions);
		
		let editBounds, getLowerBound, getUpperBound, activity,
			editKnockOut, getKnockedOut, getCoreReaction, editCoreReaction;

		getLowerBound = e => (e.lowerBound == null ? Reaction.DEFAULT_LOWER_BOUND : e.lowerBound);
		getUpperBound = e => (e.upperBound == null ? Reaction.DEFAULT_UPPER_BOUND : e.upperBound);

		editBounds 					= ((e, p, v) => actions.onEdit(e, p === "min" ? "lowerBound" : "upperBound", v));
		
		const isKnockedOut	= (l, u) => l === 0 && u === 0;
		getKnockedOut 		= e => isKnockedOut(e.lowerBound, e.upperBound);

		const getModelState = (e, p) => {
			const key = modelState.getIn(["Reaction", p]);
			return key.get(e.id, true);
		}
	
		const editModelState = (e, p, v) => actions.onEditModelState(["Reaction", p, e], v)

		if ( fluxControl ) {
			if ( environment ) {
				if ( experiment ) {
					activity = entities.get("ExperimentActivity");
					const environmentId = environment.id;

					let x;

					getLowerBound = r => (isFunctional(props, r) ? ((x = r.experimentActivities) && (x = Seq(x).find(o => o.parent && o.parent.id == environmentId))
						? x.min : r.lowerBound) : 0);
					getUpperBound = r => (isFunctional(props, r) ? ((x = r.experimentActivities) && (x = Seq(x).find(o => o.parent && o.parent.id == environmentId))
						? x.max : r.upperBound) : 0);
					getKnockedOut	= r => ((x = r.experimentActivities) && (x = Seq(x).find(o => o.parent && o.parent.id == environmentId))
						? isKnockedOut(x.min, x.max) : isKnockedOut(r.lowerBound, r.upperBound))

					editBounds = ((r, p, v) => {
						let e = r.experimentActivities;
						e && (e = Seq(e).find(o => o.parent && o.parent.id == environmentId)) ? actions.onEdit(e, p, v)
						:
						(e = {
								parent: environment,
								reaction: r,
								min: r.lowerBound,
								max: r.upperBound,
								experiment: undefined
							},
							e[p] = v,
							actions.onAdd(new ExperimentActivity(e))
						)
					});

					editKnockOut = ((r, knockOut) => {
						let e = r.experimentActivities;
						e && (e = Seq(e).find(o => o.parent && o.parent.id == environmentId)) ?
						actions.batch([
							new Update(e, "min", knockOut ? 0 : r.lowerBound),
							new Update(e, "max", knockOut ? 0 : r.upperBound)
						])
						:
						(e = {
								parent: environment,
								reaction: r,
								min: knockOut ? 0 : r.lowerBound,
								max: knockOut ? 0 : r.upperBound,
								experiment: undefined
							},
							actions.onAdd(new ExperimentActivity(e))
						)
					});
				}
			} else {

				// No environment has been created.
				editBounds = ((r, p, v) => {
					const environments = model.Environment ? Seq(model.Environment) : Seq();
					const environment  = new Environment({
						name: Application.defName(environments, "New Env ")
					});
					actions.batch(Seq([new Add(environment, true)]));
	
					activity = entities.get("ExperimentActivity");
					const environmentId = environment.id;
					let x;
					getLowerBound = r => (isFunctional(props, r) ? ((x = r.experimentActivities) && (x = Seq(x).find(o => o.parent && o.parent.id == environmentId))
						? x.min : r.lowerBound) : 0);
					getUpperBound = r => (isFunctional(props, r) ? ((x = r.experimentActivities) && (x = Seq(x).find(o => o.parent && o.parent.id == environmentId))
						? x.max : r.upperBound) : 0);
					getKnockedOut	= r => ((x = r.experimentActivities) && (x = Seq(x).find(o => o.parent && o.parent.id == environmentId))
						? isKnockedOut(x.min, x.max) : isKnockedOut(r.lowerBound, r.upperBound));

					let e = r.experimentActivities;
					e && (e = Seq(e).find(o => o.parent && o.parent.id == environmentId)) ? actions.onEdit(e, p, v)
						:
						(e = {
							parent: environment,
							reaction: r,
							min: r.lowerBound,
							max: r.upperBound,
							experiment: undefined
						}),
						actions.onAdd(new ExperimentActivity(e))
				});
			}
		}

		const getFluxValue = (r, experimentType, dataKey) => {
			let value = null;
			
			if ( experiment ) {
				const experimentId = experiment.id;

				let dataValues = modelState.getIn([
					"Experiment",
					experimentType,
					experimentId,
					"data",
					dataKey
				]);
				dataValues		 = new Map(dataValues)
				
				if ( dataValues ) {
					value = dataValues.get(r.id);
				}
			}

			return value;
		}

		const getObjectiveValue = () => {
			let objectiveValue = null;

			if ( experiment ) {
				objectiveValue = modelState.getIn([
					"Experiment",
					"fba",
					experiment.id,
					"data",
					"objectiveValue"
				]);
			}

			return objectiveValue;
		}

		return (
			<Panel {...view} className={`bar ${(showObjectiveValue ? "resultHeader" : '')}`}>
				{showObjectiveValue && (
					<dl>
						<dt>Objective Value: </dt>
						<dd>{getObjectiveValue()}</dd>
					</dl>
				)}
				<Table {...actions} top="10%"
					onDrag={(editable || isDraggable) && actions.onDrag.bind(null, draggable)}
					persisted={persisted.Reaction}
					references={[
						entities.get("Reaction"),
						entities.get("SubSystem"),
						entities.get("Experiment"),
						subsystem,
						reaction,
						experiment,
						activity,
						environment,
						expandedView,
						modelState.get("Reaction"),
						modelState.getIn(["Experiment", "fba"]),
						modelState.getIn(["Experiment", "fva"]),
						showCore && entities.get("Experiment")
					]}
					owner={model}
					selected={reaction}
					onSelect={e => onSelectKBEntity(props, e)}
					data={reactions}
					creator={() => createReaction(props)}
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
						expandedView && {
							get: "reactionId", label: "ID", editable: editable, def: "_reaction_id"
						},
						{
							get: "name", label: "Name", editable: editable, def: "_name"
						},
						expandedView && { label: "Boundary",
							format: e => <BoundaryControl key={e.id} e={e} {...props} />
						},
						(showBounds || fluxControl) && {
							get: e => getUpperBound(e) - getLowerBound(e), // TODO (Metabolic): What is to be done here?
							format: e => (
								<RangeInput
									min={minimumLowerBound} // TODO (Metabolic): Round up to the nearest tenth?
									max={maximumUpperBound} // TODO (Metabolic): Round up to the nearest tenth?
									// minDef={e._lower_bound}
									// maxDef={e._upper_bound}
									value={{
										min: getLowerBound(e),
										max: getUpperBound(e)
									}}
									onEdit={editBounds && editBounds.bind(null, e)}/>
							),
							label: fluxControl ? "Flux Range" : "Bounds",
							style: "activity range"
						},
						fluxControl && {
							get: "knockedOut",
							title: "Knock Out",
							style: "metabolic-mutation_flux_control checkbox",
							format: e => (
								<Checkbox
									value={getKnockedOut(e)}
									onEdit={editKnockOut && editKnockOut.bind(null, e)}/>
							),
						},
						showFluxValue && {
							get: e => getFluxValue(e, "fba", "fluxes"), label: "Flux Value", editable: editable
						},
						showFVA && {
							get: e => getFluxValue(e, "fva", "minimumFlux"),
							label: "Minimum"
						},
						showFVA && {
							get: e => getFluxValue(e, "fva", "maximumFlux"),
							label: "Maximum"
						},
						showCore && {
							get: getCoreReaction,
							title: "Core Reactions",
							style: "metabolic-mutation_core_reactions checkbox",
							format: e => (
								<Checkbox
									value={getCoreReaction && getCoreReaction(e)}
									onEdit={editCoreReaction && editCoreReaction.bind(null, e)}/>
							)
						},
						expandedView && showObjectiveCoefficient && {
							get: "objectiveCoefficient",
							label: "Objective Coefficient",
							editable: editable,
							style: "number checkbox"
						}
					].filter(Boolean)}>
				</Table>
			</Panel>
		);
	}
	
	const Actions = (props) => {
		let { view, model, editable, selected: { Reaction: e, SubSystem: subsystem }, actions } = props;
		editable = editable && !viewable;
		const state = view.getState();
		expandedView = state.expandedView;
	
		return utils.pick({
			subsystem: (
				<span>
					<SubSystemControl {...props} editable={!viewableSubSystems && editable}/>
				</span>
			),
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

	return view(Content, null, Actions, {}, [persist],undefined, undefined, 25);
}

export default ReactionsViewBuilder();