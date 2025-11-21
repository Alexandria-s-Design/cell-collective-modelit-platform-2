import {Seq} from 'immutable';
import JSZip from 'jszip';
import Utils from '../../../utils';
import ExperimentBaseView from '../experimentBaseView';

const download = (props, state) => {
  const downloadLocal = ({selected: {Experiment: experiment}, model: {OutputRange: ranges, Component: components}, modelState}) => {
      const zip = new JSZip();
      const f = (e, r, n) => {
          let p = e.first();
          p && (p = p.data) && zip.file("(" + r.from + "-" + r.to + ")" + n + ".csv", [e.map(e => e.component.name).join()].concat(p.map((_, i) => e.map(e => e.data[i].toFixed(1)).join())).join("\r\n"));
      };
      Seq(state && state.get("analysis")).forEach((v, k) => {
          const s = Seq(v).map((v, k) => ({ component: components[k], data: v })).filter(e => e.component).sortBy(e => e.component.name.toLowerCase()).cacheResult();
          const range = ranges[k];
          f(s.filter(e => e.component.isExternal), range, "inputs");
          f(s.filterNot(e => e.component.isExternal), range, "outputs");
      });
      zip.generateAsync({ type: "blob" }).then(e => Utils.downloadBinary(experiment.name + ".zip", e));
  };

  const {selected: {Experiment: e}} = props;

  return Seq(state.get("analysis")).size > 0 && (e.bits && state.get("bitsAvailable") !== false ? () => props.actions.download("simulate/dynamic/export/" + e.Persisted, e.name + " (bits).zip") : downloadLocal.bind(null, props));
};

export default ExperimentBaseView({
	experimentType: "",
	download
});