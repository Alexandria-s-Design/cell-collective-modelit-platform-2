import React from 'react';
import ReactDom from 'react-dom';
import Utils from '../../../utils';
import view from '../../base/view';
import Panel from '../../base/panel';
import Options from '../../base/options';
import Graph from './graph';


const fil = (fn, a) => {
	const f = [];
	for (let i = 0; i < a.length; i++) {
		if (fn(a[i])) {
			f.push(a[i]);
		}
	}
	return f;
}

class Content extends React.Component {
    static graph(e, ex) {
        const x = ex.x;
        const y = ex.y;
        return { x: x, y: y, data: e.get("analysis"), isSelected: x && y && y.some(e => e) };
    }
    render() {
        const { view, model, modelState, selected: { Experiment: selectedExperiment }, selected: { OutputRange: range } } = this.props;
				// console.log("ex", ex);
        // let { x, y, data, isSelected } = ex && (e = modelState.getIn(["Experiment", "", ex.id])) ? Content.graph(e, ex) : {};
				const e = selectedExperiment && modelState.getIn(["Experiment", "", selectedExperiment.id]);
				const data = e && e.get("data");
				const graphData = data && data.get('data');
        let selectedMetabolites = selectedExperiment && selectedExperiment.y.map(v => v.species_id).toArray();

				// graphData = graphData?.filter(row => selectedMetabolites.includes(row.species));
				let isSelected = selectedMetabolites && selectedMetabolites.length > 0;
				return (
            <Panel {...view} className="analysis1-phase1">
                {!isSelected && (<div className="message">Select Species to be displayed in Graph</div>)}
                {isSelected && graphData && (<Graph ref="self" data={graphData} xMax={selectedExperiment && selectedExperiment.numTimesteps} metabolites={model.Metabolite} selected={selectedMetabolites} UnitDefinition={model.UnitDefinition} />)}
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