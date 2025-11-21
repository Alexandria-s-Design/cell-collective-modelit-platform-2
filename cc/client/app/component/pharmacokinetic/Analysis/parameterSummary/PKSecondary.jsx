import React from "react";
import view from "../../../base/view";
import Panel from "../../../base/panel";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as d3 from "d3";
import { isNil } from 'lodash'


const runningMean = (vals, n) => {
	const res = [];
	if(isNil(vals) || isNil(n)) return null;
	for (let i = 0; i < vals.length; i++) {
		let sum = 0;
		for (let j = Math.max(0, i - n + 1); j <= i; j++) {
			sum += vals[j];
		}
		res.push(sum / (i - Math.max(0, i - n + 1) + 1));
	}
	return res;
}

class Content extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

		options(title, data) {
			return {
				title: {
					text: title,
					useHTML: true,
				},
				xAxis: [{
					// categories: values.xs,
					title: {
						text: ''
					},
					gridLineWidth: 1,
				}, {
					title: { text: 'Simulated value' },
					alignTicks: false,
				}],
				yAxis: {
					title: {
							text: 'Probability density'
					}
				},
				plotOptions: {
					column: {
						pointPadding: 0,
						borderWidth: 0,
						groupPadding: 0,
					},
				},
				series: [{
						type: 'histogram',
						xAxis: 1,
						baseSeries: 1
					}, {
						data: data,
						visible: false,
					},
					// {
					// 	type: 'spline',
					// 	name: 'Mean',
					// 	data: runningMean(values.ys, 3),
					// 	marker: {
					// 		enabled: false,
					// 	},
					// 	color: 'red',
					// 	lineWidth: 2,
					// }
				]
			}
	}

    render() {
			const props = this.props;        
			const compartment = this.props.selected.PKCompartment;
			const data = props.modelState.getIn(["simulation", "data"]).get(`mg${compartment?.name}`);
			console.log('secondary', data);
			const cmax = []
			const tmax = []
			if (compartment) {
				const data = props.modelState.getIn(["simulation", "data"]).get(`mg${compartment.name}`);

				data && data.value && data.value.forEach(arr => {
					let val = d3.max(arr)
					let valIdx = data.time[arr.indexOf(val)]
					cmax.push(val)
					tmax.push(valIdx)
				});
			}

			return (
				<Panel {...props.view}>
					<div style={{display: "flex", flexWrap: "wrap", flexBasis: "33.333%"}}>
						{/* <HighchartsReact highcharts={Highcharts} options={this.options("auc")} style={{width: '200px', height: '300px'}} /> */}
						{cmax.length > 0 && <HighchartsReact highcharts={Highcharts} options={this.options("cmax", cmax)} containerProps={{ style: {width: '33%', height: '200px'}}}/>}
						{tmax.length > 0 && <HighchartsReact highcharts={Highcharts} options={this.options("tmax", tmax)} containerProps={{ style: {width: '33%', height: '200px'}}}/>}
						{/* <HighchartsReact highcharts={Highcharts} options={this.options("hl")} style={{width: '200px', height: '300px'}}/> */}
					</div>
				</Panel>
			)
	}
}


export default view(Content, null, null);
