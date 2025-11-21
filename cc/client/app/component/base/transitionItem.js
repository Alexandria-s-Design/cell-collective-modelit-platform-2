import React from "react";
import ReactDom from "react-dom";
import Utils from "../../utils";

export default class TransitionItem extends React.Component {
	transition(node, done) {
		const end = e => {
			if (!e || e.target === node) {
				node.removeEventListener(Utils.transitionEnd, end);
				done();
				this.props.done && this.props.done();
			}
		};
		node.addEventListener(Utils.transitionEnd, end);
	}
	will(type, done) {
		const e = ReactDom.findDOMNode(this);
		const s = [this.props.prefix, type].join("-");
		e.classList.add(s);
		requestAnimationFrame(() => e.classList.add([s, "active"].join("-")) | this.transition(e, done));
	}
	did(type) {
		const e = ReactDom.findDOMNode(this);
		const s = [this.props.prefix, type].join("-");
		e.classList.remove(s);
		e.classList.remove([s, "active"].join("-"));
	}
	componentWillEnter(done) {
		this.will("enter", done);
	}
	componentDidEnter() {
		this.did("enter");
	}
	componentWillLeave(done) {
		this.will("leave", done);
	}
	componentDidLeave() {
		this.did("leave");
	}
	render() {
		return React.Children.only(this.props.children);
	}
}

TransitionItem.defaultProps = { prefix: "ti" };