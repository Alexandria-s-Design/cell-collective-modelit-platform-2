import React from "react";
import { Seq } from "immutable";
import { FormattedMessage } from "react-intl";
import view from "../../base/view";
import Panel from "../../base/panel";
import Table from "../../base/table";
import Add from "../../../action/add";
import Update from "../../../action/update";
import Droppable from "../../base/droppable";
import Application from "../../../application";

import Reaction from "../../../entity/metabolic/Reaction";
import ObjectiveFunction from "../../../entity/metabolic/ObjectiveFunction";
import ObjectiveReaction from "../../../entity/metabolic/ObjectiveReaction";

const addReaction = ({ model, dragging, actions,
	selected: { ObjectiveFunction: eOF } }) => {
	let updates = [ ];

	if ( !eOF ) {
		eOF = new ObjectiveFunction({
			name: Application.defNameExt(model.ObjectiveFunction, "", /^[A-Z]\d*$/i)
		});
		updates.push(new Add(eOF));
	}

	const reaction = dragging.reaction || dragging;
	const reactions = Seq(Object.keys(eOF.reactions))
		.map(id => model.ObjectiveReaction[id])
		.map(or => or.reactionId)
		.toArray()
	if ( !reactions.includes(reaction.id) ) {
		const eObjectiveReaction = new ObjectiveReaction({
			objectiveFunction: eOF,
			reaction: reaction,
		});

		updates = updates.concat([
			new Add(eObjectiveReaction),
			new Update(
				eOF,
				"reactions",
				{ ...(eOF.reactions || { }), [eObjectiveReaction.id]: eObjectiveReaction.coefficient }
			)
		])

		actions.batch(updates);
	}
}

const Content = (props) => {
	const { view, model, persisted,	
		selected: { ObjectiveReaction: e, ObjectiveFunction: eOF },
		entities, editable, actions, dragging } = props;

	let data = Seq(model.ObjectiveReaction);

	if ( eOF ) {
		data = data.filter(o => `${o.objectiveFunctionId}` == `${eOF.id}`);
	}
	
	const getReaction = e => {
		e = model.Reaction[e.reactionId] 
		return e.name || e.reactionId || e.id
	}

	return (
		<Panel {...view} className="bar">
			{!dragging && data.count() ? (
				<Table {...actions}
					persisted={persisted.ObjectiveReaction}
					references={[
						entities.get("ObjectiveFunction"),
						entities.get("ObjectiveReaction"),
						eOF
					]}
					owner={model}
					selected={e}
					data={data}
					search="name"
					columns={[
						{
							get: getReaction,
							label: "Reaction",
							editable: editable,
							def: "_reaction"
						},
						{ get: "coefficient", label: "Coefficient", editable: editable, def: "_coefficient" }
					].filter(Boolean)}>
				</Table>
			)
			:
			(
				<Droppable onDrop={( (dragging && Object.getPrototypeOf(dragging).constructor.name === "Reaction")) && (() => addReaction(props))}>
					<div className="panel-instruction">
						<div>
							<FormattedMessage id="ModelDashBoard.AnalysisObjectiveFunctionBuilderView.LabelInstruction" defaultMessage="Drop Reaction Here"/>
						</div>
					</div>
				</Droppable>
			)}
		</Panel>
	);
}

const Header = (props) => {
	const { selected: { ObjectiveFunction: e }, dragging, title } = props;
	return dragging instanceof Reaction && e && e.reactions && Seq(e.reactions).count() ?
		(
			<Droppable onDrop={() => addReaction(props)}>
				<FormattedMessage
					id="ReactionsCoefficientsView.DropReaction.DropReactionText"
					defaultMessage="Drop Reaction"/>
			</Droppable>
		)
		:
		title(e, "Objective Function Builder");
}

const Actions = ({ editable, actions, selected: { ObjectiveFunction: eOF, ObjectiveReaction: e } }) => {

return {
		remove: editable && e !== null && eOF && !eOF.default && {
		title: "Remove an Objective Reaction",
		action:  (e && eOF  ? () => delete eOF.reactions[e.id] && actions.onRemove(e) : null)
	}}
}

export default view(Content, Header, Actions);