import React, { useEffect } from "react";
import ReactDom from "react-dom";
import CrossFilter from "crossfilter2";
import { scaleLinear } from "d3-scale";
import { curveCardinal } from "d3-shape";
import { quantile } from "d3-array";
import DC from "dc";
import randomColor from "randomcolor";
import view from "../../../base/view";
import Panel from "../../../base/panel";
import { FormattedMessage } from "react-intl";
import Application from '../../../../application';
import util from "../../../../utils";
import d3toPNG from "d3-svg-to-png";
import { capture, CaptureModal } from "../../../../capture";
import { format as formatDate } from "date-fns";
import AdvancedGraphPanel from "./AdvancedGraphPanel";
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts/highcharts-more'
import exporting from 'highcharts/modules/exporting';
import offlineExporting from 'highcharts/modules/offline-exporting';

HighchartsMore(Highcharts)
exporting(Highcharts);
offlineExporting(Highcharts);

const triggerRender = view => {
	view.setState({ rerender: true });
};

export const handleSaveChart = (modelState) => {
	const highchartsRef = modelState.getIn(["ProfileComparison", "highchartsRef"]);
	if (highchartsRef) {
		const chart = highchartsRef?.current?.chart;
		if (chart) {
			chart.exportChart({
				type: 'image/png',
				filename: 'chart',
			});
		}
	}
};


export const createReferenceData = (thresholds) => {
	let referenceLines = [];
	for (let i = 0; i < thresholds.length; i++) {
		const threshold = thresholds[i]
		referenceLines.push({
			color: randomColor({ format: "rgb" }),
			width: 2,
			value: threshold.value,
			label: {
				text: threshold.label,
				align: 'right',
				x: -20
			},
			dashStyle: 'Dot'
		}
		)
	}
	return referenceLines;
}


class Content extends React.Component {
	constructor(props) {
		super(props);
	}

	highchartsRef = React.createRef();

	componentDidMount() {
		this.props.actions.onEditModelState(["ProfileComparison", "highchartsRef"], this.highchartsRef);
	}

	update(props) {
		const data = this.props.modelState.getIn(["simulation", "data"]).get("mgcA")

		this.data = CrossFilter(data);
		const dim = this.data.dimension(d => +d.time);
		// dim.filterFunction(d => selected.includes(d[0]));
		const group = dim.group().reduceSum(d => +d.value);
		const yMin = +dim.bottom(1)[0].value;
		const yMax = +dim.top(1)[0].value;

		this.self
			// .margins({top: 5, left: 24, right: 12, bottom: 30})
			.chart(c => new DC.lineChart(c).curve(curveCardinal))
			.x(scaleLinear().domain([0, 200]))
			.y(scaleLinear().domain([yMin, yMax]))
			.brushOn(false)
			.xAxisLabel("Time")
			.clipPadding(10)
			.elasticY(true)
			.dimension(dim)
			.group(group)
			.seriesAccessor(d => "mgcA") // type of species
			.render();
	}
	fixSVGNS() {
		const svgel = ReactDom.findDOMNode(this.refs.self).querySelector('svg');
		svgel.setAttribute("xmlns", "http://www.w3.org/2000/svg");
		svgel.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
	}
	resize(props) {
		this.self.width(props.parentWidth).height(props.parentHeight - 10).legend(DC.legend().x(props.parentWidth - 150).y(10).itemHeight(12).gap(3)).render();
		this.fixSVGNS();
	}
	shouldComponentUpdate(props) {
		// const rerender = props.view.getState().rerender;
		// if (rerender) props.view.setState({ rerender: false });

		// return this.props.modelState.get("simulation") !== props.modelState.get("simulation") || this.props.modelState.getIn(["simulation", "data"]) !== props.modelState.getIn(["simulation", "data"]);
		return true;
	}
	redraw() {
		this.self.redraw();
		this.fixSVGNS();
	}
	UNSAFE_componentWillReceiveProps(props) {
		// !view.equal(this.props.view, props.view) && this.resize(props);
		// let prev, visibility, { state, step } = props.simulation;
		// const f = (e, r) => r.filter(i => e.avg[i] !== undefined).map(i => ({ k: e.name, i: i, v: e.avg[i] }));

		// if ((prev = this.props.modelState.getIn(["simulation", "visibility"])) !== (visibility = props.modelState.getIn(["simulation", "visibility"])) && state && this.step <= step) {
		// 	this.data.add(visibility.filter(e => e).filterNot((_, k) => prev.get(k)).map((_, k) => state[k]).map(e => f(e, Range(0, this.step))).flatten(true).toArray());
		// 	const dim = this.self.dimension();
		// 	prev.filter(e => e).filterNot((_, k) => visibility.get(k)).map((_, k) => state[k].name).forEach(k => {
		// 		dim.filter(e => e[0] === k);
		// 		this.data.remove();
		// 	});
		// 	dim.filterAll();
		// 	this.self.transitionDuration(0).render();
		// 	this.fixSVGNS();
		// }
		// if (this.step !== step) {
		// 	this.step > step ? this.init() : this.data.add(Seq(state).filter((_, k) => visibility.get(k)).map(e => f(e, Range(this.step, step))).flatten(true).toArray());
		// 	let b, w = 100;
		// 	Math.floor(step / w) === Math.floor(this.step / w) ? (this.step ? this.redraw() : this.self.y(Linear().domain([-1, 100])).transitionDuration(0).render()) : (b = step - step % w, this.self.x(Linear().domain([b, b + w])).render());
		// 	this.step = step;
		// }
	}

