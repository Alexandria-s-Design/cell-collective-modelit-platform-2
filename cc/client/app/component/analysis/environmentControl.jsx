import  React  from "react";
import { Seq, Set } from "immutable";
import Options from "../base/options";
import Add from "../../action/add";
import Update from "../../action/update";
import Application from "../../application";
import UpdateProperty from "../../action/updateProperty";
import Experiment from "../../entity/Experiment";
import ExperimentActivity from "../../entity/ExperimentActivity";
import Environment from "../../entity/Environment";


/** 
 * Delete Experiment with Environment Associated with it causing error
 * Save on Table
*/

const updateActivities = (activities, experiment, environment) => {  
	const filteredActivities = activities.filter(e => e.parent === environment);
	const otherActivities = environment ? activities.filter(e => e.parent !== environment).map(e => new Update(e, "experiment", null)) : [];
	return filteredActivities.map(e => new Update(e, "experiment", experiment ? experiment : null)).concat(otherActivities);
};

export default class EnvionmentControl extends React.Component{      
      
	render(){
		const { model, modelState, editable, actions, selected: { Experiment: experiment, Environment: environment}, entities } = this.props;        
		const data = model.Environment ? Seq(model.Environment).filter(e => !e.isDefault) : Seq();
		
		const handleOption = (e) => {
			let updateEntities = [];
			//let activities = Seq(model.ExperimentActivity).filter(e => e.parent === environment) || Seq(); 
			if (experiment) {
				updateEntities = [new Update(experiment, "environment", e)];
			}			
			//let updates = updateActivities(activities, experiment, e)
			actions.batch(updateEntities);
			actions.onSelect(e || "Environment");			
			if (!e) {
				let selectedElement = modelState.getIn(["selected"]);
				selectedElement = selectedElement.delete('Environment');
				actions.onEditModelState(["selected"], selectedElement);
			}
		}

		return (
			<dl>
				<dt>Env:</dt>
				<Options
					none="Default"
					value={environment}
					options={data.sortBy(e => (e && e.name && e.name.toLowerCase()))}
					onEdit={actions.onEdit}
					enabled={data.size}
					editable={true}
					propertyName="Environment"
					onAdd={(() => {    
						const envir = new Environment({name : Application.defName(data, "New Env ")});
						actions.batch(Seq([new Add(envir, true)]));                            
					})}
					onChange={handleOption.bind(this)}
					onRemove={(e => {
						if((experiment && experiment.lastRunEnvironment === e)){
                                
							//Confirmation Message on delete
							const message = `${e.name} is currently used in ${experiment.name}, 
                                the settings for this environment be lost forever once you delete. 
                                Do you still want to proceed?`;                                
							actions.batch([new Update(experiment, "lastRunEnvironment", null)]);
							actions.onConfirm(message, () => actions.onRemove(e, e === environment ? true : false));
						}
						else{
							return actions.onRemove(e, e === environment ? true : false);
						}
                            
					})}
				/>
			</dl>
		);        
	}
}

