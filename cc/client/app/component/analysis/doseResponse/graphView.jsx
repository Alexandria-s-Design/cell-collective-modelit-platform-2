import React from 'react';
import ReactDom from 'react-dom';
import Utils from '../../../utils';
import view from '../../base/view';
import Panel from '../../base/panel';
import Options from '../../base/options';
import Graph from './graph';

class Content extends React.Component {
    static graph(e, ex) {
        const x = ex.x;
        const y = ex.y;
        return { x: x, y: y, data: e.get("analysis"), isSelected: x && y && y.some(e => e) };
    }
    render() {
        const { view, model, modelState, selected: { Experiment: ex }, selected: { OutputRange: range } } = this.props;
        let e, valid;
        let { x, y, data, isSelected } = ex && (e = modelState.getIn(["Experiment", "", ex.id])) ? Content.graph(e, ex) : {};
        data && range && (data = data[range.id]);
        valid = x && model.Component[x.id];

        return (
            <Panel {...view} className="analysis1-phase1">
                {data && valid && !isSelected && (<div className="message">Select Components to be displayed in Graph</div>)}
                {data && valid && isSelected && (<Graph ref="self" data={data} x={x} y={y} components={model.Component} all={!range}/>)}
            </Panel>
        );
    }
}


const Actions = ({modelState, selected: { Experiment: experiment }, selected: { OutputRange: range }, actions: { onSelect } }, ref) => {
    let e, result = {};
    const { data, isSelected } = (e = experiment) && (e = modelState.getIn(["Experiment", "", e.id])) ? Content.graph(e, experiment) : {};

    let filename;
    if (experiment) {
        const ranges = experiment.validRanges.sortBy(e => e.from).cacheResult();
        ranges.size > 1 && (result.outputRange = (
            <dl>
                <dt>Output Range:</dt>
                <Options get={e => "(" + e.from + "-" + e.to + ")"} value={range} none="All" options={ranges} onChange={e => onSelect(e || "OutputRange")}/>
            </dl>
        ));
        const laName = ( experiment && (experiment.name + "_") ) || "";
		filename = `${laName}-(Analysis)-[${new Date().toLocaleString()}]`;
    }else{
		filename =  `(Analysis)-[${new Date().toLocaleString()}]`;
	}

    result.download = {action: data && isSelected && (() => Utils.downloadSVG(filename, ReactDom.findDOMNode(ref("self")))), className: "analysis3-phase2"};
    return result;
}

export default view(Content, null, Actions);
