import  React  from "react";
import { Seq, Set } from "immutable";

import Application from "../../../application";

import Options from "../../base/options";
import Add from "../../../action/add";
import Update from "../../../action/update";
import Remove from "../../../action/remove";
import Compartment from "../../../entity/metabolic/Compartment";
import SubSystem from "../../../entity/metabolic/SubSystem";

import cc from "../../../cc";

export default class SubSystemControl extends React.Component {
	render ( ) {
		const { model, editable, actions, selected: { SubSystem: subsystem } } = this.props;
		const data = model.SubSystem ? Seq(model.SubSystem) : Seq();

		return (
			<dl>
				<dt>Sub System:</dt>
				<Options
					none="All"
					format={(v) => cc._.ellipsis(v.name || "", "...")}
					value={subsystem}
					isScrollable={true}
					options={data}
					onEdit={actions.onEdit}
					enabled={data.size}
					editable={editable}
					propertyName="SubSystem"
					onAdd={(() => {
						const subsystem = new SubSystem({
							name: Application.defNameExt(model.SubSystem, "s", /^s[A-Z]\d*$/i)
						});
						actions.batch(Seq([new Add(subsystem, true)]));
					})}
					onChange={e => {(actions.onSelect(e || "SubSystem"));}}
					onRemove={(e => {
						const message = `Do you wish to delete all reactions to ${e.name}?`;
						const options = {
							okText: "FORCE",
							cancelText: "DELETE",
							onCancel: () => {
								actions.onRemove(e);
							}
						}
						actions.onConfirm(message, () => {
							let reactions = Seq(model.Reaction).filter(r => `${r.subsystem}` == `${e.id}`)	

							actions.batch(reactions.map(r => new Remove(r)).toArray())
							actions.onRemove(e);
						}, options);
					})}
				/>
			</dl>
		);        
	}
}