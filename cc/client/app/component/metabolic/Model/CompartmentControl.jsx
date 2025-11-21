import React from "react";
import { Seq } from "immutable";

import Options from "../../base/options";
import Add from "../../../action/add";
import Remove from "../../../action/remove";
import Application from "../../../application";
import Compartment from "../../../entity/metabolic/Compartment";
import Metabolite from "../../../entity/metabolic/Metabolite";

const createMetabolite = ({ model, actions }) => {
	const updates = [];
	const compartmentName = Application.defNameExt(model.Compartment, "c", /^c[A-Z]\d*$/i);
	const compartment = new Compartment({ name: compartmentName, compartmentId: compartmentName+'_ID'});
	updates.push(new Add(compartment));	
	const metabolite = new Metabolite({
		speciesId: Application.defNameExt(model.Metabolite, "m", /^m[A-Z]\d*$/i, { propertyName: "speciesId" }),
		name: Application.defNameExt(model.Metabolite, "", /^[A-Z]\d*$/i) + `_${compartmentName}`,
		compartmentId: compartment.id
	});
	updates.push(new Add(metabolite));
	actions.batch(updates);
};

export default class CompartmentControl extends React.Component {
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
					onAdd={createMetabolite.bind(this, this.props)}
					onChange={e => {(actions.onSelect(e || "Compartment"));}}
					onRemove={(e => {
						const message = `Do you wish to delete all metabolites corresponding to ${e.name}?`;
						const options = {
							okText: "FORCE",
							cancelText: "DELETE",
							onCancel: () => {
								actions.onRemove(e);
							}
						}
						actions.onConfirm(message, () => {
							let metabolites = Seq(model.Metabolite).filter(m => `${m.compartmentId}` == `${e.id}`)
							let metaboliteIds = metabolites.map(m => `${m.id}`)
							let reactionMetabolites = Seq(model.ReactionMetabolite).filter(rm => metaboliteIds.includes(`${rm.metaboliteId}`))

							actions.batch(metabolites.map(m => new Remove(m)).toArray())
							actions.batch(reactionMetabolites.map(rm => new Remove(rm)).toArray())

							actions.onRemove(e);
						}, options);
					})}
				/>
			</dl>
		);
	}
}