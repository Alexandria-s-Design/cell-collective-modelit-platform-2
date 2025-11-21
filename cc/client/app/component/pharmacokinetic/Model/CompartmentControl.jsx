import React from "react";
import { Seq } from "immutable";
import Application from "../../../application";
import view from "../../base/view";
import Panel from "../../base/panel";
import Table from "../../base/table";
import Checkbox from "../../base/checkbox";
import Persist from "../../../mixin/persist";
import Add from "../../../action/add";

import PKCompartment from "../../../entity/pharmacokinetic/Compartment";
import Parameter from "../../../entity/pharmacokinetic/Parameter";
import { removeReaction } from "./ReactionsView";
import Update from "../../../action/update";
import DosingRegimen from "../../../entity/pharmacokinetic/DosingRegimen";

export const onSelectEntity = (props, e) => {
	// e could be many things... assume it is compartment for now
	const {actions, model} = props
	actions.onSelect(e || "PKCompartment");
	const compartment = e
	const data = Seq(model.Parameter).find(e => `${e.compartmentId}` == `${compartment.id}`)
	// timeout(()=>{
	// 	actions.onSelect(data || "Parameter");
	// }, 100)
};

export const createCompartment = ({ model, actions }) => {
	const updates = [];

	const compartment = new PKCompartment({
		name: Application.defNameExt(model.PKCompartment, "c", /^c[A-Z]\d*$/i),
		type: "int",
		cmp: "drug",
		x:  Math.random().toFixed(16),
		y:  Math.random().toFixed(16)					
	});
	
	updates.push(new Add(compartment));

	const volumeParameter = new Parameter({
		name: Application.defNameExt(model.Parameter, "V", /^V[A-Z]\d*$/i),
		type: 'volume',
		value: 1,
		compartment: compartment
	});

	updates.push(new Add(volumeParameter));

	actions.batch(updates);
};

export const createMetabolite = ({ model, selected: { Compartment: compartment }, actions }) => {
	const updates = [ ];

	if ( !compartment ) {
		compartment = new Compartment({
			name: Application.defNameExt(model.Compartment, "c", /^c[A-Z]\d*$/i)
		});

		updates.push(new Add(compartment));
	}

	const metabolite = new Metabolite({
		species_id: Application.defNameExt(model.Metabolite, "m", /^m[A-Z]\d*$/i, { propertyName: "species_id" }),
		name: Application.defNameExt(model.Metabolite, "", /^[A-Z]\d*$/i),
		compartmentId: compartment._id || compartment.id
	});

	updates.push(new Add(metabolite));

	actions.batch(updates);
};

export const removeMetabolite = (props, e, { confirm = true } = { }) => {
	const { model, selected: { Metabolite: m }, actions } = props;

	e = e ? e : m;

	if ( confirm ) {
		const message = `Do you wish to delete ${e.name} from all of its associated reactions as well?`;
		const options = {
			okText: "FORCE",
			cancelText: "DELETE",
			onCancel: () => {
				// TODO(metabolic): Subtract Metabolite from Reactions it belongs to...
				actions.onRemove(e);
			}
		}
		actions.onConfirm(message, () => {
			const reactions = Seq(model.ReactionMetabolite)
				.filter(r => `${r.metaboliteId}` == `${e.id}`)
				.map(r => model.Reaction[r.reactionId]);
	
			reactions.forEach(r => removeReaction(props, r, { confirm: false }));
	
			actions.onRemove(e);
		}, options);
	} else {
		actions.onRemove(e);
	}
};

