import React from "react";
import Utils from "../../utils";
import Edit from "../../mixin/edit";
import Entity from "../../entity/Entity";

export default Edit(class Editable extends React.Component{
	submit(value, _) {
		const props = this.props;
		value !== undefined && (value = (value === "" ? undefined : value)) != props.value && props.onEdit(value, _);
		props.onBlur && props.onBlur(_);
	}
	clear(_) {
		this.setState({ value: null });
		this.props.onEdit();
		_.preventDefault();
	}
	UNSAFE_componentWillUpdate(props, state) {
		if (state.editing) {
			if (!this.state.editing) {
				const e = document.createElement("span");
				e.classList.add("editable");
				this.props.className && this.props.className.split(/\s+/).forEach(c => e.classList.add(c));
				e.style.minWidth = this.refs.root.offsetWidth + "px";
				document.body.appendChild(this.editable = e);
			}
			this.editable.textContent = state.value || "";
		}
	}
	componentDidUpdate(_, state) {
		super.componentDidUpdate && super.componentDidUpdate.apply(this, arguments);
		state.editing && !this.state.editing && document.body.removeChild(this.editable);
	}
	componentWillUnmount() {
		this.state.editing && document.body.removeChild(this.editable);
	}
	render() {
		const { onPress, value, def, placeHolder, children, clear, preventDefault, onEdit, maxWidth, maxWidthStatic, following, multiline, className, editOnDoubleClick } = this.props;
		const edit = onEdit && this.onEdit.bind(this);
		const p = {};
		p[preventDefault ? "onMouseDown" : (editOnDoubleClick ?  "onDoubleClick" : "onClick")] = !children && edit;

		const oldDown = p.onMouseDown;
		p.onMouseDown = function(e){
			oldDown && oldDown.apply(this, arguments);
			e.stopPropagation();
		}

		let e, result = this.state.editing ? this.renderForm(e = this.state.value !== undefined ? this.state.value : (def === value ? "" : (value != null ? value : "")), { width: this.editable.offsetWidth, maxWidth: maxWidth }, Utils.css(multiline && "multiline", className), {onPointerDown: (e) => e.stopPropagation(), onKeyUp: onPress || null}) :
			(<div ref="root" className={Utils.css("editable", edit && "enabled", !((e = value) !== undefined) && "def", className, multiline && "multiline")} style={{maxWidth: maxWidthStatic || maxWidth}} 
				{...p}>
				{children && React.cloneElement(children, { onClick: edit }) || (value != null ? value : placeHolder)}{following}
			</div>
		);

		return clear ? (
			<div className={Utils.css(e && "clear")}>
				{result}
				{e && (<div className="remove" onMouseDown={this.clear.bind(this)}/>)}
			</div>
		) : result;
	}
});
