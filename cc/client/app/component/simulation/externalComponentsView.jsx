import React from "react";
import { Seq } from "immutable";
import view from "../base/view";
import Panel from "../base/panel";
import Table from "../base/table";
import Checkbox from "../base/checkbox";
import SliderInput from "../base/sliderInput";
import Remove from "../../action/remove";
import Add from "../../action/add";
import Application from "../../application";
import FlowActivity from "../../entity/FlowActivity";
import SimulationActivity from "../../entity/simulationActivity";
import SimulationEnvironmentControl from "./simulationEnvironmentControl";
import SimulationEnvironment from "../../entity/simulationEnvironment";

let newEnvironment = undefined;
let checkboxRef = undefined;

class Content extends React.Component {

	constructor(props) {
    super(props);
    this.state = {checkboxInUse: false};
  }
        
	render(){
		const {view, simulation, model, modelState, entities, selected, editable, actions, draggable, selected: { SimulationEnvironment: simulationEnvironment }} = this.props;
		const visibility = modelState.getIn(["simulation", "visibility"]);
		const gv = e => visibility.get(e.id, false);
		const editState = (c, p, v) => actions.onEditModelState(["simulation", p, c], v);
		const isEmpty = e => e.value === 0;
		const setComponentState = (_states) => {
			this.setState(_states);
		};

		const setCheckboxRef = (ref) => {
			checkboxRef = ref;
		};

		if(newEnvironment !== simulationEnvironment && checkboxRef){
			checkboxRef.checked = false;
			checkboxRef.indeterminate = false;
			this.state.checkboxInUse = false;
		}
		
		let newEnvironmentId = undefined;
		newEnvironment = simulationEnvironment;
		let newEnviromentWasSetOnce = false;
		
		const setSliderValue = (e, v) => {
			edit(e, v);		
			return v;
		}

		const step = simulation.step - 1;
		let range, flow = selected.Flow;
		let activity, ga, ea, edit, value, sa;

		if(simulationEnvironment){

			if (flow && (step >= 0 || (range = selected.FlowRange))) {
				const gf = e => (e.value != null ? e.value : (e.min + e.max) / 2);
				const ef = (e, v, c, r) => (e ? (!v && !e.min && (e.max == null || e.max === 100) ? r(e) : actions.onEdit(e, "value", v)) : v && actions.onAdd(new FlowActivity(c())));
        
				if (step < 0) {
					activity = entities.get("FlowActivity");
					const id = range.id;
					ga = e => ((e = e.flowActivities) && (e = e[id]) ? gf(e) : 0);
					ea = editable && ((c, v) => ef(c.flowActivities && c.flowActivities[id], v, () => ({ parent: range, component: c, value: v }), actions.onRemove));
				}
				else {
					const ranges = Seq(flow.ranges);
					range = ranges.map(e => e.from).concat(ranges.map(e => e.to)).filter(e => e <= step).max();
					const id = flow.id;
					const f = e => e.filter(e => e.from <= step && e.to > step).minBy(e => e.to - e.from);
					ga = c => {
						const e = f(Seq(c.flowActivities).map(e => e.parent).filter(e => e.parentId == id));
						return e ? gf(c.flowActivities[e.id]) : 0;
					};
					const min = f(ranges);
					ea = editable && min && ((c, v) => ef(f(Seq(c.flowActivities).map(e => e.parent).filter(e => e.parentId == id)), v, () => ({ parent: min, component: c, value: v }),
						() => actions.batch(Seq(c.flowActivities).filter(e => (e = e.parent, e.parentId == id && e.from <= step && e.to > step)).map(e => new Remove(e)).toArray())));
				}
			}
			else {
               
				sa = modelState.getIn(["simulation", "activity"]);
				ga = e => sa.get(e.id, 0);
				ea = (e, v) => editState(e, "activity", v);
    
				activity = entities.get("SimulationActivity");
				const id = simulationEnvironment.id;
				ga = e => {       
					if ((e = e.simulationActivities) && (e = e[id])) {
						if (checkboxRef && this.state.checkboxInUse && e.value !== 0 && e.value !== 100) {
							checkboxRef.indeterminate = true;
						}
						return e.value;
					} else {
						if (checkboxRef && !this.state.checkboxInUse) { 
							checkboxRef.indeterminate = false;
						}
						return 0;
					}
				};
				edit = ((c,v,p="value") => {
					let r, e = c.simulationActivities;
					e && (e = e[id]) ? (r = { value: e.value}, r[p] = v, isEmpty(r) ? actions.onRemove(e) : actions.onEdit(e, p, v)) : (e = { parent: simulationEnvironment, component: c, value: 0}, e[p] = v, !isEmpty(e) && actions.onAdd(new SimulationActivity(e)));                 
					ea(c,v={});
				});
			}
		} 
		else {
            
			ga = () => 0;


			edit = ((c,v,p="value") => {
				const data = model.SimulationEnvironment ? Seq(model.SimulationEnvironment) : Seq();  
				let simulationEnvironment;
				if(!newEnviromentWasSetOnce){
					simulationEnvironment = new SimulationEnvironment({name : Application.defName(data, "New Env ")});
					actions.batch(Seq([new Add(simulationEnvironment, true)]));
					newEnviromentWasSetOnce = true;
					newEnvironmentId = simulationEnvironment.id;
					newEnvironment = simulationEnvironment;
				}
			   
				const id = simulationEnvironment ? simulationEnvironment.id : newEnvironmentId;
				let r, e = c.simulationActivities;
				e && (e = e[id]) ? (
					r = { value: e.value}, 
					r[p] = v, 
					isEmpty(r) ? actions.onRemove(e) : actions.onEdit(e, p, v)) 
					: 
					(
						e = { 
							parent: simulationEnvironment ? simulationEnvironment : newEnvironment, 
							component: c, 
							value: 0
						},
						e[p] = v, 
						!isEmpty(e) && actions.onAdd(new SimulationActivity(e)));                   
			});   
		}

		return (
			<Panel {...view} className="bar sim1-phase1">
				<Table
					{...actions}
					selected={selected.Component}
					references={[entities.get("Component"), visibility, activity, flow, range, simulationEnvironment]}
					owner={model}
					data={Seq(model.Component).filter(e => e.isExternal)}
					setComponentState = {setComponentState}
					setSliderValue = {setSliderValue}
					setCheckboxRef = {setCheckboxRef}
					search="name"
					columns={[
						{ get: e => gv(e), format: e => (<Checkbox value={gv(e)} onEdit={edit && editState.bind(null, e, "visibility")}/>), title: "Graph Visibility", style: "checkbox visibility", showCheckbox: false},
						{ get: "name", label: "Name", showCheckbox: false},
						{ get: e => ga(e), format: e => (<SliderInput value={ga(e)} onEdit={edit && edit.bind(null, e)} units="%"/>), label: "Activity", style: "activity", showCheckbox: true }
					]}>
				</Table>
			</Panel>
		);
	}
}

const Actions = props => {
	return {
		layout : <span><SimulationEnvironmentControl  {...props} /></span>
	};
};

export default view(Content, null, Actions);
