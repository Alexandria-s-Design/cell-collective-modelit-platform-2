import React, { useState } from 'react';
import { Seq } from 'immutable';
import view from '../../../base/view';
import Panel from '../../../base/panel';
import Table from '../../../base/table';
import DynamicSliderInput from "../../../base/dynamicSliderInput";
import Editable from "../../../base/editable";
import Update from '../../../../action/update';


export const ParametersViewBuilder = ({
	viewable = false,
	expandedView = false,
	showVisibility = false,
	selectable
} = {}) => {
	const Content = ({ view, model, modelState, entities, state: { simulation: global }, selected, selected: { Parameter: parameter, PKCompartment: compartment, Rate: rate }, property, actions }) => {
		let data = Seq(model.Parameter);
		const selectedEntityType = modelState.get("selectedEntity");
		const selectedEntity = selectedEntityType && selected[selectedEntityType];

		const updateParameterValue =(p, v) => {
			const updates = [];
			if(p.type == 'dosing') {
				const dosingRegimen = p.parameters 
				updates.push(new Update(dosingRegimen, "amount", v));
			}else {
				updates.push(new Update(p, "value", v));
			}
			actions.batch(updates);
		} 

		const sliderValue = (e) => {
			let v;
			if(e.type == 'dosing') {
				const dosingRegimen = e.parameters 
				v = dosingRegimen.amount
			}else {
			  v= e.value
			}
			return v == undefined ? 1 : v // default to 1 if no value is set
		}

		


		return (
			<Panel {...view} className="bar analysis2-phase1">
				<Table key={selectedEntity && selectedEntity.id} {...actions}
					references={[
						entities.get("Parameter"),
						entities.get("Compartment"),
						modelState.getIn(["Analysis", "ParameterValues"]),
					]}
					owner={model}
					data={data}
					selected={parameter}
					onSelect={parameter => actions.onSelect(parameter)}
					// search="name"
					columns={[
						{ get: "name", label: "Name" },
						{
							label: "Range",
							// def: "_range",
							format: e => (
								<DynamicSliderInput
									value={sliderValue(e)}
									min={0}
									max={sliderValue(e) * 2}
									editMin={false}
									editMax={true}
									onEdit={(v) => updateParameterValue(e, v)}
								/>
							),
							style: "activity dynamicSlider"
						},
						// { get: {localMax}, format: e => setLocalMax(parseInt(e)) , label: "Max"},
						{ 
							format: e => (
							<Editable 
							value = {sliderValue(e)}
							onEdit={(v) => updateParameterValue(e,v)}
							 />), 
							label: "Value"
						}
					]}>
				</Table>
			</Panel>
		);
	};

	const Actions = props => {
		return {
		}
	}

	return view(Content, null, Actions);
}

export default ParametersViewBuilder();