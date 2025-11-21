import React from "react";
import Utils from "../../utils";

export default class extends React.Component{
	constructor(props) {
		super(props);
		const e = this.props;
		this.state =  {
			left: Utils.toFloat(e.left),
			top: Utils.toFloat(e.top),
			width: Utils.toFloat(e.width),
			height: Utils.toFloat(e.height)
		};
	}
	render() {
		const e = this.state;
		const style = {
			left: Utils.toPercent(e.left),
			top: Utils.toPercent(e.top),
			width: Utils.toPercent(e.width),
			height: Utils.toPercent(e.height),
			zIndex: this.props.index
		};

		return (
			<div className="view" style={style}>
				<div>
					<p className={e.width > 0.2 ? "horizontal" : "vertical"}>{this.props.name}</p>
				</div>
			</div>
		);
	}
}