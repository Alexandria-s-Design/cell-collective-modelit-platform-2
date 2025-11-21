import React from 'react';
import { Seq } from 'immutable';
import Add from '../../../action/add';
import view from '../../base/view';
import Panel from '../../base/panel';
import Table from '../../base/table';
//import Parameter from '../../../entity/pharmacokinetic/Parameter';
import Persist from "../../../mixin/persist";

export const ParametersViewBuilder = ({
	viewable = false,
	expandedView = false,
	showVisibility = false,
	selectable
} = { }) => {
    const Content = ({view, model, modelState, entities, selected, selected: { Parameter: parameter, PKCompartment: compartment, Rate: rate }, editable, actions}) => {
				let data = Seq(model.Parameter);
				let getColId = (e) => {
					if (e._id) return e._id;
					return ((parseInt(e.id)<0) ? Math.abs(e.id) : e.id);
				}

				const selectedEntityType = modelState.get("selectedEntity");
				const selectedEntity = selectedEntityType && selected[selectedEntityType];

				if (selectedEntityType === "PKCompartment" && compartment) {
					// console.log("ParametersView", {compartment, selectedEntityType, selected, data})
					data = data.filter(e => `${e.compartmentId}` == `${compartment.id}`);
				}

				if (selectedEntityType === "Rate" && rate) {
					data = data.filter(e => `${e.rateId}` == `${rate.id}`);
				}
				// selectedEntityType && actions.onSelect(selectedEntityType);
				
        return (
            <Panel {...view} className="bar analysis2-phase1">
							<Table key={selectedEntity && selectedEntity.id} {...actions}
								references={[
									entities.get("Parameter"),
									entities.get("Compartment")
								]}
								owner={model}
								data={data}
								selected={parameter}
								onSelect={parameter => actions.onSelect(parameter)}
								// search="name"
								columns={[
									{ get: getColId, label: "Id" },
									{ get: "name", label: "Name" }
								]}>
							</Table>
            </Panel>
        );
    };

    const Actions = props => {
        return {
        }
    }

		return view(Content, null, Actions, {}, [])
}

export default ParametersViewBuilder();