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
import { FormattedMessage } from "react-intl";


const updateActivities = (activities, experiment, environment) => {   
	const filteredActivities = activities.filter(e => e.parent === environment);
	const otherActivities = activities.filter(e => e.parent !== environment).map(e => new Update(e, "experiment", undefined));
	return filteredActivities.map(e => new Update(e, "experiment", experiment ? experiment : null)).concat(otherActivities).toIndexedSeq();
};

export default class EnvionmentSelect extends React.Component{  

	render(){
		const { model, editable, actions, selected: { Experiment: experiment, Environment: environment}, selected, entities, canEdit } = this.props;        
		const data = model.Environment ? Seq(model.Environment).filter(e => !e.isDefault) : Seq();
		const activities = Seq(model.ExperimentActivity) || Seq();               
		
		const st = experiment && this.props.modelState.getIn(["Experiment", experiment.id]);

		const handleOption = (e) => {
			const updateEntities = [new Update(experiment, "environment", e)];
			actions.batch(updateActivities(activities, experiment, e).concat(updateEntities));
			actions.onSelect(e || "Environment");
		}

		return (
			<dl>
				<dt>
					<FormattedMessage id="ModelDashBoard.AnalysisExperimentSettings.LabelEnvironment"
						defaultMessage="Environment"/>
				</dt>
				<Options none={(experiment.lastRunEnvironment === null) || (experiment.lastRunEnvironment === undefined && st && experiment.environment === null) ? "None": "Default"}  
					value={experiment.environment}
					options={data.sortBy(e => (e && e.name && e.name.toLowerCase()))}
					onEdit={actions.onEdit}
					enabled={data.size}
					editable={editable}
					onChange={handleOption.bind(this)}
				/>
				{(experiment.lastRunEnvironment === null && experiment.environment === null) || (experiment.lastRunEnvironment === undefined && st && experiment.environment === null) ? <b style={{ color: "red", paddingLeft: "5px", cursor: "pointer"}} title={"Caution: previously used environment has been removed, running with new environment will yield a different results"}>!</b>: null}
			</dl>
		);        
	}
}