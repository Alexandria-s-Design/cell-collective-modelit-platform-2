import React from "react";
import { Seq } from "immutable";

import Application from "../../../application";
import Update from "../../../action/update";
import view from "../../base/view";
import Panel from "../../base/panel";
import Table from "../../base/table";
import Remove from "../../../action/remove";

import ObjectiveFunction from "../../../entity/metabolic/ObjectiveFunction";

const Content = ({ view, model, persisted, selected: { ObjectiveFunction: e },
	entities, editable, actions }) => {

	const data = model.ObjectiveFunction ?
		Seq(model.ObjectiveFunction) : Seq();

	return (
		<Panel {...view} className="bar">
			<Table {...actions}
				persisted={persisted.ObjectiveFunction}
				references={[
					entities.get("ObjectiveFunction"),
					e
				]}
				owner={model}
				selected={e}
				data={data}
				creator={() => new ObjectiveFunction({
					name: Application.defNameExt(model.ObjectiveFunction,
						"",
						/^[A-Z]\d*$/i
					)
				})}
				search="name"
				columns={[
					{
						get: "name",
						label: "Name",
						editable: editable,
						def: "_name"
					}
				]}>
			</Table>
		</Panel>
	);
}

const Actions = (props) => {
	const { editable, selected: { ObjectiveFunction: e }, actions, model } = props;
	const deleteObjFn = objFn => {	
		const updates = [];
		let objectiveFnToRemove;
		const objReactionsIds =  objFn && objFn.reactions ? Object.keys(objFn.reactions) : []
		if(objFn && objFn.reactions && objReactionsIds.length){
			objReactionsIds.forEach(reaction => {
				objectiveFnToRemove = model.ObjectiveReaction[reaction]
				objectiveFnToRemove && updates.push(new Remove(objectiveFnToRemove))
			})
		} 
		updates.push(new Remove(e))
		return updates
	}
	return {
		add: editable && {
			title: "Create a new Objective Function",
			action: null
		},
		remove: editable && e != null && !e.default && {
			title: "Remove selected Objective Function",
			action:( () => actions.batch(deleteObjFn(e)))
		}
	}
}

export default view(Content, null, Actions);