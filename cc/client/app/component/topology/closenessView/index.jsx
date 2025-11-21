import React from "react";
import ReactDom from "react-dom";
import Utils from "../../../utils";
import view from "../../base/view";
import Panel from "../../base/panel";
import {csvParse} from "d3-dsv";
import CrossFilter from "crossfilter2";
import { scaleLinear as Linear } from "d3-scale";
import DC from "dc";
import { FormattedMessage } from "react-intl"
import messages from "./messages"

class Content extends React.Component {
	update(data){
		data.sort((a,b) => b.Closeness - a.Closeness);
		const ndx = CrossFilter(data);
		const dim = ndx.dimension((d, i) => [i, d.Closeness, d.Name]);
		const freq = dim.group().reduceSum(DC.pluck("Closeness"));
		this.self
			.dimension(dim)
			.group(freq)
			.x(Linear().domain([0, data.length]))
			.title(e => `Closeness Centrality [${e.key[2]} : ${e.value}]`)
			.compose([
				DC.scatterPlot(this.self).xUnits(DC.units.ordinal).dimension(dim).group(freq).colors("#d62728")
			])
			.render();
	}
	processData(props){
		let data = null;

		const cachedData = props.modelState.getIn(["Topology", "data"]);
		const graphData = props.networkAnalysis["closeness"] || (cachedData !== undefined ? cachedData["closeness"] : null);

		if(graphData){
			data = csvParse(graphData);
			data.forEach(e => {
				e.Closeness = parseFloat(e.Closeness);
			});
		}
		if(data) setTimeout(() => {this.update(data);}, 10);
	}
	resize({parentWidth, parentHeight}) {
		this.self.width(parentWidth).height(parentHeight + 12).render();
	}
	componentWillUnmount(props){
		this.props.actions.onStartTopologyAnalysis(null, null);
	}
	shouldComponentUpdate(props) {
		return this.props.modelState.getIn(["Topology", "data"]) !== props.modelState.getIn(["Topology", "data"]) || this.props.networkAnalysis.closeness !== props.networkAnalysis.closeness || this.props.parentWidth !== props.parentWidth || this.props.parentHeight !== props.parentHeight;
	}
	componentDidMount() {
		const { props } = this;
		const { intl } = props;
		this.self = DC.compositeChart(ReactDom.findDOMNode(this.refs.self))
			.margins({top: 7, left: 34, right: 8, bottom: 25})
			.xAxisLabel(intl.formatMessage(messages.ModelDashBoardModelMenuLabelNode))
			.yAxisLabel(intl.formatMessage(messages.ModelDashBoardModelMenuLabelCloseness))
			.x(Linear().domain([0, 10]))
			.transitionDuration(100)
			.mouseZoomable(true)
			.brushOn(false);

		this.processData(this.props);
		this.resize(this.props);
	}
	UNSAFE_componentWillReceiveProps(props) {
		(this.props.parentWidth !== props.parentWidth || this.props.parentHeight !== props.parentHeight) && this.resize(props);

		(this.props.networkAnalysis.closeness !== props.networkAnalysis.closeness || this.props.modelState.getIn(["Topology", "data"] )!== props.modelState.getIn(["Topology", "data"])) && 
		
		this.processData(props);
	}
	render() {
		let data;
		const o = this.props.modelState.getIn(["Topology", "data"]);
		data = (o !== undefined) ? o["closeness"] : this.props.networkAnalysis["closeness"];
		return (
			<Panel {...view}>
				{!data && (<div className="message">
					<FormattedMessage id="ModelDashBoard.PanelClossenessView.LabelInstructionPlaceholder"
						defaultMessage="Select Closeness Centrality and click run button to display the Graph"/>
					</div>)}
				<div ref="self"/>
			</Panel>
		);
	}
}

const Actions = (props, ref) => {
	let data;
	const o = props.modelState.getIn(["Topology", "data"]);
	data = (o !== undefined) ? o["closeness"] : props.networkAnalysis["closeness"];
	return { download: data && (() => Utils.downloadSVG(props.model.name + "closeness", ReactDom.findDOMNode(ref("self"))))};
};

export default view(Content, null, Actions);
