

import React from "react";
import Utils from "../../utils";
import Range from "../../mixin/range";
import Editable from "./editable";

export default Range(class extends React.Component{

	constructor(props){
		super(props)
		this.state = {
      min: props.min,
      max: props.max,
    };
	}

	ggetValue(e) {
		const from = e => e;
		const step = 1;
		const v = this.state.min + (this.state.max - this.state.min) * from(Utils.range(e, 0, 1));
		return v - v % step;
	}

	getCClickValue(e) {
		const offset = this.state.value;
		const rect = this.refs.track.getBoundingClientRect();
		return this.ggetValue((e.clientX - rect.left - offset) / (rect.right - rect.left - 2*offset));
	}

	ggetDragValue(v, e) {
		const to = e => e;
		const sx = 1 / e.target.parentElement.offsetWidth;
		const dx = e.clientX - to((v - this.state.min) / (this.state.max - this.state.min)) / sx;
		return e => this.ggetValue(sx * (e.clientX - dx));
	}

	onClick(e) {
		const val = this.getCClickValue(e);
		!isNaN(val) && val <= this.state.max && this.props.onEdit(val);
		this.props.preventDefault && e.preventDefault();
	}

	onDrag(e) {
		const f = this.ggetDragValue(this.state.value, e);
		const fe = f(e);
		!isNaN(fe) && Utils.drag(e => this.setState({ value: f(e) , editing: true }), e => this.setState({ editing: false }) || this.props.onEdit(f(e)), "pointer");
		e.stopPropagation();
		this.props.preventDefault && e.preventDefault();
	}
	render() {
		const props = this.props;
		const {  format, onEdit, editMin, editMax } = props;
		const e = this.state.value; // != null ? this.state.value : this.state.min;

		return (
			<div className="sliderInput">

           <Editable 
				          value={format ? format(this.state.min) : this.state.min}
									preventDefault={props.preventDefault} 
									onEdit={editMin && (v => this.setState({min: v}))}
								/>
				<div className="track" ref="track" onPointerDown={onEdit && this.onClick.bind(this)}>
					<div>
						<div style={{left: Utils.toPercent(props.to((e - this.state.min) / (this.state.max - this.state.min)))}} onPointerDown={onEdit && this.onDrag.bind(this)}/>
					</div>
				</div>

				<Editable 
				          value={format ? format(this.state.max) : this.state.max}
									preventDefault={props.preventDefault} 
									onEdit={editMax && (v => this.setState({max: v}))}
								/>
			</div>
		);
	}
});