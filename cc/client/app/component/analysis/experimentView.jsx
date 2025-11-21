import React from "react";
import { Seq } from "immutable";
import JSZip from "jszip";
import Utils from "../../utils";
import view from "../base/view";
import Panel from "../base/panel";
import Scrollable from "../base/scrollable";
import Checkbox from "../base/checkbox";
import Add from "../../action/add";
import Update from "../../action/update";
import UpdateProperty from "../../action/updateProperty";
import EditableProperty from "../model/editableProperty";
import SimulationTypeControl from "../model/simulationTypeControl";
import InitialStateControl from "../model/initialStateControl";
import FlowControl from "../model/flowControl";
import OutputRangesControl from "./outputRangesControl";
import Application from "../../application";
import Experiment from "../../entity/Experiment";
import SliderInput from "../base/sliderInput"
import OutputRange from "../../entity/outputRange";
import EnvironmentSelect from "./environmentSelect";
import ModelSelect from "./ModelSelect";
import ObjectiveFunctionControl from "../metabolic/Analysis/ObjectiveFunctionControl"
import FBATypeControl from "../metabolic/Analysis/FluxBalanceAnalysis/TypeControl"
import { FormattedMessage } from 'react-intl'; 

export const ExperimentSettingsViewBuilder = ({
	modelType = "boolean",
	experimentType = null,
	experimentGroupType = null,
	onDownload = null,
	experimentSettings = null,
	disableExperimentControl = false,
} = { }) => {
	const Content = props => {
		const { model, selected } = props;
		const mType = model.modelType || modelType;
		const actions = props.actions;
		const copy = (s, n, p) => Seq(s).map(e => e.copy(p, null, n)).flatten(true).map(e => new Add(e.entity)).toArray();
		const e = props.selected.Experiment;
		const eType = (e && e.experimentType) || experimentType;
		const changeable = e && !e.userId;
		const editable = changeable && props.editable;
		let ss, state = e && props.modelState.getIn(["Experiment", eType || "", e.id]);
		const completed = state && ((ss = state.get("state")) === "RUNNING" ? state.get("percentComplete") : (ss === "COMPLETED" ? 1 : null));
		const ep = { entity: e, onEdit: changeable && actions.onEdit, parentWidth: props.parentWidth };
		const rDL = (n, v) => (
			<dl>
				<dt>{n + ":"}</dt>
				<dd>{v}</dd>
			</dl>
		);
	
		const addExperiment = () => {
			let kineticLaws = Seq();
			if (model.modelType === 'kinetic') {
				kineticLaws = model.KineticLaw
			}
			const e = new Experiment({ experimentType, name: Application.defName(model.Experiment, "New Experiment "), created: new Date(), numSimulations: 100, bits: false, initialState: selected.InitialState, parameters: kineticLaws });
			actions.batch([new Add(e, true), new Add(new OutputRange({ parent: e, from: Experiment.transientTime, to: Experiment.runTime }), true)]);
		};

		if(disableExperimentControl && !e) {
			addExperiment()
		} 

		const runExperiment = _ => {
			const {selected: { Experiment: experiment } } = props;
			const eType = (experiment && experiment.experimentType) || experimentType;
			const { environment } = experiment;
			environment && actions.batch([new Update(experiment, "lastRunEnvironment", environment)]);
			return actions.onStartExperiment(experiment, props, _.ctrlKey, eType);
		};

		const renderSliderInputControl = (label, property, { defaultVal = 0 } = { }) => {
			const { selected: { Experiment: e } } = props;
			const value = e[property] < 0 ? e[property] * 100 : e[property];
			
			return (
				<dl>
					<dt>
						{label}
					</dt>
					<SliderInput
						value={value}
						min={0} max={100}
						units="%"
						onEdit={actions.onEdit.bind(null, e, property)}/>
				</dl>
			)
		}
	
		return (
			<Panel {...props.view} className="analysis3-phase1 analysis2-phase2">
				<Scrollable>
					<div className="simulation control">
						<input type="button" className={Utils.css("icon", "large-run")}
							disabled={Utils.enabled(e && ss !== "RUNNING" && ss !== "WAITING" && e.validRanges.first()
								&& ((e.lastRunEnvironment !== null || e.environment !== null)
								&& (e.lastRunEnvironment ||!props.modelState.getIn(["Experiment", e.id]) || e.environment !== null)))}
							onClick={runExperiment}/>
						{completed != null && rDL("Completed", Math.round(100*completed) + "%")}
						{state && state.has("elapsedTime") && rDL("Elapsed", state.get("elapsedTime") + "s")}
					</div>
					{!disableExperimentControl && (e ? (
						<div className="simulation settings">
							<FormattedMessage id="ModelsDashboard.ExperimentView.LabelName" defaultMessage="Name">
								{(message) => (<EditableProperty {...ep} property="name" label={message}/>)}
							</FormattedMessage>

							{experimentGroupType !== "contextSpecific" && mType !=="kinetic" && (<EnvironmentSelect {...props} canEdit={false}/>)}

							{mType == "boolean" && (
								<span>
									<FormattedMessage id="ModelDashboard.ExperimentView.LabelNumberofSimulations" defaultMessage="Number of Simulations">
										{(message) => (<EditableProperty {...ep} property="numSimulations" label={message} min="1" max="10000"/>)}
									</FormattedMessage>
									<InitialStateControl {...props} value={e.initialState} editable={editable} onChange={changeable && (v => (actions.batch([new Update(e, "initialState", v),
									props.editable && new UpdateProperty("initialState", v)]), actions.onSelect(v || "InitialState")))}
										onAdd={v => actions.batch([new Add(v, true), new Update(e, "initialState", v), new UpdateProperty("initialState", v)])}/>
									<OutputRangesControl {...props}/>
									<SimulationTypeControl value={e.type} onChange={changeable && actions.onEdit.bind(null, e, "type")}/>
									<dl>
										<dt>
											<FormattedMessage id="ModelDashBoard.AnalysisExperiementView.LabelGenerateBits" defaultMessage="Generate Bits"/>
										</dt>
										<Checkbox value={e.bits} onEdit={changeable && props.user.id !== undefined && actions.onEdit.bind(null, e, "bits")}/>
									</dl>
									<hr/>
									<span>
										<FlowControl {...props} flow={e.flow} range={props.selected.FlowRange} editable={editable} onChange={changeable && (v => (actions.onEdit(e, "flow", v), actions.onSelect(v || "Flow")))}
											onAdd={(v, p) => actions.batch([new Add(v, true), new Update(e, "flow", v)].concat(p))}
											onAddRange={p => actions.batch([new Add(p, true)].concat(copy(e.activities, "FlowActivity", { parent: p }), copy(e.mutations, "FlowMutation", { parent: p })))}/>
									</span>
								</span>
							)}

							{eType == "fba" && (
								<span>
									<FBATypeControl {...props}/>
								</span>
							)}

							{mType == "metabolic" && (
								<span>
									<ObjectiveFunctionControl {...props} editable={false}/>
								</span>
							)}

							{eType == experimentType &&
								experimentSettings ? experimentSettings(props) : null}

							{mType == "metabolic" && ["gimme"].includes(eType) && (
								<span>
									<span>
										{renderSliderInputControl("Threshold", "fluxThreshold", { defaultVal: 0.9 })}
									</span>

									<span>
										{renderSliderInputControl("Objective Fraction", "objectiveFraction", { defaultVal: 0.9 })}
									</span>
								</span>
							)}

							{mType == "metabolic" && experimentGroupType == "contextSpecific" && (
								<span>
									<ModelSelect/>
								</span>
							)}

						</div>
					) :
						(
							<div className="panel-instruction" onClick={addExperiment}>
								<div>
									<FormattedMessage id="ModelsDashboard.ExperimentView.labeladdnewexperiment" defaultMessage="Click Here to Add New Experiment"/>
								</div>
							</div>
						)
					)}
					{
						disableExperimentControl && (
							<div className="simulation settings">
								{experimentSettings ? experimentSettings(props) : null}
							</div>
						)
					}
				</Scrollable>
			</Panel>
		);
	};
	
	const download = ({selected: {Experiment: experiment}, model: {OutputRange: ranges, Component: components}, modelState}) => {
		const zip = new JSZip();
		const f = (e, r, n) => {
			let p = e.first();
			p && (p = p.data) && zip.file("(" + r.from + "-" + r.to + ")" + n + ".csv", [e.map(e => e.component.name).join()].concat(p.map((_, i) => e.map(e => e.data[i].toFixed(1)).join())).join("\r\n"));
		};
		Seq(modelState.getIn(["Experiment", experiment.id, "analysis"])).forEach((v, k) => {
			const s = Seq(v).map((v, k) => ({ component: components[k], data: v })).filter(e => e.component).sortBy(e => e.component.name.toLowerCase()).cacheResult();
			const range = ranges[k];
			f(s.filter(e => e.component.isExternal), range, "inputs");
			f(s.filterNot(e => e.component.isExternal), range, "outputs");
		});
		zip.generateAsync({ type: "blob" }).then(e => Utils.downloadBinary(experiment.name + ".zip", e));
	};
	
	const Actions = props => {
		const { selected: { Experiment: e } } = props;
		const state = e && props.modelState.getIn(["Experiment", e.id]);
		return {
			download: onDownload ? () => onDownload(props) : state != null && Seq(state.get("analysis")).size > 0 && (e.bits && state.get("bitsAvailable") !== false ? () => props.actions.download("simulate/dynamic/export/" + e.Persisted, e.name + " (bits).zip") : download.bind(null, props))
		};
	};
	
	return view(Content, null, Actions);
}

export default ExperimentSettingsViewBuilder()