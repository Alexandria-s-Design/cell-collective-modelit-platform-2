import React from "react";
import Utils from "../../utils";

export default class Droppable extends React.Component {
	constructor(props) {
		super(props);
		this.state = { over: false };
	}
	render() {
		let over, out, drop, { children, className, onDrop } = this.props;
		if (onDrop) {
			over = () => this.setState({ over: true });
			out = () => this.setState({ over: false });
			drop = () => (this.setState({ over: false }), onDrop());
		}
		return (<div className={Utils.css("droppable", className, this.state.over && "over")} onPointerOver={over} onPointerOut={out} onPointerUp={drop}>{children}</div>);
	}
}
