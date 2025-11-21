import React from "react";
import { Seq } from "immutable";
import Utils from "../../utils";
import NetViz from "ccnetviz";
import view from "../base/view";
import Panel from "../base/panel";
import Graph from "../graph";
import editableGraph from "../model/editableGraph";
import LayoutControl from "../model/layoutControl";
import Checkbox from "../base/checkbox";
import Persist from "../../mixin/persist";

const defColor = new NetViz.color(0.5, 0.5, 0.5, 1);

const Content = color => {
	const f = props => {
		const state = props.simulation.state;
		const step = props.simulation.step - 1;
		return step >= 0 ? (e => (e = state[e.id]) && (e && e.values[step] !== undefined ? color(props, e.avg, step) : defColor)) : (() => defColor);
	};

	const selection = (self, props) => {
		const components = props.model.Component;
		let nodes = self.transformNodes(props, props.modelState.getIn(["simulation", "visibility"]).filter(e => e).map((_, k) => components[k]).filter(e => e), {});
		self.adjustMoving(nodes);
		NetViz.layout.normalize(nodes = Seq(nodes).toArray(), self.dimension);
		self.selectionRef.current.self.set(nodes).draw();
	};

	const select = ({props}, e) => e && (props.actions.onEditModelState(["simulation", "visibility", e], !props.modelState.getIn(["simulation", "visibility", e.id], false)), true);

	const update = (self, props) => {
		props.modelState.getIn(["simulation", "step"]) !== self.props.modelState.getIn(["simulation", "step"]) && self.masterRef.current.self.update("nodesColored", "color", self.nodes.map(f(props)).toArray()).draw();
		props.modelState.getIn(["simulation", "visibility"]) !== self.props.modelState.getIn(["simulation", "visibility"]) && selection(self, props);
	};

	const EditableGraph = editableGraph(false, { selection: Graph.styles.selection }, selection, select, update, f);
	
	
	class self extends React.Component {
		render() {
			const props = this.props;
			const view = props.view;
			const state = view.getState()

			return (
				<Panel {...view}>
					<EditableGraph {...props} imageVisible={state.imageVisible} ref="self"/>
				</Panel>
			);
		}
	}
	return self;
};

const Actions = (props, ref) => {
	const { modelState, view, model } = props;
	const state = view.getState();
	const isImageVisible = state.imageVisible;

	return {
		layout: (<span><LayoutControl {...props}/></span>),
		download: modelState.getIn(["simulation", "step"]) && (() => Utils.downloadBinary(model.name + " simulation.png", ref("self").image)),
		imageVisibility: {
			title: `${isImageVisible ? "Hide" : "Show"} Background Image`,
			type: Checkbox,
			value: isImageVisible,
			onEdit: e => {
				view.setState({
					imageVisible: e
				})
			}
		}
	}
};

const transfK = (v)=>v.replace(/(\.Layout\[[^\]]+\])\[[0-9]+\]/i, (_,l)=>l);
const Pers = Persist(
	{
        imageVisible: false
	},
	(k) => (k = transfK(k) && (localStorage[k] ? JSON.parse(localStorage[k]) : undefined)),
	(k, v)=> (k = transfK(k) && ((localStorage[k] = JSON.stringify(v)), v)),
	"network",
	{imageVisible: true});

export default color => view(Content(color), null, Actions, {}, [Pers]);