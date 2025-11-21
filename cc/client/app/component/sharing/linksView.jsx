import React from "react";
import { Seq } from "immutable";
import Utils from "../../utils";
import Application from "../../application";
import view from "../base/view";
import Panel from "../base/panel";
import Table from "../base/table";
import CheckboxN from "../base/checkboxN";
import Link from "../../entity/link";

const Content = ({view, model, persisted, entities, selected: { Link: e }, actions}) => {
	const url = `${Application.api}`.replace(/(\/dashboard|\/web)/g,'') + '#';

	const _onAdd = actions.onAdd;
  actions.onAdd = (p1, p2) => {
    _onAdd(p1, p2, function() {
      actions.onSaveModel()
    })
  }
	
	return (
		<Panel {...view} className="bar">
			<Table {...actions}
				onDrag={null}
				persisted={persisted.Link}
				references={[entities.get("Link")]}
				owner={model}
				selected={e}
				data={Seq(model.Link).filterNot(e => e.access)}
				creator={() => new Link({ accessCode: Utils.newGuid() })}
				search="accessCode"
				columns={[
					{ get: "accessCode", format: e => url + e.accessCode, label: "Link", style: "selectable" },
					{ get: "access", format: e => (<CheckboxN/>), title: "Access", style: "checkbox access" }
				]}>
			</Table>
		</Panel>
	);
};

const Actions = ({selected: { Link: e }, editable, actions}) => (editable = editable > 1, {
	add: editable && {
		title: 'Add Shareable Link',
		action: (e) => {
			actions.onAdd(new Link({ accessCode: Utils.newGuid() }))
		},
	},
	remove: editable && e != null && null
});

export default view(Content, null, Actions);