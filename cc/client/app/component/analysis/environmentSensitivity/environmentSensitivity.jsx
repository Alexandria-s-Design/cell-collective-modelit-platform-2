import React from 'react';
import ReactDom from 'react-dom';
import Utils from '../../../utils';
import Add from '../../../action/add';
import Update from '../../../action/update';
import Environment from '../../../entity/Environment';
import ExperimentActivity from '../../../entity/ExperimentActivity';
import Application from '../../../application';
import view from '../../base/view';
import Panel from '../../base/panel';
import Options from '../../base/options';
import { Seq, Map } from 'immutable';
import CrossFilter from 'crossfilter2';
import {quantile} from 'd3';
import DC from 'dc';
import { FormattedMessage } from 'react-intl';


const getExperimentState = ({selected: {Experiment: experiment}, modelState}) => {
  return modelState.getIn(['Experiment', 'EnvironmentSensitivity', experiment && experiment.id, 'environmentSensitivity']) || {};
}

const getExperimentStateInputs = (...args) => {
  const { inputs, outputs } = getExperimentState(...args);
  if(outputs && outputs.headers && outputs.headers.length > 0){
    return inputs;
  }
}

class Content extends React.Component {
  setData(props){
    const {model: {Component: components}} = props;
    const d = getExperimentStateInputs(props);
    if(this.self){
        let chartdata;
        if(d){
            const {data, headers} = d;
            chartdata = [];
            Seq(data).forEach(e=>e.forEach((e,k)=>chartdata.push({cId:headers[k],v:e})));
        }
        if(!chartdata) chartdata = [];
        const ndx   = CrossFilter(chartdata);
        const dim = ndx.dimension(function(d) {return components[d.cId] ? components[d.cId].name : d.cId+"";});
        const group     = dim.group().reduce(
                (p,{v}) => (
                  p.push(v),p
                ),
                (p,{v}) => (
                  p.splice(p.indexOf(v), 1),p
                ),
                () =>([])
              );


        return this.self
          .dimension(dim)
          .group(group);
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
      return getExperimentState(this.props) !== getExperimentState(props)
              || this.props.parentWidth !== props.parentWidth
              || this.props.parentHeight !== props.parentHeight;
  }
  initChart(e){
      this.selfEl = e;
      this.self = e && DC.boxPlot(ReactDom.findDOMNode(e))
          .margins({top: 7, left: 34, right: 8, bottom: 25})
          .elasticY(true)
          .elasticX(true)
          .renderLabel(true)
          .label(({x}) => {
            const axisitems = this.self.x().domain().length;
            const axisw = this.self.xAxisLength();
            const textw = 50; //FIXME: add real calculation of text width

            //text would not fit
            if(axisw / axisitems < textw)
              {return "";}
            return x;
          });
      this.setData(this.props);

      this.resize(this.props);
  }
  UNSAFE_componentWillReceiveProps(props) {
      (this.props.parentWidth !== props.parentWidth || this.props.parentHeight !== props.parentHeight) && this.resize(props);
      (getExperimentState(this.props) !== getExperimentState(props) || this.props.entities !== props.entities) && this.processData(props);
  }
  render() {
        const data = getExperimentStateInputs(this.props);

        let msg;
        if(!data){
            msg = (<FormattedMessage id="ModelDashboard.environmentSensitivity.LabelPleaseSpecifyInternalComponenttoOptimize" defaultMessage="Run experiment to generate data"/>);
            
        }

        return (
            <Panel {...view}>
              {msg && (<div className="message chart-sens">{msg}</div>)}
              {!msg && (<div ref={(e)=>{this.initChart(e);this.processData(this.props)}}/>)}
            </Panel>
        );
    }
}

export const generateEnvironmentalValues = (props,self) => {
  const {model} = props;
  const retData = [];
  const retHeaders = ['Component', '25quantile', '75quantile'];

  const d = getExperimentStateInputs(props);
  if(d){
    const {data, headers} = d;
    const componentsData = Seq(headers).map(e => []).toArray();
    Seq(data).forEach(e=>e.forEach((e,k)=>componentsData[k].push(e)));

    componentsData.forEach((e,k)=>{
      const comp = model.Component[headers[k]];
      if(!comp)
        {return;}

      e.sort((a,b) => a-b);
      const q1 = Math.round(quantile(e, 0.25));
      const q3 = Math.round(quantile(e, 0.75));

      retData.push([comp, q1, q3]);

    });
  }

  return {data: retData, headers: retHeaders};
}


const Actions = (props,_2,self) => {
  const {selected: {Experiment: experiment, Environment: environment}, model, actions: {batch}} = props;

  const applyToEnvironment = () => {
    const {data, headers} = generateEnvironmentalValues(props, self);

    const actions = [];
    if(data.length){
      const environment = new Environment({name : Application.defName(model.Environment, "New Env ")});
      actions.push(new Add(environment, true));

      data.forEach(([comp, min, max])=>{
        const experimentActivity = Seq(comp.experimentActivities).filter(e=>e.parent == environment).first();
        if(!experimentActivity){
          actions.push(new Add(new ExperimentActivity({parent: environment, component: comp, min, max})));
        }else{
          actions.push(new Update(experimentActivity, 'min', min));
          actions.push(new Update(experimentActivity, 'max', max));
        }
      });
    }
    batch(actions);
  }

  return {
      download: self && self.selfEl && (() => Utils.downloadSVG(experiment.name, ReactDom.findDOMNode(self.selfEl))),
      apply: {
        action: self && self.selfEl && applyToEnvironment,
        title: 'Apply to new environment'
      }
    };
};


export default view(Content, null, Actions);
