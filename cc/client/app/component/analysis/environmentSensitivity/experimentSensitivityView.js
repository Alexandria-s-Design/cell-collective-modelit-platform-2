import JSZip from 'jszip';
import {Seq} from 'immutable';
import Utils from '../../../utils';
import Entity from '../../../entity/Entity';
import ExperimentBaseView from '../experimentBaseView';
import {generateEnvironmentalValues} from './environmentSensitivity';

const download = (props, state) => {
  const downloadLocal = (props, _2, self) => {
      const {selected: {Experiment: experiment}, model: {OutputRange: ranges, Component: components}, modelState} = props;
      if(!state || !state.get("componentSensitivity")) return;

      const genCorrMtx = () => {
        //Download
        const trName = e => components[e]&&components[e].name||"???";

        const { data, rows, cols } = state.get("componentSensitivity");
        //generate csv table with data
        return Seq(
          [Seq([""]).concat(cols.map(trName)).join()]
        ).concat(
          Seq(data).map((row,k)=>Seq([trName(rows[k])]).concat(Seq(row).map(e=>e.toFixed(2))).join()).toArray()
        ).join('\r\n');
      }

      const genEnvironmentSens = () => {
        const {data, headers} = generateEnvironmentalValues(props, self);
        return Seq([headers.join()]).concat(data.map(e=>e.map(e=> (e instanceof Entity ? e.name : e)).join())).join('\r\n');
      };

      const zip = new JSZip();
      zip.file('ComponentSensitivityCorrelation.csv', genCorrMtx());
      zip.file('OptimalEnvironmentSettings.csv', genEnvironmentSens());
      zip.generateAsync({ type: "blob" }).then(e => Utils.downloadBinary(experiment.name + ".zip", e));
  };

  const {selected: {Experiment: e}} = props;

  return Seq(state.get("componentSensitivity")).size > 0 && downloadLocal.bind(null, props);
};

export default ExperimentBaseView({
	experimentType: "EnvironmentSensitivity",
	download
});