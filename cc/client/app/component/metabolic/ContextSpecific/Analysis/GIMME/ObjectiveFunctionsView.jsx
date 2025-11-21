import React from "react";
import { Seq } from "immutable";
import view from "../../../../base/view";
import Panel from "../../../../base/panel";
import Options from "../../../../base/options";
import Scrollable from "../../../../base/scrollable";
import "../style.scss";
import { useContext } from "react";
import { CCContext } from "../../../../../containers/Application";

export const ObjectiveFunctionsView = () => {

	const Content = (props) => {

		const {view, model, modelState, actions, parentHeight} = props;
		const {cc} = useContext(CCContext);

		const settingsPath = ['contextSpecificGIMME', 'settings'];
		const selectedObjectiveFn = modelState.getIn(settingsPath.concat(['objectiveFunction']));
		
		const objectiveData = Seq(model.ObjectiveFunction);

		const newObjectiveFunctionOption = {
			id: 'build-objective-function',
			name: '+ Build Objective Function'
		};
		const updatedObjectiveData = Seq.of(newObjectiveFunctionOption).concat(objectiveData);

		const handleSelectObjectiveFn = (val) => {
			if (val.id === 'build-objective-function') {
				cc.layoutSet("Objective Function");
			} else {
				actions.onEditModelState(settingsPath.concat(['objectiveFunction']), val);
			}
		}

		const getSelectedObjectiveFn = (e) => {
			let eName = objectiveData.get(e);
			return eName && eName.name || (typeof e === 'string' ? e : e.name);
		}

		return (
			<Panel {...view} className="bar analysis1-phase1 panel-model-creation-settings">
				<div>
					<dl>
						<dt>
							<dd>Objective Function:</dd>
							<Options none={'Select Objective Function'}  
								value={selectedObjectiveFn}
								get={getSelectedObjectiveFn}
								options={
									updatedObjectiveData.sort((a, b) => {
										const nameA = a.name.toLowerCase();
										const nameB = b.name.toLowerCase();
								
										if (nameA === '+ build objective function') return 1;
										if (nameB === '+ build objective function') return -1;
										if (nameA < nameB) return -1;
										if (nameA > nameB) return 1;
										return 0;
									})
								}
								onEdit={actions.onEdit}
								enabled={updatedObjectiveData.size}
								editable={true}
								dropdowIcon="base-menu-gray"
								onChange={handleSelectObjectiveFn}
							/>
						</dt>
					</dl>
				</div>
			</Panel>
		)
	}
	
	const Actions = (props) => {
		const {model, modelState, selected: { Experiment: e, Environment : environment }, actions} = props;
		
		return {	};
	};
	
	return view(Content, null, Actions);
}

export default ObjectiveFunctionsView();
