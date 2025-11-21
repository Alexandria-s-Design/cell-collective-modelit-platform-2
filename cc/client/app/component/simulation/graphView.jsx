import React from "react";
import ReactDom from "react-dom";
import { Seq, Range } from "immutable";
import CrossFilter from "crossfilter2";
import { scaleLinear as Linear } from "d3-scale";
import { seriesChart, lineChart, legend } from "dc";
import Utils from "../../utils";
import view from "../base/view";
import Panel from "../base/panel";
import { FormattedMessage } from "react-intl";
import Application from '../../application';
import util from "../../utils";
import d3toPNG from "d3-svg-to-png";
import { capture, CaptureModal } from "../../capture";
import { format as formatDate } from "date-fns";
import DownloadControl from "./downloadControlView";

const triggerRender = view => {
	view.setState({ rerender: true });
};

class Content extends React.Component {
	init() {
		this.data = CrossFilter();
		const x = this.data.dimension(e => [e.k, e.i]);
		this.self.dimension(x).group(x.group().reduceSum(e => e.v));
	}
	fixSVGNS(){
		const svgel = ReactDom.findDOMNode(this.refs.self).querySelector('svg');
		svgel.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svgel.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");		
	}
	resize(props) {
		this.self.width(props.parentWidth).height(props.parentHeight + 12).legend(legend().x(props.parentWidth - 150).y(10).itemHeight(12).gap(3)).render();
		this.fixSVGNS();
	}
	componentDidMount() {
		this.step = 0;
		const selfel = ReactDom.findDOMNode(this.refs.self);

		this.self = seriesChart(selfel)
			.margins({top: 5, left: 24, right: 12, bottom: 30})
			.xAxisLabel("Time (Step)")
			.yAxisLabel("Activity Level")
			.chart(e => lineChart(e))
			.x(Linear().domain([0, 100]))
			.transitionDuration(0)
			.brushOn(false)
			.seriesAccessor(e => e.key[0])
			.keyAccessor(e => e.key[1])
			.valueAccessor(e => 100 * e.value)
			.ordinalColors(Utils.colors)
			.title(e => e.key[0] + ": " + (100 * e.value).toFixed(1));
		this.init();

		this.resize(this.props);
	}
	shouldComponentUpdate(props) {
		const rerender = props.view.getState().rerender;
		if( rerender ) props.view.setState({ rerender: false });

		return this.props.modelState.get("simulation") !== props.modelState.get("simulation") || !view.equal(this.props.view, props.view) || rerender;
	}
	redraw(){
		this.self.redraw();
		this.fixSVGNS();
	}
	UNSAFE_componentWillReceiveProps(props) {
		!view.equal(this.props.view, props.view) && this.resize(props);
		let prev, visibility, { state, step } = props.simulation;
		const f = (e, r) => r.filter(i => e.avg[i] !== undefined).map(i => ({ k: e.name, i: i, v: e.avg[i] }));

		if ((prev = this.props.modelState.getIn(["simulation", "visibility"])) !== (visibility = props.modelState.getIn(["simulation", "visibility"])) && state && this.step <= step) {

			this.data.add(visibility.filter(e => e).filterNot((_, k) => prev.get(k)).map((_, k) => state[k]).map(e => f(e, Range(0, this.step))).flatten(true).toArray());
			const dim = this.self.dimension();
			prev.filter(e => e).filterNot((_, k) => visibility.get(k)).map((_, k) => state[k].name).forEach(k => {
				dim.filter(e => e[0] === k);
				this.data.remove();
			});
			dim.filterAll();
			this.self.transitionDuration(0).render();
			this.fixSVGNS();
		}
		if (this.step !== step) {
			this.step > step ? this.init() : this.data.add(Seq(state).filter((_, k) => visibility.get(k)).map(e => f(e, Range(this.step, step))).flatten(true).toArray());
			let b, w = 100;
			Math.floor(step / w) === Math.floor(this.step / w) ? (this.step ? this.redraw() : this.self.y(Linear().domain([-1, 100])).transitionDuration(0).render()) : (b = step - step % w, this.self.x(Linear().domain([b, b + w])).render());
			this.step = step;
		}
	}
	render() {
		const props = this.props;
		const e = props.modelState.get("simulation");

		return (
			<Panel {...props.view} >
				<CaptureModal view={props.view} onClose={() => {triggerRender(props.view)}} />
				{e && e.get("step") && !e.get("visibility").some(e => e) && (<div className="message"><FormattedMessage id="ModelsView.graphView.labelSelectInternalorExternalComponents" defaultMessage ="Select Internal or External Components to be displayed in Graph"/></div>)}
				<div ref="self"/>
			</Panel>
		);
	}
}

const Actions = ({model, modelState, selected: { LearningActivity: learningActivity }, view }, ref) => {

	const e = modelState.get("simulation");

	const isLearning = Application.domain === "learning";
	
	let filename;
    const date_timeStamp = formatDate(new Date(), "LLL");
	if(learningActivity){
		const laName = ( learningActivity && (learningActivity.name + "_") ) || "";
		filename = `${model.top.Persisted}_${laName}_[${date_timeStamp}]`;
	}else{
		filename =  `${model.top.name}-(simulation)_[${date_timeStamp}]`;
	}

	const ics = view.getState().imageCaptureState || 0;

	return util.pick({
		downloadOption: e && e.get("step") && e.get("visibility").some(e => e) && (
			<span>
				<DownloadControl
					handleDownloadSVG={() => Utils.downloadSVG(filename, ReactDom.findDOMNode(ref("self")))}
					handleDownloadPNG={() => d3toPNG('svg', filename)}
				/>
			</span>
		),
		copy: isLearning ? ((ics === 0) ? async () => {
			const imageData = await d3toPNG('svg', 'output', {
				download: false
			});
			capture(imageData, view, model, 'simulation', () => { triggerRender(view) });
		} : false) : null}, null);
};

export default view(Content, null, Actions);
