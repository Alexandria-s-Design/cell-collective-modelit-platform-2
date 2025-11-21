import React from "react";
import ReactDom from "react-dom";
import { Seq } from "immutable";
import CrossFilter from "crossfilter2";
import { scaleLinear, curveCardinal } from "d3";
import DC from "dc";
import Utils from "../../../utils";

const fil = (fn, a) => {
	const f = [];
	for (let i = 0; i < a.length; i++) {
		if (fn(a[i])) {
			f.push(a[i]);
		}
	}
	return f;
}
export default class Graph extends React.Component {
	update({data, metabolites, selected}) {
		data = fil(d => selected.includes(d.species), data);
		this.data = CrossFilter(data);
		const dim = this.data.dimension(d => [d.species, +d.time]);
		// dim.filterFunction(d => selected.includes(d[0]));
		const group = dim.group().reduceSum(d => +d.value); 

		const yMin = +dim.bottom(1)[0]?.value;
		const yMax = +dim.top(1)[0]?.value;
		const selectedMetUnit = Seq(metabolites).find(metabolite => selected.includes(metabolite.name) || selected.includes(metabolite.species_id)).unitDefinitionId;
		const yAxisLabel = `Concentration [${selectedMetUnit ? this.props.UnitDefinition[selectedMetUnit]?.name : undefined}]`;
		
		this.self
			// .margins({top: 5, left: 24, right: 12, bottom: 30})
			.chart(c => new DC.lineChart(c).curve(curveCardinal))
			.x(scaleLinear().domain([0, this.props.xMax]))
			.y(scaleLinear().domain([yMin, yMax]))
			.brushOn(false)
			.xAxisLabel(`Time [seconds]`)
			.yAxisLabel(yAxisLabel)
			.clipPadding(10)
    	.elasticY(true)
			.dimension(dim)
			.group(group)
			.mouseZoomable(true)
			.seriesAccessor(d => d.key[0]) // type of species
			.keyAccessor(d => d.key[1]) // time
			.valueAccessor(d => d.value)
			.render();
	}
	resize({parentWidth, parentHeight}) {
		this.self.width(parentWidth).height(parentHeight + 12).legend(DC.legend().x(parentWidth - 150).y(10).itemHeight(12).gap(3)).render();
	}
	shouldComponentUpdate(props) {
		return this.props.data !== props.data || this.props.xMax !== props.xMax || this.props.selected!== props.selected || this.props.parentWidth !== props.parentWidth || this.props.parentHeight !== props.parentHeight;
	}
	componentDidMount() {
		this.self = DC.seriesChart(ReactDom.findDOMNode(this));

		this.update(this.props);
		this.resize(this.props);
	}
	UNSAFE_componentWillReceiveProps(props) {
		(this.props.parentWidth !== props.parentWidth || this.props.parentHeight !== props.parentHeight) && this.resize(props);
		(this.props.data !== props.data || this.props.xMax !== props.xMax || this.props.selected !== props.selected) && this.update(props);
	}
	render() {
		return (<div/>);
	}
}
