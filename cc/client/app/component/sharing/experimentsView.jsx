import React from "react";
import { Seq } from "immutable";
import view from "../base/view";
import Panel from "../base/panel";
import Table from "../base/table";
import Checkbox from "../base/checkbox";

export default view(({view, model, entities, editable, actions}) => (
	<Panel {...view} className="bar">
		<Table
			references={[entities.get("Experiment")]}
			owner={model}
			data={Seq(model.Experiment).filterNot(e => e.userId)}
			search="name"
			columns={[
				{ get: "name", label: "Name", editable: true, def: "_name" },
				{ get: "created", format: e => e.created.toLocaleDateString(), label: "Created", style: "date", minWidth: 250 },
				{ get: "isPublic", format: e => (<Checkbox value={e.isPublic} onEdit={editable > 1 && actions.onEdit.bind(null, e, "isPublic")}/>), title: "Public", style: "checkbox public" }
			]}>
		</Table>
	</Panel>
));