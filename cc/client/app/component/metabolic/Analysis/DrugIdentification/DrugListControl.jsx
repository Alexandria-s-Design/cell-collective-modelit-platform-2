import  React  from "react";
import { Seq, Set } from "immutable";
import Options from "../../../base/options";
import Add from "../../../../action/add";
import Update from "../../../../action/update";
import Application from "../../../../application";
import DrugEnvironment from "../../../../entity/metabolic/DrugEnvironment";


export default class DrugListControl extends React.Component{      
      
	render(){
		const { model, modelState, editable, actions, selected: { Experiment: experiment, DrugEnvironment: environment}, entities } = this.props;        
		const data = model.DrugEnvironment ? Seq(model.DrugEnvironment).filter(e => !e.isDefault) : Seq();
		
		const handleOption = (e) => {
			let updateEntities = [];
			if (experiment) {
				updateEntities = [new Update(experiment, "drugEnvironment", e)];
			}
			actions.batch(updateEntities);
			actions.onSelect(e || "DrugEnvironment");			
			if (!e) {
				let selectedElement = modelState.getIn(["selected"]);
				selectedElement = selectedElement.delete('DrugEnvironment');
				actions.onEditModelState(["selected"], selectedElement);
			}
		}

		return (
			<dl>
				<dt>List:</dt>
				<Options
					none="Default"
					value={environment}
					options={data.sortBy(e => (e && e.name && e.name.toLowerCase()))}
					onEdit={actions.onEdit}
					enabled={data.size}
					editable={true}
					propertyName="List"
					onAdd={(() => {
						const envir = new DrugEnvironment({name : Application.defName(data, "Drug List ")});
						actions.batch(Seq([new Add(envir, true)]));
					})}
					onChange={handleOption.bind(this)}
					onRemove={(e => {
						let message = `${e.name} is currently used in ${experiment.name}, `; 
								message += `the settings for this List be lost forever once you delete. `;
								message += `Do you still want to proceed?`;
						actions.batch([new Update(experiment, "lastRunDrugEnvironment", null)]);
						actions.onConfirm(message, () => actions.onRemove(e, e === environment ? true : false));
					})}
				/>
			</dl>
		);        
	}
}

