import React from 'react';
import ReactDom from 'react-dom';
import Utils from '../../../utils';
import view from '../../base/view';
import Panel from '../../base/panel';
import Options from '../../base/options';
import { Seq, Map } from 'immutable';
import CrossFilter from 'crossfilter2';
import { scaleLinear, scaleOrdinal } from 'd3';
import DC from 'dc';
import { FormattedMessage } from "react-intl";

class Content extends React.Component {
  _getExperimentState({selected: {Experiment: experiment}, modelState}){
    return modelState.getIn(['Experiment', 'EnvironmentSensitivity', experiment && experiment.id, 'componentSensitivity']) || {};
  }
  setData(props){
    const {selected: {Experiment: experiment, Component: component}, model: {Component: components}} = props;
    const {data, rows, cols} = this._getExperimentState(props);
    if(this.self){
        let chartdata;
        if(component && data){
            if(component.isExternal){  //external
                const selectedRow = rows.indexOf(component.id);
                if(selectedRow >= 0){
                    chartdata = data[selectedRow]
                                    .map((e,k) => {
                                      const component = components[cols[k]];
                                      return {val: e, component };
                                    })
                }
            }else{
                const selectedCol = cols.indexOf(component.id);
                if(selectedCol >= 0){
                    chartdata = Seq(data).map(e=>e[selectedCol])
                                    .map((e,k) => {
                                      const component = components[rows[k]];
                                      return {val: e, component };
                                    })
                                    .toArray();
                }
            }
        }
        if(!chartdata) chartdata = [];

        const ndx   = CrossFilter(chartdata);
        const dim   = ndx.dimension((d) => (d.component ? d.component.name : "???"));
        const sumGroup  = dim.group().reduceSum((d) => d.val);

        return this.self
          .xAxisLabel((component ? (component.isExternal?'Internal ':'External ') : "")+"Components")
          .dimension(dim)
          .group(sumGroup);
    }

  }
  processData(props){
    const q = this.setData(props);
    if(q) q.render();
  }
  resize({parentWidth, parentHeight}) {
      this.self && this.self.width(parentWidth).height(parentHeight + 12).render();
  }
  shouldComponentUpdate(props) {
      return this._getExperimentState(this.props) !== this._getExperimentState(props)
              || this.props.parentWidth !== props.parentWidth
              || this.props.parentHeight !== props.parentHeight;
  }
  initChart(e, props = this.props){
      this.selfEl = e;
      this.self = e && DC.barChart(ReactDom.findDOMNode(e))
          .margins({top: 7, left: 34, right: 8, bottom: 25})
          .yAxisLabel("Correlation")
          .y(scaleLinear().domain([-1, 1]))
          .renderLabel(true)
          .label(({x}) => {
            const axisitems = this.self.x().domain().length;
            const axisw = this.self.xAxisLength();
            const textw = 50; //FIXME: add real calculation of text width

            //text would not fit
            if(axisw / axisitems < textw)
              {return "";}
            return x;
          })
          .barPadding(0.1)
          .outerPadding(0.05)
          .x(scaleOrdinal())
          .xUnits(DC.units.ordinal)
          .brushOn(false);

      this.setData(props);

      this.resize(props);
  }
  UNSAFE_componentWillReceiveProps(props) {
      (this.props.parentWidth !== props.parentWidth || this.props.parentHeight !== props.parentHeight) && this.resize(props);
      if(this._getExperimentState(this.props) !== this._getExperimentState(props) || this.props.entities !== props.entities || this.props.selected.Component !== props.selected.Component){
        if((this.props.selected.Component || {}).isExternal !== (props.selected.Component || {}).isExternal)
          {this.initChart(this.selfEl, props);}
        this.processData(props);
      }
  }
  render() {
      const {data} = this._getExperimentState(this.props);
      const {selected: {Component: component}} = this.props;

      let msg;
      if(!data){

          msg = (<FormattedMessage id="ModelDashboard.componentSensitivity.labeRunExperimenttoGenerateData" defaultMessage="Run experiment to generate data"/>);
      }else if(!component){
          msg = (<FormattedMessage id="ModelDashboard.componentSensitivity.labelSelectComponenttoShowData" defaultMessage="Select Component to show data"/>);
        
      }

      return (
          <Panel {...view}>
            {msg && (<div className="message">{msg}</div>)}
            {!msg && (<div ref={(e)=>{this.initChart(e);this.processData(this.props)}}/>)}
          </Panel>
      );
  }
}

const Actions = ({selected: { Experiment: experiment }},_2,self) => {
  let filename;
  const laName = ( experiment && (experiment.name + "_") ) || "";
  filename = `${laName}-[${new Date().toLocaleString()}]`;

  return {
    download: self && self.selfEl && (() => Utils.downloadSVG(filename, ReactDom.findDOMNode(self.selfEl)))
  }
};
const Header = ({selected: {Component: component}}) => (<span>{"Component sensitivity"+(component?(" for "+component.name):"")}</span>);

export default view(Content, Header, Actions);
