import React from "react";
import Utils from "../../utils";
import Range from "../../mixin/range";
import Editable from "./editable";

export default Range(class extends React.Component{
	onClick(e) {
		const v = this.props.value;
		const c = this.getClickValue(e);
		this.props.onEdit(Math.abs(c - v.min) < Math.abs(c - v.max) ? "min" : "max", c);
		this.props.preventDefault && e.preventDefault();
	}
	onDrag(p, e) {
		const v = this.props.value;
		const f = this.getDragValue(v[p], e);
		const x = e.clientX;
		let dir = v.min !== v.max && p;
		const get = e => Math[dir](f(e), v[dir === "min" ? "max" : "min"]);
		Utils.drag(e => {
			if (dir || (e.clientX !== x && (dir = e.clientX < x ? "min" : "max"))) {
				const s = {};
				s[dir] = get(e);
				const o = dir === "min" ? "max" : "min";
				s[o] = v[o];
				this.setState({ value: s, editing: true });
			}
		}, e => this.setState({ editing: false }) || (dir && this.props.onEdit(dir, get(e)), "pointer"));
		e.stopPropagation();
		this.props.preventDefault && e.preventDefault();
	}
	render() {
		const props = this.props;
		const edit = props.onEdit;
		const e = this.state.value;
		const min = props.to((e.min - props.min) / (props.max - props.min));
		const max = props.to((e.max - props.min) / (props.max - props.min));

		const rEdit = (p, f) => (<Editable value={e[p]} def={props[p + "Def"]} maxLength={(props.ext || props.max).toString().length} placeHolder={props[p]}
			onEdit={edit && (v => edit(p, f((v = parseInt(v), isNaN(v) ? e[p] : v))) )}
			onPress={edit && (v => {
				const _vl = v.target.value;
				edit(p, f((v = parseInt(_vl), isNaN(_vl) ? e[p] : _vl)))
			})} />);

		return (
			<div className="sliderInput range">
				{rEdit("min", v => Utils.range(v, props.min, e.max))}
				{props.units}
				<div className="track" ref="track" onPointerDown={edit && this.onClick.bind(this)}>
					<div>
						<p style={{left: Utils.toPercent(min), right: Utils.toPercent(1 - max)}}/>
						<div style={{left: Utils.toPercent(min)}} onPointerDown={edit && this.onDrag.bind(this, "min")}/>
						<div style={{left: Utils.toPercent(max)}} onPointerDown={edit && this.onDrag.bind(this, "max")}/>
					</div>
				</div>
				{rEdit("max", v => Utils.range(v, e.min, props.ext || props.max))}
				{props.units}
			</div>
		);
	}
});
