import React from "react";

export default class Draggable extends React.Component {
	static helper(e) {
		return e && (<div ref="dragging" className="dragging" style={{left: e.x, top: e.y}}>{e.helper}</div>);
	}
	onPointerDown(e) {

		const { hasDraggableChild } = this.props;

		if (hasDraggableChild) {
			e.preventDefault();
		}
		
		const x = e.clientX;
		const y = e.clientY;

		const up = () => {
			window.removeEventListener("pointerup", up);
			window.removeEventListener("pointermove", move);
		};

		const move = e => {
			const dx = e.clientX - x;
			const dy = e.clientY - y;

			if (dx * dx + dy * dy > 8) {
				up();
				this.dragged = true;
				this.props.onDrag(e.clientX, e.clientY);
			}
			e.preventDefault();
		};

		e.stopPropagation();

		this.dragged = false;
		window.addEventListener("pointerup", up);
		window.addEventListener("pointermove", move);
	}
	onClick(e) {
		!this.dragged && this.props.onClick && this.props.onClick(e);
	}
	render() {
		return React.cloneElement(React.Children.only(this.props.children), this.props.onDrag ? { onPointerDown: this.onPointerDown.bind(this), onClick: this.onClick.bind(this) } : { onClick: this.props.onClick });
	}
}

