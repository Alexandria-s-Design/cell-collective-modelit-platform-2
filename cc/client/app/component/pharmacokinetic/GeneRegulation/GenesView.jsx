import React from "react";
import { Seq } from "immutable";

import Application from "../../../application";
import view from "../../base/view";
import Panel from "../../base/panel";
import Table from "../../base/table";
import Checkbox from "../../base/checkbox";
import utils from "../../../utils";
import Add from "../../../action/add";
import Update from "../../../action/update";

import Gene from "../../../entity/metabolic/Gene";
import ExperimentMutation from "../../../entity/ExperimentMutation";
import { onSelectKBEntity } from "../Model/MetabolitesView";

/*const getReactions = g => {
	const reactionIds = Seq(model.Regulator)
		.filter(r => r.geneId == g.id)
		.map(r => r.reactionId)

	const reactions = Seq(model.Reaction)
		.filter(r => reactionIds.includes(r.id))

	return reactions;
}
*/

const createGene = ({ model, actions }, e) => {
	const updates = [ ];

	const gene = new Gene({
		speciesId: Application.defNameExt(model.Gene, "g", /^m[A-Z]\d*$/i, { propertyName: "speciesId" }),
		name: Application.defNameExt(model.Gene, "", /^[A-Z]\d*$/i)
	});

	updates.push(new Add(gene));

	actions.batch(updates);
};

export const knockOutGene = ({ selected: { Gene: g }, actions }, e) => {
	e = e ? e : g;

	const updates = [ ];

	updates.push(new Update(e, "functional", false));

//	const reactions = getReactions(e);

	// TODO(metabolic): Knock Out reactions...

	actions.batch(updates);
}

export const removeGene = ({ selected: { Gene: g }, actions }, e) => {
	e = e ? e : g;
	actions.onRemove(e);
}

export const GenesViewBuilder = ({
	viewable = false,
	geneControl = false,
	showActions = true,
	geneExpressions = false,
} = { }) => {
	const Content = (props) => {
			const { view, model, persisted, selected: { Gene: e, 
				Experiment: experiment },
				entities, draggable, actions } = props;
			let { editable } = props;
			editable = editable && !viewable;

			let getKnockOut, editKnockOut, getExpressionValue, editExpressionValue;

			if ( geneControl || geneExpressions ) {
				if ( experiment ) {
					const experimentId = experiment.id;

					let e = null;

					if ( geneControl ) {
						getKnockOut	= g => ((e = g.experimentMutations) && (e = Seq(e).find(o => o.parent && o.parent.id == experimentId))
							&& e.state)
	
						editKnockOut = ((g, knockOut) => {
							let e = g.experimentMutations;
							e && (e = Seq(e).find(o => o.parent && o.parent.id == experimentId)) ?
								knockOut ? actions.onEdit(e, "state", knockOut) : actions.onRemove(e)
								:
								actions.onAdd(new ExperimentMutation({
									parent: experiment,
									gene: g,
									state: knockOut
								}))
						});
					}

					if ( geneExpressions ) {
						getExpressionValue = g => ((e = g.experimentMutations) && (e = Seq(e).find(o => o.parent && o.parent.id == experimentId))
							&& e.expressionState)
	
						editExpressionValue = ((g, value) => {
							let e = g.experimentMutations;
							e && (e = Seq(e).find(o => o.parent && o.parent.id == experimentId)) ?
								value ? actions.onEdit(e, "expressionState", value) : actions.onRemove(e)
								:
								actions.onAdd(new ExperimentMutation({
									parent: experiment,
									gene: g,
									expressionState: value
								}))
						});
					}
				}
			}
			
			return (
				<Panel {...view} className="bar">
					<Table {...actions}
						onDrag={editable && actions.onDrag.bind(null, draggable)}
						persisted={persisted.Gene}
						references={[
							entities.get("Gene"),
							(geneControl || geneExpressions) && experiment,
							(geneControl || geneExpressions) && entities.get("ExperimentMutation"),
						]}
						owner={model}
						selected={e}
						onSelect={e => onSelectKBEntity(props, e)}
						data={Seq(model.Gene)}
						creator={() => new Gene({
							name: Application.defNameExt(model.Gene, "g", /g^[A-Z]\d*$/i)
						})}
						search="speciesId"
						columns={[
							{ get: "speciesId", label: "ID", editable: editable, def: "_species_id" },
							{
								get: "name", label: "Name", editable: editable, def: "_name"
							},
							geneControl && {
								get: getKnockOut,
								title: "Knock Out",
								style: "metabolic-mutation checkbox",
								format: e => (
									<Checkbox
										value={getKnockOut ? getKnockOut(e) : false}
										onEdit={editKnockOut && editKnockOut.bind(null, e)}/>
								),
								def: "_knock_out"
							},
							geneExpressions && {
								get: getExpressionValue,
								title: "Expression",
								style: "checkbox mutation",
								format: e => (
									<Checkbox
										value={getExpressionValue ? getExpressionValue(e) : false}
										onEdit={editExpressionValue && editExpressionValue.bind(null, e)}/>
								),
								def: "_expressions"
							}
						].filter(Boolean)}>
					</Table>
				</Panel>
			);
		}
	
	const Actions = (props) => {
		const { selected: { Gene: e } } = props;
		let { editable } = props;
		editable = editable && !viewable && showActions;

		return utils.pick({
			add: !geneControl && editable && {
				title: "Create a new Gene",
				action: (() => createGene(props))
			},
			remove: !geneControl && editable && e != null && {
				title: "Remove selected Gene(s)",
				action: (() => removeGene(props))
			}
		}, !geneControl && editable)
	}
	
	return view(Content, null, Actions);
};

export default GenesViewBuilder();