import React from "react";
import { Map } from "immutable";


export default (el, didMount=()=>{}, childrens)=>{
	return class extends React.Component {
		constructor(props) {
			super(props);
			this.state = {style: props.style || {}, props: {}};
		}
		componentDidMount() {
			didMount(this);
		}
		setStyle(s){
			this.setState({style:s});
		}
		render() {
			const props = Map(this.props).set("style", this.state.style).merge(this.state.props || {}).set("ref", "self").map((v)=>(typeof v === "function" ? v.bind(undefined, this) : v));
			return React.createElement(el, props.toObject(),childrens);
		}
	};
};