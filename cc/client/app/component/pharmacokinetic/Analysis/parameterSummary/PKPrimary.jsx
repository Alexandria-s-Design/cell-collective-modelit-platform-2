import React from "react";
import view from "../../../base/view";
import Panel from "../../../base/panel";
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsBellCurve from 'highcharts/modules/histogram-bellcurve';
import { findLastIndex, isNil } from 'lodash'
import { Seq } from "immutable";

HighchartsBellCurve(Highcharts);

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

		options(key, props) {
			const data = props.modelState.getIn(["simulation", "data"]).get(key) || [];
			const chartTitle = key;
			console.log(key, data)
			return {
				title: {
					text: chartTitle,
					useHTML: true,
				},
				xAxis: [{
					// categories: values.xs,
					title: {
						text: ''
					},
					// gridLineWidth: 1,
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
				series: [
					{
						type: 'histogram',
						xAxis: 1,
						baseSeries: 1
					},
					{
						data: data,
						visible: false,
					},
					// {
					// 	type: 'spline',
					// 	name: 'Mean',
					// 	data: runningMean(data, 3),
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
			const data = props.modelState.getIn(["simulation", "data"])
			const anyData = data && data.size > 0;
			const dataKeys = props.modelState.getIn(["simulation", "data"]).keySeq().toArray();
			const compartment = this.props.selected.PKCompartment;
			const populations = [];
			const parameters = [];
			const compartment_rates = [];
			
			if (anyData) {
			Seq(props.model.Rate).forEach(rate => {
				if (rate.fromCompartment === compartment) {
					compartment_rates.push(rate.id)
				}
			})

			Seq(props.model.Parameter).forEach(parameter => {
				if (compartment_rates.includes(parameter.rateId) || parameter.compartment === compartment) {
					parameters.push(parameter)
				}
			})

			Seq(props.model.Population).forEach(v => {
				if (v.type === "body-weight") {
					populations.push("bodyWeight")
				} else if (v.type === "age") {
					populations.push("age")
				}
			})
		}


			return (
				<Panel {...props.view}> 
					<div style={{display: "flex", flexWrap: "wrap", flexBasis: "33.333%"}}>
						{populations.map(
							v => dataKeys.includes(v) && <HighchartsReact highcharts={Highcharts} options={this.options(v, props)} containerProps={{ style: {width: '33%', height: '200px'}}}/>
						)}
						{parameters.map(
							v => dataKeys.includes(v.name) && <HighchartsReact highcharts={Highcharts} options={this.options(v.name, props)} containerProps={{ style: {width: '33%', height: '200px'}}}/>
						)}
					</div>
				</Panel>
			)
	}
}


export default view(Content, null, null);
