import  React, { Component }  from "react";
import { Seq, Set } from "immutable";
import Options from "../base/options";
import Add from "../../action/add";
import Update from "../../action/update";
import Application from "../../application";
import UpdateProperty from "../../action/updateProperty";
import SimulationEnvironment from "../../entity/simulationEnvironment";
import SimulationActivity from "../../entity/simulationActivity";
import { FormattedMessage } from 'react-intl'; 


export default class SimulationEnvionmentControl extends React.Component{

	render(){
		const { model, modelState, editable, actions, selected: { SimulationEnvironment: environment}, selected, entities, canEdit } = this.props;        
		const data = model.SimulationEnvironment ? Seq(model.SimulationEnvironment) : Seq();  
       
		return (
			<dl>
				<FormattedMessage id="SimulationDashboard.MiniAppBar.EnvironmentText" defaultMessage="Environment: " />
				<FormattedMessage id= "SimulationEnvironmentControl.Default.DefaultLabel" defaultMessage="Default"> 
					{x => 	
					<Options none={x}
					value={environment}
					options={data.sortBy(e => (e && e.name && e.name.toLowerCase()))}
					onEdit={actions.onEdit}
					enabled={data.size}
					propertyName="Environment"
					editable={true}
					onAdd={(() => {                            
						const envir = new SimulationEnvironment({name : Application.defName(data, "New Env ")});
						actions.batch(Seq([new Add(envir, true)]));
					})}
					onChange={e => {
						(actions.onSelect(e || "SimulationEnvironment"));                                
					}}
					onRemove={(e => { 
						actions.onRemove(e, e !== environment ? environment : null);                         
					})}
				/>}
				</FormattedMessage>
				




			</dl>
		);
	}
}
