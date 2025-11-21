import React from "react";
import { Seq } from "immutable";
import Utils from "../../utils";
import Application from "../../application";
import view from "../base/view";
import Panel from "../base/panel";
import Table from "../base/table";
import CheckboxN from "../base/checkboxN";
import Sharing from "../../entity/sharing";

const Content = ({view, model, persisted, entities, selected: { Sharing: e }, users, editable, actions, user}) => {
	editable = editable > 1;

	let ownerEmail = model.user && model.user.email;
	if (!ownerEmail && model.userId === user.id) {
		ownerEmail = user.email;
	}
	const owner  = Seq([{ email: `${ownerEmail} (Owner)`, access: 2, isOwner: true }])
	const others = Seq(model.Sharing);
	const data   = owner.concat(others).toIndexedSeq();
	
	return (
		<Panel {...view} className="bar">
			<Table {...actions}
				onDrag={null}
				persisted={persisted.Sharing}
				references={[entities.get("Sharing")]}
				owner={model}
				selected={e}
				data={data}
				creator={() => new Sharing({ access: 0 })}
				search="email"
				columns={[
					{ get: "email", label: "Email", editable: editable, values: Seq(users).map(e => e.email).filter(e => e).valueSeq() },
					{ get: "access", format: e => (<CheckboxN value={e.access} title={Content.access[e.access]} onEdit={editable && !e.isOwner && actions.onEdit.bind(null, e, "access")}/>), title: "Access", style: "checkbox access" }
				]}>
			</Table>
		</Panel>
	);
};

Content.access = Seq(Application.values.Sharing.access.to).map(e => Utils.capitalize(e.toLowerCase())).toObject();

const Actions = ({selected: { Sharing: e }, editable, actions}) => (editable = editable > 1, {
	add: editable && {
		title: 'Create new Sharing Collaborator',
		action: () => actions.onAdd(new Sharing({ access: 0 }))
	},
	remove: editable && e != null && {
		title: "Remove selected Sharing Collaborator",
		action: () => actions.onRemove(e)
	}
});

export default view(Content, null, Actions);