	populateScatterData = (csvData, uniqueId) => {
		let scatterData = []
		let uniqueIdsArray = uniqueId

		for (let i = 0; i < uniqueIdsArray.length; i++) {
			const id = parseFloat(uniqueIdsArray[i]);
			const data = csvData
				.filter(e => e[0] === id)
				.map(e => [e[1], e[2]]);
			scatterData.push({
				type: 'scatter',
				data: data,
				id: id,
				name: `scatter_${id}`,
				marker: {
					radius: 2.5,
					symbol: 'circle'
				}
			})
		}

		return scatterData
	}

	createScatterData = () => {
		const csvDataGl = this.props.modelState.getIn(["observation", "csvData"]);
		const csvData = []

		const uniqueIds = new Set();

		for (let i = 0; i < csvDataGl?.length; i++) {
			const time = csvDataGl[i].time || 0
			const conc = csvDataGl[i].conc || 0

			const id = csvDataGl[i].id;
			uniqueIds.add(id);

			csvData.push([parseFloat(id), parseFloat(time), parseFloat(conc)])
		}
		const uniqueIdsArray = [...uniqueIds];

		let scatterData = this.populateScatterData(csvData, uniqueIdsArray);
		return scatterData;
	}


	getYAxisOptions = (thresholds, useLogForYAxis) => {
		const compartment = this.props.selected.PKCompartment;
		const compartmentCheckboxValue = this.props.modelState.getIn(["simulation", "compartmentCheckbox"]);
		const yAxisName = compartmentCheckboxValue.size > 0 ? compartmentCheckboxValue.get(compartment.id, false) : ''
		const yAxisLabel = yAxisName != '' ? `${yAxisName}_` + compartment.name + ' [mg/mL]' : ''

		if (useLogForYAxis) {
			return {
				title: {
					text: yAxisLabel + " (Log)"
				},
				plotLines: createReferenceData(thresholds),
				type: 'logarithmic',
				minorTickInterval: 0.1
			}
		} else {
			return {
				title: {
					text: yAxisLabel
				},
				plotLines: createReferenceData(thresholds),
				type: 'linear',
			}
		}
	}


