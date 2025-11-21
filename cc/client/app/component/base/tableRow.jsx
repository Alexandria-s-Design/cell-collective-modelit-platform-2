import React from "react";
import Cell from "./tableCell";

export default class Row extends React.Component {
	static state(editable, e) {
		return editable && !editable(e) && "readonly" || (e.id < 0 ? "new" : "");
	}
	shouldComponentUpdate(props) {
		return this.props.position !== props.position || this.props.references.some((e, i) => e !== props.references[i]) || this.props.columns.length !== props.columns.length || this.props.editing !== props.editing;
	}
	render() {
		const props = this.props;
		let { data, editing, onClick, onDoubleClick, onDrag, editable, cursor } = props;
		editable = editable ? editable(data) : true;

		return (
			<table className="selected" style={{ top: props.position, cursor: cursor || "auto" }}>
				<tbody>
					<tr className={Row.state(props.editable, data)} onClick={onClick ? onClick.bind(null, data) : () => { }} onDoubleClick={onDoubleClick ? onDoubleClick.bind(null, data) : () => { }}>
						{props.columns.map(c => (
							<Cell key={c.index} column={c} data={data} values={c.values} editing={editing && editable && c.editable && !(editing = false)} editable={editable && c.editable} onEdit={props.onEdit} onDrag={onDrag && onDrag.bind(null, data)} onBlur={props.onBlur}/>
						))}
					</tr>
				</tbody>
			</table>
		);
	}
}