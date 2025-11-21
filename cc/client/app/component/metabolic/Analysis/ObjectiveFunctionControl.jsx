import  React  from "react";
import { Seq } from "immutable";

import Options from "../../base/options";
import Add from "../../../action/add";
import Application from "../../../application";
import ObjectiveFunction from "../../../entity/metabolic/ObjectiveFunction";

export default class ObjectiveFunctionControl extends React.Component {
	render ( ) {
		const { props } = this;
		const { model, editable, actions, selected: { Experiment: experiment } } = props;   
		let { selected: { ObjectiveFunction: objectiveFunction } } = props;
		const data = model.ObjectiveFunction ? Seq(model.ObjectiveFunction) : Seq();

		if ( experiment ) {
			const objectiveFunctionId = experiment.objectiveFunctionId;

			if ( objectiveFunctionId ) {
				objectiveFunction = model.ObjectiveFunction[objectiveFunctionId]
			}
		}

		const onChange = e => {
			actions.onEdit(experiment, "objectiveFunctionId", e.id);
			actions.onSelect(e || "ObjectiveFunction")
		}

		return (
			<dl>
				<dt>Objective Function:</dt>
				<Options
					none="Default"
					value={objectiveFunction}
					options={data.sortBy(e => (e && e.name && e.name.toLowerCase()))}
					onEdit={actions.onEdit}
					enabled={data.size}
					editable={editable}
					propertyName="Objective Function"
					onAdd={(() => {    
						const objective = new ObjectiveFunction({
							name: Application.defNameExt(data, "", /^[A-Z]\d*$/i)
						});
						actions.batch(Seq([new Add(objective, true)]));
					})}
					onChange={onChange}
					onRemove={(e => {
						// TODO (Metabolic): Consider Cases for Soft and Hard delete cases.
						actions.onRemove(e, () => e === objectiveFunction);
					})}
				/>
			</dl>
		);        
	}
}