	render() {

		const props = this.props;
		const compartment = props.selected.PKCompartment;
		const e = props.modelState.get("simulation");
		const data = compartment && this.props.modelState.getIn(["simulation", "data"]).get(`mg${compartment.name}`)
		const thresholds = props.modelState.getIn(["ProfileComparison", "threshold"]) || []
		const useLogForYAxis = props.modelState.getIn(["ProfileComparison", "UseLogForYAxis"]) || false
		const scatterData = this.createScatterData()

		const perc10 = []
		const perc20 = []
		const perc30 = []
		const perc40 = []
		const mean = []

		if (data) {
			for (let i = 0; i < data.time.length; i++) {
				let row = []
				for (let j = 0; j < data.value.length; j++) {
					if (useLogForYAxis) {
						if (data.value[j][i] > 0) {
							row.push(data.value[j][i])
						} else {
							row.push(null)
						}
					} else {
						row.push(data.value[j][i])
					}
				}

				row.sort()
				let q10 = quantile(row, 0.1)
				let q90 = quantile(row, 0.9)
				let q20 = quantile(row, 0.2)
				let q80 = quantile(row, 0.8)
				let q30 = quantile(row, 0.3)
				let q70 = quantile(row, 0.7)
				let q40 = quantile(row, 0.4)
				let q60 = quantile(row, 0.6)
				let q50 = quantile(row, 0.5)
				perc10.push([q10, q90])
				perc20.push([q20, q80])
				perc30.push([q30, q70])
				perc40.push([q40, q60])
				mean.push(q50)
			}
		}

		const areaRangeData = [
			{
				name: '0.1 - 0.9',
				type: 'arearange',
				data: perc10
			},
			{
				name: '0.2 - 0.8',
				type: 'arearange',
				data: perc20
			},
			{
				name: '0.3 - 0.7',
				type: 'arearange',
				data: perc30
			},
			{
				name: '0.4 - 0.6',
				type: 'arearange',
				data: perc40 && perc40
			},
			{
				name: 'Mean',
				type: 'line',
				data: mean && mean
			}
		];



		const options = {
			title: {
				text: "",
				useHTML: true,
			},
			yAxis: this.getYAxisOptions(thresholds, useLogForYAxis),
			xAxis: {
				min: 0,
				max: e.get("endTime"),
				accessibility: {
					rangeDescription: 'Time [hr]'
				}
			},
			plotOptions: {
				scatter: {
					marker: {
						radius: 2.5,
						symbol: 'circle',
						states: {
							hover: {
								enabled: true,
								lineColor: 'rgb(100,100,100)'
							}
						}
					},
					states: {
						hover: {
							marker: {
								enabled: false
							}
						}
					},
					jitter: {
						x: 0.005
					}
				}
			},
			series: [...scatterData, ...areaRangeData]

		};

		const showFormattedMessage = e && compartment != undefined && !e.get("visibility").some(e => e) && !['concentration', 'amount'].includes(e.getIn(["compartmentCheckbox"]).get(compartment.id));

		return (
			<Panel {...props.view} >
				<CaptureModal view={props.view} onClose={() => { triggerRender(props.view) }} />
				{showFormattedMessage ? (
					<div className="message">
						<FormattedMessage id="ModelsView.graphView.labelSelectInternalorExternalComponents" defaultMessage="Select Concentration or Amount to be displayed in Graph" />
					</div>
				) : (
					<React.Fragment>
						<HighchartsReact
							highcharts={Highcharts}
							options={options}
							ref={this.highchartsRef}
						/>
						<div>
							<button type="button" onClick={() => props.cc.showDialog(AdvancedGraphPanel, {
								cc: props.cc,
								thresholds: props.modelState.getIn(["ProfileComparison", "threshold"]),
								actions: props.actions,
								modelState: props.modelState,
								panelName: "ProfileComparison"
							})} className="btn btn-primary" style={{ marginRight: "5px" }}>Advanced</button>
							<button type="button" className="btn btn-primary" onClick={() => handleSaveChart(props.modelState)}>Download</button>
						</div>
					</React.Fragment>
				)}
			</Panel>
		);
	}
}

const Actions = ({ model, modelState, selected: { LearningActivity: learningActivity }, view }, ref) => {

	const e = modelState.get("simulation");

	const isLearning = Application.domain === "learning";

	let filename;
	const date_timeStamp = formatDate(new Date(), "LLL");
	if (learningActivity) {
		const laName = (learningActivity && (learningActivity.name + "_")) || "";
		filename = `${model.top.Persisted}_${laName}_[${date_timeStamp}]`;
	} else {
		filename = `${model.top.name}-(simulation)_[${date_timeStamp}]`;
	}

	const ics = view.getState().imageCaptureState || 0;

	return util.pick({
		download: e && e.get("step") && e.get("visibility").some(e => e) && (() => {
			handleSaveChart(modelState)
		}),
		copy: isLearning ? ((ics === 0) ? async () => {
			const imageData = await d3toPNG('svg', 'output', {
				download: false
			});
			capture(imageData, view, model, 'simulation', () => { triggerRender(view) });
		} : false) : null
	}, null);
};

export default view(Content, null, Actions);
