import React from "react";
import Immutable, {Seq, OrderedSet} from "immutable";
import view from "../base/view";
import Panel from "../base/panel";
import Utils from "../../utils";
import Graph from "../graph";

const offset = 8;
const viewport = { left: offset, right: offset, top: offset, bottom: offset };

class Content extends React.Component {
	constructor(props) {
		super(props);
		this.state = { viewport: viewport};
	}
	drawGraph(props){
		const nodes = [];
		const edges = [];
		const graph = this.refs.graph.self;
		const stateGraph = props.modelState.getIn(["StateTransition", "graph"]);

		if(stateGraph){
			const nodes = {};
			stateGraph.forEach( e => e.forEach(e => {nodes[e.name] = nodes[e.name] || {label : e.name, style: "internal", keys : e.keys }; }) );
			stateGraph.forEach( e =>  {
				const from = e[0], to = e[1];
				edges.push({ source: nodes[from.name], target: nodes[to.name] });
			});
			graph.set(Seq(nodes).toArray(), edges, "force");
			graph.draw();
		}
	}
	onNodeHover(_, e){    
		this.setState({nodeInfo: (e && e.node)});
		return !!e;
	}
	setViewport(e) {
		const sc = 1 / e.size;
		const p = e => Utils.toPercent(sc * e);    
       
		let is = 0;
		const v = sc === 1 ? viewport : { width: p(1), height: p(1), left: p(-e.x), bottom: p(-e.y) };
		const m = Immutable.fromJS(v).forEach((v, k)=>(is |= (v != this.state.viewport[k])));
		if(is) this.setState({viewport: v});
	}
	componentWillUnmount(){
		this.props.actions.onStateTransitionGraph(null);
	}
	componentDidUpdate(){
		this.drawGraph(this.props);
	}
	shouldComponentUpdate(props, state){
		return !view.equal(props.view, this.props.view) || this.props.modelState.getIn(["Topology", "data"]) !== props.modelState.getIn(["Topology", "data"]) || this.props.networkAnalysis !== props.networkAnalysis || this.props.state.nodeInfo !== state.nodeInfo; 
	}
	render(){
		const props = this.props;
		const data = (!this.props.modelState.getIn(["Topology", "data"]) && !this.props.networkAnalysis.stateGraphRunning && this.props.networkAnalysis.stateGraphResult) || false;

		let {nodeInfo} = this.state;
		if(nodeInfo){
			let k = 0, elements = [], node = {}, {label, keys} = nodeInfo;
			const {model : {Component}} = this.props;

			const getNodeId = e => e.substr(1).replace("_", "-");

			keys = Seq(keys).filter(e => Component[getNodeId(e)]).map(e => Component[getNodeId(e)].name).forEach((n, i) => { node[n] = label.slice(i, i+1);});      
			nodeInfo = (<ul>{Seq(node).map((idx, e) => (<li key={(k += 1)}>{`${idx} = ${e}`}</li>)).toArray()}</ul>);      
		}

		const {parentWidth, parentHeight,view} = this.props;
		const p = { parentWidth, parentHeight };
  
    
		return (
			<div className="canvas">
				<Graph {...p} styles={Graph.styles.stateGraph} onNodeHover={this.onNodeHover.bind(this)} ref="graph" onChangeViewport={this.setViewport.bind(this)} />
				{data && (<div className="message" style={{color : "#1f77b4"}}>{this.props.networkAnalysis.stateGraphResult}</div>)}
				{(nodeInfo && (<div className="nodeinfo">{nodeInfo}</div>)) || false}
			</div>
		);
	}
}

const GraphHolderView = (props) => {
	return (<Panel {...props.view}>
		<Content {...props} />
	</Panel>);
};

const Actions = (props, ref) => {
	const data = props.modelState.getIn(["StateTransition", "graph"]);
	return {
		run:() => {props.actions.onStateTransitionGraph(props.model.Component, props);},
		download: data && (() => Utils.downloadBinary(props.model.name + "(State Transition Graph).png", ref("graph").image))
	};
};

export default view(GraphHolderView, null, Actions);
