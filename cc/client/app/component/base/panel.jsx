import React from "react";
import ReactDOM from "react-dom";
import Immutable from "immutable";

import Utils from "../../utils";
import { fullHeight } from "../../util/dom";

export default class Panel extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			internalHeight: 0
		};
		this.container = React.createRef();
	}

	getHeight() {
		return this.container.current ? fullHeight(this.container.current) : 0;
	}

	componentDidUpdate() {
		if (this.props.height === "fit") {
			// check if height of internal contents has changed
			let height = 0;
			React.Children.forEach(this.props.children, (_, idx) => {
				const ref = this.refs[idx];
				
				const domNode = (ref instanceof React.Component ? ReactDOM.findDOMNode(ref) : ref);
				if (domNode) height += fullHeight(domNode);
			});

			if (this.state.internalHeight !== height) {
				this.setState({
					internalHeight: height
				}, () => {
					if (this.props.height === "fit" && this.props.fitOptions && typeof(this.props.fitOptions.heightChanged) === 'function') {
						this.props.fitOptions.heightChanged(this.getHeight());
					}
				});
			}
		}
	}

	render() {
		const props = this.props;
		const width = Utils.toFloat(props.width) * props.parentWidth;
		const title = props.title;

		if (!["%", "px"].includes(props.units)) {
			throw new Error("Measurement units for <Panel> must be either % or px.");
		}

		let heightVal = 0;
		let heightPercent = 0;
		if (props.height === "fit") {
			heightVal = this.state.internalHeight || 0;
			heightPercent = (this.getHeight() / props.parentHeight) * 100;
		} else {
			heightVal = props.height;
			
			if (props.units === "%") heightPercent = heightVal;
			else heightPercent = (heightVal / props.parentHeight) * 100; // props.units === "px"
		}

		const height = Utils.toFloat(heightPercent) * props.parentHeight - (title ? 24 : 0) + (props.className && props.className.split(" ").indexOf("bar") >= 0 ? 6 : 0);

		const p = new Immutable.Map({
			persist: props.persist,
			parentWidth: width,
			parentHeight: height,
			addListener: props.addListener,
			removeListener: props.removeListener
		});

		const extraProps = props.height === "fit" ? (idx) => ({ref: idx}) : () => ({});

		return !(width < props.minWidth) && !(width >= props.maxWidth) && !(height < props.minHeight) && !(height >= props.maxHeight) && (
			<div className={Utils.css("panel", props.className)} style={{left: props.left, top: props.top, width: props.width, height: heightVal}} ref={this.container}>
				{title && (<div className="head">{typeof(title) == "function" ? title(width, height) : title}</div>)}
				<div className="content">
					{React.Children.map(props.children, (e, idx) => (e || false) && (typeof(e.type) == "string" ? React.cloneElement(e, extraProps(idx)) : React.cloneElement(e, p.merge(extraProps(idx)).toObject())), this)}
				</div>
			</div>
		);
	}
}

Panel.defaultProps = { left: 0, top: 0, width: "100%", height: "100%", units: "%" };