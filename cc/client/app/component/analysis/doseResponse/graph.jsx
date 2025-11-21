import React from 'react';
import ReactDom from 'react-dom';
import { Seq } from 'immutable';
import CrossFilter from 'crossfilter2';
import { scaleLinear as Linear } from 'd3';
import { scatterPlot, legend, compositeChart } from 'dc';
import Utils from '../../../utils';

export default class Graph extends React.Component {
    update({data, x, y, all, components}) {
        data = all ? Seq(data).reduce((e, v) => Seq(v).map((v, k) => v.concat(e[k])).toObject()) : data;
        y = Seq(y).filter((v) => v && data[v.id]).filter(v => components[v.id]).sortBy((v) => components[v.id].name.toLowerCase()).toOrderedMap();
        this.data = CrossFilter((data[x.id] || []).map((_, i) => ({ x: data[x.id][i], y: y.map((v) => data[v.id][i]).toArray()})));
        const dim = this.data.dimension(e => e.y.unshift(e.x) && e.y);
        const colors = Utils.colors;
        const n = colors.length;
        let i = 0;

        this.self.dimension(dim)
            .xAxisLabel(components[x.id].name + " (Activity Level)")
            .compose(y.map((v) => scatterPlot(this.self).symbolSize(3).highlightedSize(5).group(dim.group(), components[v.id].name).colors(colors[i % n]).valueAccessor(((i, e) => e.key[i]).bind(null, ++i))).toArray())
            .render();
    }
    resize({parentWidth, parentHeight}) {
        this.self.width(parentWidth).height(parentHeight + 12).legend(legend().x(parentWidth - 150).y(10).itemHeight(12).gap(3)).render();
    }
    shouldComponentUpdate(props) {
        return this.props.data !== props.data || this.props.x !== props.x || this.props.y !== props.y || this.props.parentWidth !== props.parentWidth || this.props.parentHeight !== props.parentHeight;
    }
    componentDidMount() {
        this.self = compositeChart(ReactDom.findDOMNode(this))
            .margins({top: 5, left: 24, right: 12, bottom: 30})
            .yAxisLabel("Activity Level")
            .x(Linear().domain([0, 100]))
            .y(Linear().domain([0, 100]))
            .transitionDuration(0)
            .mouseZoomable(true)
            .brushOn(false);

        this.update(this.props);
        this.resize(this.props);
    }
    UNSAFE_componentWillReceiveProps(props) {
        (this.props.parentWidth !== props.parentWidth || this.props.parentHeight !== props.parentHeight) && this.resize(props);
        (this.props.data !== props.data || this.props.x !== props.x || this.props.y !== props.y) && this.update(props);
    }
    render() {
        return (<div/>);
    }
}
