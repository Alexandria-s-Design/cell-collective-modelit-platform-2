import React from "react";
import Immutable, { Seq } from "immutable";
import JSZip from "jszip";
import Utils from "../../utils";
import view from "../base/view";
import Panel from "../base/panel";
import Scrollable from "../base/scrollable";
import Range from "../../mixin/range";
import SliderInput from "../base/sliderInput";
import SimulationTypeControl from "../model/simulationTypeControl";
import InitialStateControl from "../model/initialStateControl";
import FlowControl from "../model/flowControl";
import Add from "../../action/add";
import UpdateProperty from "../../action/updateProperty";
import FlowActivity from "../../entity/FlowActivity";
import FlowMutation from "../../entity/flowMutation";
import { FormattedMessage } from "react-intl";

class Content extends React.Component {
    constructor(props) {
        super(props);
        this.state = { running: false };
    }
    stop() {
        this.props.simulation.stop();
        this.setState({ running: false });
    }
    onSimulate(_) {
        const e = this.state.running;
        this.props.simulation[e ? "stop" : "start"](_.ctrlKey);
        this.setState({ running: !e });
    }
    onReset() {
        this.state.running && this.stop();
        this.props.simulation.init();
    }
    onRecord() {
        const e = this.state.recording;
        !e && this.props.actions.onSelect("Flow");
        this.props.simulation["rec" + (e ? "Stop" : "Start")]();
        this.setState({ recording: !e });
    }
    UNSAFE_componentWillReceiveProps(props) {
        if(this.props.selected.SimulationEnvironment !== props.selected.SimulationEnvironment){
            // this.props.simulation.init();
        }
        this.state.running && !Seq(props.model.Regulator).size && this.stop();        
    }
    componentWillUnmount() {
        this.props.simulation.reset();
    }
    render() {
        const props = this.props;
        const { model, model: { Component: components }, modelState, state: { simulation: global }, selected, selected: { Flow: flow, SimulationEnvironment: simulationEnvironment }, editable, actions } = props;
        const local = modelState.get("simulation");
        const step = modelState.getIn(["simulation", "step"]);
        const recording = this.state.recording;
        const edit = e => actions.onEditState.bind(null, "simulation", [e]);
        const copy = (k, t, p, s) => local.get(k).filter(e => e).map((v, e) => (e = { parent: p, component: components[e] }, e[s] = v, new Add(new t(e)))).toArray();

		return (
			<Panel {...props.view} className="sim3-phase1">
				<Scrollable>
					<div className="simulation control">
						<input type="button" className="icon large-stop" disabled={Utils.enabled(step)} onClick={this.onReset.bind(this)}/>
						<input type="button" className={"icon large-" + (this.state.running ? "pause" : "run")} disabled={Utils.enabled(Seq(model.Regulator).size)} onClick={this.onSimulate.bind(this)}/>
						{step > 0 && (
							<dl>
								<dt>Time (Step):</dt>
								<dd>{step}</dd>
							</dl>)
						}
					</div>
					<div className="simulation settings">
						<dl className="speed">
						<dt>
							<FormattedMessage id="ModelDashboard.ControlView.LabelSimulationSpeed" defaultMessage="Simulation Speed:"/>
						</dt>
							<SliderInput value={global.get("speed") || 1} min={1} max={10} onEdit={edit("speed")}/>
						</dl>
						<dl className="window">

							<dt><FormattedMessage id="ModelDashboard.ControlView.SlidingWindow" defaultMessage="Sliding Window:"/></dt>
							<SliderInput value={global.get("window") || 100} min={1} max={1000} {...Range.linear({ 0: 1, 0.66: 100, 1: 1000 })} onEdit={edit("window")}/>
						</dl>
						<span className="sim2-phase2">
							<InitialStateControl {...props} value={selected.InitialState} onChange={e => (editable && actions.batch([new UpdateProperty("initialState", e)]), actions.onSelect(e || "InitialState"))}
								onAdd={e => actions.batch([new Add(e, true), new UpdateProperty("initialState", e)])} />
						</span>
						<SimulationTypeControl value={global.get("type")} onChange={edit("type")}/>
						<hr/>
						<div>
							<FlowControl {...props} flow={flow} range={flow && step > 0 ? Seq(flow.ranges).filter(e => e.from <= step && e.to > step) : selected.FlowRange} onChange={e => actions.onSelect(e || "Flow")}
								onAdd={(e, p) => actions.batch([new Add(e, true)].concat(p))} onAddRange={p => actions.batch([new Add(p, true)].concat(copy("activity", FlowActivity, p, "value"), copy("mutation", FlowMutation, p, "state")))}/>
							{editable && (<input type="button" className={Utils.css("icon right base-recording", recording && "on")} title={recording ? "Stop Recording" : "Record Flow"} onClick={this.onRecord.bind(this)}/>)}
						</div>
					</div>
				</Scrollable>
			</Panel>
		);
	}
}

const download = (model, simulation) => {
	const zip = new JSZip();
	const s = Seq(simulation.state).sortBy(e => e.name.toLowerCase()).cacheResult();
	const f = (n, v) => zip.file(n + ".csv", [s.map(e => e.name).join()].concat(Immutable.Range(0, simulation.step).map(i => s.map(v.bind(null, i)).join()).toArray()).join("\r\n"));

	f("bits", (i, e) => e.values[i] | 0);
	f("values", (i, e) => (100*e.avg[i]).toFixed(1));
	f("settings", (i, e) => ((e = e.input[i]) < 0 ? "" : e));
	zip.file("window.csv", simulation.windows.join("\r\n"));
	zip.generateAsync({ type: "blob" }).then(e => Utils.downloadBinary(model.name + " simulation.zip", e));
};

export default view(Content, null, ({model, modelState, simulation}) => ({ download: modelState.getIn(["simulation", "step"]) > 0 && download.bind(null, model, simulation) }));
