import React from "react";
import { Seq } from "immutable";
import view from "../../base/view";
import Panel from "../../base/panel";
import Table from "../../base/table";
import Checkbox from "../../base/checkbox";
import { FormattedMessage } from "react-intl";
import messages from "./messages";

export default view(({intl, view, model, entities, selected: { Experiment: e }, actions: { onEditModelState: edit, onEdit }}) => {
	let x, y;

	if (e) {
		x = e.x;
		y = e.y || Seq();
	}

	const gx = e => x === e;
	const gy = e => (y && !Seq(y).filter(v => v === e).isEmpty()) || false;

	const switchComp = (c) => {
		let r = y.filter(v => model.Component[v.id]);
		if(y.has(c.id)) { r = r.delete(c.id); }
		else { r = r.set(c.id, c); }
		return r;
	};
    
	return (
		<Panel {...view} className="bar analysis4-phase1">
				<Table
					references={[entities.get("Component"), e, x, y]}
					owner={model}
					data={Seq(model.Component)}
					search="name"
					columns={[
						{ get: "name", label: intl.formatMessage(messages.ModelDashBoardTableViewLabelName) },
						{ get: gx, label: "X", format: c => (<Checkbox value={gx(c)} onEdit={e && onEdit.bind(null, e, "x", c)}/>), style: "checkbox radio" },
						{ get: gy, label: "Y", format: c => (<Checkbox value={gy(c)} onEdit={e && onEdit.bind(null, e, "y", switchComp(c) ) }/>), style: "checkbox" }
					]}>
				</Table>
		</Panel>
	);
});
