import React from "react";
import Utils from "../../utils";
import Draggable from "./draggable";
import Row from "./tableRow";

export default class Body extends React.Component {
	shouldComponentUpdate(props) {
		return this.props.begin !== props.begin || this.props.end !== props.end || this.props.data !== props.data || this.props.references.some((e, i) => e !== props.references[i]) ||
            this.props.columns.length !== props.columns.length;
	}
	onKeyUp(e) {
		const props = this.props;
		let i = props.selected;

		switch (e.keyCode) {
		case 38: --i >= 0 && (i < props.begin && props.setPosition(i), props.onSelect(props.data.get(i))); break;
		case 40: ++i < props.data.size && (i >= props.end - 2 && props.setPosition(i + props.begin - props.end + 2), props.onSelect(props.data.get(i))); break;
		}
	}
	onKeyPress(e) {
		e.key === "Enter" && this.props.onEdit();
	}
	render() {
		const props = this.props;
		let { begin, onSelect, onDrag, editable } = props;
		begin = begin - begin % 2;

		return (
			<table style={{top: props.rowHeight * begin - 1}} tabIndex="-1" onKeyUp={onSelect && this.onKeyUp.bind(this)} onKeyPress={onSelect && this.onKeyPress.bind(this)}>
				<tbody className={Utils.css(onSelect && "selectable")}>
					{props.data.slice(begin, props.end + 1).map(e => (
						<Draggable key={e.accessId || e.id} onClick={onSelect && onSelect.bind(null, e)} onDrag={onDrag && onDrag.bind(null, e)}>
							<tr className={Row.state(editable, e)}>
								{props.columns.map(c => (
									<td key={c.index} className={Utils.css(c.style, c.state(e))}>{c.format(e)}</td>
								))}
							</tr>
						</Draggable>
					)).toArray()}
				</tbody>
			</table>
		);
	}
}
