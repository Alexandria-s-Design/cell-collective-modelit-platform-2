import React from "react";
import Utils from "../../utils";
import Range from "../../mixin/range";
import Editable from "./editable";

export default Range(class extends React.Component{
	onClick(e) {
		this.props.onEdit(this.getClickValue(e));
		this.props.preventDefault && e.preventDefault();
	}
	onDrag(e) {
		const f = this.getDragValue(this.props.value, e);
		Utils.drag(e => this.setState({ value: f(e), editing: true }), e => this.setState({ editing: false }) || this.props.onEdit(f(e)), "pointer");
		e.stopPropagation();
		this.props.preventDefault && e.preventDefault();
	}
	render() {
		const props = this.props;
		const { min, max, format, onEdit, maxLength } = props;
		const e = this.state.value != null ? this.state.value : min;

		return (
			<div className="sliderInput">
				<div className="track" ref="track" onPointerDown={onEdit && this.onClick.bind(this)}>
					<div>
						<div style={{left: Utils.toPercent(props.to((e - min) / (max - min)))}} onPointerDown={onEdit && this.onDrag.bind(this)}/>
					</div>
				</div>
				<Editable value={format ? format(e) : e} maxLength={ maxLength || max.toString().length} placeHolder={min} preventDefault={props.preventDefault} onEdit={onEdit &&
                    (v => onEdit(Utils.range((v = format ? format(v) : parseInt(v), isNaN(v) ? e : v), min, max)))}/>
				{props.units}
			</div>
		);
	}
});
