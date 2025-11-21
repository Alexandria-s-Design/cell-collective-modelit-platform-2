import React from "react";
import view from "../base/view";
import {Seq,Range} from "immutable";
import Graph from "../graph";
import Panel from "../base/panel";



const offset = 8;
const viewport = { left: offset, right: offset, top: offset, bottom: offset };

class ModelVersionGraphView extends React.Component {
	constructor(props){
		super(props);
	}
	componentDidMount() {
		this.props.model.id && this.update(this.props);
	}
	UNSAFE_componentWillReceiveProps(props) {
		this.props.model.id !== props.model.id || this.props.entities !== props.entities || this.update(props);
	}
	update(props){
		const nodes = props.versions.filter(e=>e).map(e=>({label: e.versionDef && e.versionDef.name, color: null, uniqid: parseInt(e.id), style: this.props.model === e ? "selected" : "mine"})).toObject();

		const ids = Seq(nodes).mapEntries(({uniqid})=>[uniqid,true]).toObject();
		const getUniqId = () => { const id = new Range(1,Infinity).filterNot(v=>ids[v]).first(); ids[id] = true; return id;};
    
		const edges = Seq(props.versions).filter(e=>e).filter(e=>e.originId).map(e => ({source: nodes[e.originId], uniqid: getUniqId(), target: nodes[e.id]})).filter(e=>e.source&&e.target).toArray();
		this.refs.graph.self.set(Seq(nodes).toArray(), edges, "tree").draw();
	}
	render(){
		const { model, editable, parentWidth, parentHeight, view, actions: {onChangeVersion} } = this.props;
		const p = { parentWidth: parentWidth, parentHeight: parentHeight };    
    
		return (
			<Panel {...view}>
				<Graph {...view} ref="graph" {...p} styles={Graph.styles.versions} nodesClickable={() => true} onClick={(_,el) => el && el.node && onChangeVersion(el.node.uniqid)}/>
			</Panel>
		);
	}
}

export default view(ModelVersionGraphView);