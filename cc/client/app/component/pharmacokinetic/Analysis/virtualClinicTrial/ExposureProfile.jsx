import React from "react";
import view from "../../../base/view";
import Panel from "../../../base/panel";
import Application from '../../../../application';
import util from "../../../../utils";
import d3toPNG from "d3-svg-to-png";
import randomColor from "randomcolor";
import { quantile } from "d3-array";
import { capture, CaptureModal } from "../../../../capture";
import { FormattedMessage } from "react-intl";
import { format as formatDate } from "date-fns";
import AdvancedGraphPanel from "./AdvancedGraphPanel";
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartsMore from 'highcharts/highcharts-more';
import exporting from 'highcharts/modules/exporting';
import offlineExporting from 'highcharts/modules/offline-exporting';
import { createReferenceData } from './ProfileComparison'

HighchartsMore(Highcharts)
exporting(Highcharts);
offlineExporting(Highcharts);


export const handleSaveChart = (modelState) => {
	const highchartsRef = modelState.getIn(["ExposureProfile", "highchartsRef"]);
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

class Content extends React.Component {
	constructor(props) {
		super(props);
	}

	highchartsRef = React.createRef();

	componentDidMount() {
		this.props.actions.onEditModelState(["ExposureProfile", "highchartsRef"], this.highchartsRef);
	}

	getYAxisOptions = (thresholds, useLogForYAxis) => {
		const compartment = this.props.selected.PKCompartment;
		const compartmentCheckboxValue = this.props.modelState.getIn(["simulation", "compartmentCheckbox"]);
		const yAxisName = compartmentCheckboxValue.size > 0 ? compartmentCheckboxValue.get(compartment.id, false) : ''
		const yAxisLabel = yAxisName != '' ? `AUC_${yAxisName}_` + compartment.name + ' [hr . mg/mL]' : ''

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
		const thresholds = props.modelState.getIn(["ExposureProfile", "threshold"]) || []
		const useLogForYAxis = props.modelState.getIn(["ExposureProfile", "UseLogForYAxis"]) || false
		const perc10 = []
		const perc20 = []
		const perc30 = []
		const perc40 = []
		const mean = []

		const auc10 = []
		const auc20 = []
		const auc30 = []
		const auc40 = []
		const auc50 = []

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

			let integral10 = 0
			let integral90 = 0
			let integral20 = 0
			let integral80 = 0
			let integral30 = 0
			let integral70 = 0
			let integral40 = 0
			let integral60 = 0
			let integral50 = 0
			for (let i = 2; i < data.time.length; i++) {
				const dt = data.time[i] - data.time[i - 1]
				integral10 += (perc10[i][0] + perc10[i - 1][0]) * dt
				integral90 += (perc10[i][1] + perc10[i - 1][1]) * dt

				auc10.push([integral10, integral90])

				integral20 += (perc20[i][0] + perc20[i - 1][0]) * dt
				integral80 += (perc20[i][1] + perc20[i - 1][1]) * dt

				auc20.push([integral20, integral80])

				integral30 += (perc30[i][0] + perc30[i - 1][0]) * dt
				integral70 += (perc30[i][1] + perc30[i - 1][1]) * dt

				auc30.push([integral30, integral70])

				integral40 += (perc40[i][0] + perc40[i - 1][0]) * dt
				integral60 += (perc40[i][1] + perc40[i - 1][1]) * dt

				auc40.push([integral40, integral60])

				integral50 += (mean[i] + mean[i - 1]) * dt

				auc50.push(integral50)
			}

		}

		const areaRangeData = [
			{
				name: '0.1 - 0.9',
				type: 'arearange',
				data: auc10
			},
			{
				name: '0.2 - 0.8',
				type: 'arearange',
				data: auc20
			},
			{
				name: '0.3 - 0.7',
				type: 'arearange',
				data: auc30
			},
			{
				name: '0.4 - 0.6',
				type: 'arearange',
				data: auc40
			},
			{
				name: 'Mean',
				type: 'line',
				data: auc50
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
			series: areaRangeData
		};

		const showFormattedMessage = e && compartment != undefined && !e.get("visibility").some(e => e) && !['concentration', 'amount'].includes(e.getIn(["compartmentCheckbox"]).get(compartment.id));

		return (
			<Panel {...props.view} >
				{showFormattedMessage ? (
					<div className="message">
						<FormattedMessage id="ModelsView.graphView.labelSelectInternalorExternalComponents" defaultMessage="Select Concentration or Amount to be displayed in Graph" />
					</div>
				) : (
					<React.Fragment>
						<CaptureModal view={props.view} onClose={() => { triggerRender(props.view) }} />
						<HighchartsReact
							highcharts={Highcharts}
							options={options}
							ref={this.highchartsRef}
						/>
						<div>
							<button type="button" onClick={() => props.cc.showDialog(AdvancedGraphPanel, {
								cc: props.cc,
								thresholds: props.modelState.getIn(["ExposureProfile", "threshold"]),
								actions: props.actions,
								modelState: props.modelState,
								panelName: "ExposureProfile"
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
