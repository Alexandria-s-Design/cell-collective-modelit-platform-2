import React from "react";
import ReactDom from "react-dom";
import Utils from "../../../utils";
import view from "../../base/view";
import Panel from "../../base/panel";
import {csvParse} from "d3-dsv";
import CrossFilter from "crossfilter2";
import { scaleLinear as Linear } from "d3-scale";
import DC from "dc";
import messages from "./messages"

export default (key, { placeholder } = { }) => {

	class Content extends React.Component {
		update(data, maxVal){
			const ndx = CrossFilter(data);
			const dim = ndx.dimension(d => d.Degree);
			const freq = dim.group().reduceSum(d => d.Nodes);
			const min = dim.bottom(1)[0].Degree - 1;
			const max = (maxVal > 10) ? dim.top(1)[0].Degree + 1 : 11;

			const degree_type = (key === "distribution") ? "degree" : key;

			this.self
				.dimension(dim)
				.group(freq)
				.x(Linear().domain([min, max]))
				.title(e => `${e.value} ${(e.value <= 1) ? "node" : "nodes"} with ${degree_type} of ${e.key}`)
				.compose([
					DC.barChart(this.self).dimension(dim).group(freq).x(Linear().domain([min, max])).xUnits(DC.units.ordinal).centerBar(true)
				])
				.render();
		}

		processData(props){
			let data = null;
			let maxVal = 0;
			const cachedData = props.modelState.getIn(["Topology", "data"]);
			const graphData = props.networkAnalysis[key] || (cachedData !== undefined ? cachedData[key] : null);
        
			if(graphData){
				data = csvParse(graphData);
				data.forEach(e => {
					e.Degree = parseInt(e.Degree);
					e.Nodes = parseInt(e.Nodes);
					maxVal = Math.max(maxVal, e.Degree);
				});
			}
			if(data) setTimeout(() => {this.update(data, maxVal);}, 10);
		}
		resize({parentWidth, parentHeight}) {
			this.self.width(parentWidth).height(parentHeight + 12).render();
		}
		componentWillUnmount(props){
			this.props.actions.onStartTopologyAnalysis(null, null);
		}
		shouldComponentUpdate(props) {
			return this.props.modelState.getIn(["Topology", "data"]) !== props.modelState.getIn(["Topology", "data"]) || this.props.networkAnalysis[key] !== props.networkAnalysis[key] || this.props.parentWidth !== props.parentWidth || this.props.parentHeight !== props.parentHeight || !view.equal(this.props.view, props.view);
		}
		componentDidMount() {
			const { props } = this;
			const { intl } = props;
			this.self = DC.compositeChart(ReactDom.findDOMNode(this.refs.self))
				.margins({top: 7, left: 25, right: 18, bottom: 25})
				.xAxisLabel(intl.formatMessage(messages.ModelDashBoardDegreeGraphViewLabelDegree))
				.yAxisLabel(intl.formatMessage(messages.ModelDashBoardDegreeGraphViewLabelFrequency))
				.x(Linear([0, 10]))
				.transitionDuration(0)
				.mouseZoomable(true)
				.brushOn(false)
				.ordinalColors(Utils.colors);

			this.processData(this.props);
			this.resize(this.props);
		}
		UNSAFE_componentWillReceiveProps(props) {
			(this.props.parentWidth !== props.parentWidth || this.props.parentHeight !== props.parentHeight) && this.resize(props);
			(this.props.networkAnalysis[key] !== props.networkAnalysis[key] ||
          this.props.modelState.getIn(["Topology", "data"]) !== props.modelState.getIn(["Topology", "data"])) && this.processData(props);
		}
		render() {
			let data;
			const o = this.props.modelState.getIn(["Topology", "data"]);
			data = (o !== undefined) ? o[key] : this.props.networkAnalysis[key];
			return (
				<Panel {...view}>
					{!data && !this.props.networkAnalysis[key] &&(<div className="message">{placeholder}</div>)}
					<div ref="self"/>
				</Panel>
			);
		}
	}


	const Actions = (props, ref) => {
		let data;
		const o = props.modelState.getIn(["Topology", "data"]);
		data = (o !== undefined) ? o[key] : props.networkAnalysis[key];        
		return { download: data && (() => Utils.downloadSVG("[" + props.model.name + "]" + "_" + key, ReactDom.findDOMNode(ref("self"))))};
	};

	return view(Content, null, Actions);

};
