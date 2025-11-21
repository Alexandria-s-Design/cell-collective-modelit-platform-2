import React from "react";
import { Seq } from "immutable";
import view from "../../base/view";
import Panel from "../../base/panel";
import Table from "../../base/table";
import Checkbox from "../../base/checkbox";
import { FormattedMessage } from "react-intl";

export default view(({ intl, view, model, entities, selected: { Experiment: e }, actions: { onEditModelState: edit, onEdit } }) => {
	let y;

	if (e) {
		y = e.y || Seq();
	}

	const gy = e => (y && !Seq(y).filter(v => v === e).isEmpty()) || false;

	const switchComp = (c) => {
		let r = y.filter(v => model.Metabolite[v.id]);
		if (y.has(c.id)) { r = r.delete(c.id); }
		else { r = r.set(c.id, c); }
		return r;
	};

	return (
		<Panel {...view} className="bar analysis4-phase1">
			<Table
				references={[entities.get("Metabolite"), e, y]}
				owner={model}
				data={Seq(model.Metabolite)}
				search="name"
				columns={[
					{ get: "name", label: "Name", editable: true, def: "_name"  },
					{ get: "initial_concentration", label: "Initial Concentration", editable: true, def: "_initial_concentration" },
					{
						get: gy,
						title: "Visible",
						format: c => (
							<Checkbox
								value={gy(c)}
								onEdit={e && onEdit.bind(null, e, "y",
									switchComp(c))} />
						),
						style: "checkbox visibility",
						editable: true
					}
				]}>
			</Table>
		</Panel>
	);
});