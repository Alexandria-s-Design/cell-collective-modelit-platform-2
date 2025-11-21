import React from "react";
import NetViz from "ccnetviz";
import view from "../base/view";
import Panel from "../base/panel";
import Graph from "../graph";

export default (owner, selectable, get) => {
	class Content extends React.Component {
		update(props, reset) {
			let anodes, edges;
			const o = props.selected[owner];

			if (o) {
				const graph = get(o);
				anodes = graph.nodes.toArray();
				edges = graph.edges;

				if (!reset) {
					graph.nodes.forEach((v, k) => {
						const e = this.layout[k];
						if (e) {
							v.fixed = true;
							v.x = e.x;
							v.y = e.y;
						}
						else reset = true;
					});
				}
				if (reset) {
					anodes.forEach((e, i) => e.index = i);
					new NetViz.layout.force(anodes, edges).apply();
					this.layout = graph.nodes.map(e => ({ x: e.x, y: e.y })).toObject();
				}
				NetViz.layout.normalize(anodes);
			}
			const graph = this.refs.graph.self;
			reset && graph.resetView();
			graph.set(anodes, edges).draw();
		}
		shouldComponentUpdate(props, state) {
			return this.props.entities !== props.entities || this.props.selected[owner] !== props.selected[owner] || !view.equal(this.props.view, props.view);
		}
		UNSAFE_componentWillReceiveProps(props) {
			const reset = this.props.selected[owner] !== props.selected[owner];
			(reset || this.props.entities !== props.entities) && this.update(props, reset);
		}
		componentDidMount() {
			this.props.selected[owner] && this.update(this.props, true);
		}
		render() {
			const { view, model, actions } = this.props;
			return (                
				<Panel {...view}>
					<Graph ref="graph" nodesClickable={() => true} onClick={selectable && ((e, el) => el !== null && el.node && actions.onSelect(model[owner][el.node.uniqid]))}/>
				</Panel>
			);
		}
	}

	return view(Content, props => props.title(props.selected[owner], props.name));
};