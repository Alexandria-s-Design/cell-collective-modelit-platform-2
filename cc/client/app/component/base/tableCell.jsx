import React from "react";
import Utils from "../../utils";
import Edit from "../../mixin/edit";
import Draggable from "./draggable";

export default class extends Edit(React.Component){
	submit(value) {
		const c = this.props.column;
		value !== undefined && (value = value || undefined) !== c.format(this.props.data) && (value || !c.def) && this.props.onEdit(this.props.data, c.property, value);
		setTimeout(this.props.onBlur, 0);
	}
	UNSAFE_componentWillReceiveProps(props) {
		props.editing && !this.props.editing && this.onEdit();
	}
	render() {
		const { data, column: c, onDrag, editable } = this.props;
		let style, cell;

		if (this.state.editing) {
			let e = this.state.value;
			if (e === undefined) {
				e = c.format(data);
				(c.def && c.def(data) === e || e == null) && (e = "");
			}
			style = "editing";
			cell = this.renderForm(e);
		}
		else {
			style = editable ? "editable" : "";
			cell = c.format(data);
		}

		return (
			<Draggable onClick={editable && this.onEdit.bind(this)} onDrag={!this.state.editing && onDrag}>
				<td className={Utils.css(style, c.style, c.state(data))}>
					{cell}
				</td>
			</Draggable>
		);
	}
}
