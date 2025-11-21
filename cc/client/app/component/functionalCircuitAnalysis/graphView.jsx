import React from "react";
import ReactDom from "react-dom";
import view from "../base/view";
import Panel from "../base/panel";
import Scrollable from "../base/scrollable";
import Utils from "../../utils";
import { Seq, OrderedMap } from "immutable";
import NetViz from "ccnetviz";
import Graph from "../graph";


export default (selectedRow) => {

	class Content extends React.Component {
		drawGraph(props){
			const edges = [];
			const graph = this.refs.circuit.self;
			let nodes = (props.modelState.get(selectedRow) || Seq()).map(e => ({"label" : e.name, "style": e.isExternal ? "external" : "internal"})).toArray();
			nodes = nodes.slice(0, nodes.length - 1);
			for(let i = 1; i < nodes.length; i++){
				edges.push({source : nodes[i-1], target : nodes[(i) % (nodes.length)]});
			}
    
			edges.push({source : nodes[nodes.length - 1], target : nodes[0]});
			graph.set(nodes, edges, "circular");
			graph.draw();
		}

		componentDidUpdate(){
			this.drawGraph(this.props);
		}

		shouldComponentUpdate(props){
			return this.props.modelState.get(selectedRow) !== props.modelState.get(selectedRow);
		}

		render(){
			return (
				<Panel {...this.props.view} className="phase1-model1">
					<Graph ref="circuit" />
				</Panel>
			);
		}
	}

	const Actions = (props, ref) => {
		const data = props.modelState.get(selectedRow);
		return { download: data && (() => Utils.downloadBinary("[" + props.model.name + "]_loop", ref("circuit").image))};
	};

	return view(Content, null, Actions);
};
