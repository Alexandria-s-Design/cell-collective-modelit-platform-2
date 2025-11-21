import  React  from "react";
import { Seq } from "immutable";

import Options from "../../../base/options";
import utils from "../../../../utils"

import { ModelType } from "../../../../cc";

const FBATYPES = ModelType.metabolic.fbaTypes;
const fbaTypes = Object.keys(FBATYPES)
	.reduce((prev, next) => ({
		...prev,
		[next]: {
			...FBATYPES[next],
			id: utils.newGuid(),
			type: next
		}
	}), { })

export default class TypeControl extends React.Component {
	render ( ) {
		const { props } = this;
		const { actions, selected: { Experiment: experiment } } = props;

		const data = Seq(fbaTypes);

		let fbaType = fbaTypes.fba

		if ( experiment && experiment.fbaType ) {
			fbaType = fbaTypes[experiment.fbaType];
		}
		
		return (
			<dl>
				<dt>FBA Type:</dt>
				<Options
					none="Default"
					value={fbaType}
					options={data}
					enabled={data.count()}
					editable={false}
					propertyName="FBA Type"
					onChange={value => actions.onEdit(experiment, "fbaType", value.type)}
				/>
			</dl>
		);        
	}
}