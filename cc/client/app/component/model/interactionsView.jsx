import React from "react";
import { Seq } from "immutable";
import Utils from "../../utils";
import view from "../base/view";
import Panel from "../base/panel";
import Table from "../base/table";
import Interaction from "../../entity/interaction";

class Content extends React.Component {
	constructor(props) {
		super(props);
		this.state = { selected: null };
	}
	UNSAFE_componentWillReceiveProps(props) {
		this.props.selected.Component !== props.selected.Component && this.setState({ selected: null });
	}
	shouldComponentUpdate(props, state) {
		return this.state !== state || this.props.selected.Component !== props.selected.Component || this.props.entities !== props.entities || !view.equal(this.props.view, props.view);
	}
	render() {
		const props = this.props;
		const { selected: { Component: component }, editable, actions } = props;
		const map = component && component.interactions || {};
		const f = e => map[e.id];
		const edit = (c, p, v) => {
			const e = f(c);
			const s = Utils.capitalize(p);
			v = Utils.range(parseInt(v) || 0, Interaction["min" + s] || 0, Interaction["max" + s]) || null;
			e ? (v || Seq(Interaction.prototype.properties).some((v, k) => k !== p && !v && e[k]) ? actions.onEdit(e, p, v) : actions.onRemove(e)) : v && actions.onAdd(new Interaction({ target: component, source: c, [p]: v }));
		};

		return (
			<Panel {...props.view} className="bar">
				<Table
					onSelect={e => this.setState({ selected: e })}
					onEdit={edit}
					references={[props.entities, component]}
					owner={component}
					selected={this.state.selected}
					data={Seq(component && component.inputs)}
					search="name"
					columns={[
						{ get: "name", label: "Name" },
						{ get: e => (e = f(e)) && e.delay || null, key: "delay", editable: editable, title: "Delay", style: "checkbox number time" },
						{ get: e => (e = f(e)) && e.threshold || null, key: "threshold", editable: editable, title: "Threshold", style: "checkbox number threshold" }
					]}>
				</Table>
			</Panel>
		);
	}
}

export default view(Content, ({title, selected: { Biologic: e }, name}) => title(e, name));