import React from "react";
import { Seq } from "immutable";

import Options from "../../base/options";
import Add from "../../../action/add";
import Application from "../../../application";
import Compartment from "../../../entity/kinetic/Compartment";
export default class CompartmentControl extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		const {actions, model, selected} = this.props;
		if(!Object.keys(selected).includes("Compartment")) {
			actions.onSelect(Seq(model.Compartment).first());
		}
	}

	render() {
		const { model, editable, actions, selected: { Compartment: compartment } } = this.props;

		const data = model.Compartment ? Seq(model.Compartment) : Seq();

		return (
			<dl>
				<dt>Compartment:</dt>
				<Options
					none="All"
					value={compartment}
					options={data.sortBy(e => (e && e.name && e.name.toLowerCase()))}
					onEdit={actions.onEdit}
					enabled={data.size}
					editable={editable}
					propertyName="Compartment"
					onAdd={(() => {
						const compartment = new Compartment({
							name: Application.defNameExt(data, "c", /^c[A-Z]\d*$/i)
						});
						actions.batch(Seq([new Add(compartment, true)]));
					})}

					onChange={e => {
						(actions.onSelect(e || "Compartment"));
					}}
					onRemove={(e => {
						const message = `Do you wish to delete all metabolites, reactions and genes corresponding to ${e.name}?`;
						const options = {
							okText: "FORCE",
							cancelText: "DELETE",
							onCancel: () => {
								actions.onRemove(e);
							}
						}
						actions.onConfirm(message, () => {
							// TODO(metabolic): Delete all metabolites, reactions and genes corresponding to this compartment.
							actions.onRemove(e);
						}, options);
					})}
				/>
			</dl>
		);
	}
}