export const CompartmentViewBuilder = ({
	viewable = false,
	expandedView = false,
	showVisibility = false
} = { }) => {
	const Content = (props) => {
		const { view, model, modelState, persisted, selected: { PKCompartment: compartment, Metabolite: metabolite }, 
			entities, draggable, actions } = props;
		let { editable } = props;
		editable = editable && !viewable;

		const state = view.getState();
		expandedView = state.expandedView;

		let data = Seq(model.PKCompartment);

		const getModelState = (metabolite, p) => {
			const key = modelState.getIn(["PKCompartment", p]);
			return key.get(metabolite.id, true);
		}

		const editModelState = (compartment, p, v) =>  {
			actions.onEditModelState(["PKCompartment", p, compartment], v)
		}
		const onEditCompartmentExtType = (compartment, e) => {
			const updates = [];
			if (e) {
				updates.push(new Update(compartment, 'extType', 'in'));
				const parameter = new Parameter({
					name: 'Dosing Regimen',
					type: 'dosing',
					compartment: compartment,
				});
				updates.push(new Add(parameter));
				updates.push(new Add(new DosingRegimen({
					parameter: parameter,
					type: 'single',
					route: 'od',
					amount: 0,
				})));

				actions.onSelect(parameter);
			} else {
				updates.push(new Update(compartment, 'extType', 'out'));
				const parameter = model.Parameter.find(p => p.compartmentId === compartment.id);

				updates.push(new Remove(parameter));
				updates.push(new Remove(model.DosingRegimen.find(dr => dr.parameterId === parameter.id)));
			}
			actions.batch(updates);
		}

		const onCompartmentParamEdited = (compartment, p, v) => {
			console.log(compartment, p, v)
			if(p === 'extType') {
				onEditCompartmentExtType(compartment, v === 'in')
			} else {
					if (p === 'type' && v === 'ext') {
						console.log(compartment, p, v, compartment.extType === 'in')
						onEditCompartmentExtType(compartment, compartment.extType == undefined || compartment.extType === 'in')
					}
			    actions.batch([new Update(compartment, p, v)])
			}
		}

		
		return (
			<Panel {...view} className="bar">
				<Table {...actions}
					persisted={persisted.PKCompartment}
					references={[
						entities.get("PKCompartment"),
						compartment,
						expandedView,
					]}
					owner={model}
					selected={compartment} 
					onSelect={e => onSelectEntity(props, e)}
					data={data}
					creator={() => createMetabolite(props)}
					columns={[
						showVisibility && {
							get: e => getModelState(e, "visibility"),
							title: "Visible",
							format: e => (
								<Checkbox
									value={getModelState(e, "visibility")}
									onEdit={editable && editModelState.bind(null, e, "visibility")}/>
							),
						},
						{ get: "name", label: "Name", editable: editable, def: "_name" },
						{ 
							 //get: "type",
						   label: "Type", 
						 	 //values: ['int', 'ext'],
							 editable: false, 
							 //def: "_type" ,
							 format: e => (
									<BasicDropdown 
										selectedValue={e.type} 
										values={['int', 'ext']}
										editable={editable}
										onOptionChange={ (o) => onCompartmentParamEdited(e, "type", o)}
									/>
							 )
							},
						{
							// get: "cmp", 
							label: "CMP", 
							// values: ['drug', 'metabolite'], 
							editable: false,
							format: e => (
								<BasicDropdown 
									selectedValue={e.cmp} 
									values={['drug', 'metabolite']}
									editable={editable}
									onOptionChange={ (o) => onCompartmentParamEdited(e, "cmp", o)}
								/>
						 )
							// def: "_cmp" 
						},
						{ 
						  label: "Ext. Type",
							editable: false, 
							format: e => (
									<BasicDropdown 
										selectedValue={e.extType} 
										values={['in', 'out']}
										editable={editable && e.type ==='ext'}
										onOptionChange={ (o) => onCompartmentParamEdited(e, "extType", o)}
									/>
							),

						}
							
							//def: "_extType" },
					].filter(Boolean)}>
				</Table>
			</Panel>
		);
	};

	function BasicDropdown({selectedValue, values, editable, onOptionChange}) {

		const dropDownItems = values.map((value, index) => 
		   <option 
			    key={index} 
					value={value}  
					selected= {value === selectedValue ? "selected": ""}
					//onClick={() => handleSelect(value)}
					>
			 	{value}
				</option>
		)
		return (
			<>
				<select disabled={!editable} onChange={ e => onOptionChange(e.target.value)}>
					{dropDownItems}
				</select>
			</>
		)
	}

	const Actions = (props) => {
		const { actions, model, selected: { Compartment: compartment, Metabolite: metabolite }, entities } = props;

		return {
			add: () => createCompartment(props),
		}
	}


	const persist = Persist(
		{ expandedView: false },
		null,
		null,
		null,
		{ expandedView: false }
	)

	return view(Content, null, Actions, {}, [persist])
}

export default CompartmentViewBuilder();
