import React from "react";
import { Seq } from "immutable";
import Options from "../base/options";
import RangeInput from "../base/rangeInput";
import Experiment from "../../entity/Experiment";
import OutputRange from "../../entity/outputRange";
import { FormattedMessage } from "react-intl";

export default class OutputRangesControl extends React.Component {
	render() {
		const { selected: { Experiment: e }, step, actions } = this.props;
		const editable = !e.userId;
		const max = Seq(e.ranges).map(e => e.to).max() || 0;
		const format = (e, f) => (<RangeInput max={Math.max(100, max)} ext={Experiment.maxRunTime} value={{ min: e.from, max: e.to }} minDef={e._from} maxDef={e._to} preventDefault="true" onBlur={f} onEdit={((p, v) => actions.onEdit(e, p === "min" ? "from" : "to", v))}/>);
		const creator = () => {
			let m, r = new OutputRange(e.ranges ? (m = Seq(e.ranges).minBy(e => e.from).from, { parent: e, from: Math.max(0, m - step), to: Math.max(step, m) }) : { parent: e, from: Experiment.transientTime, to: Experiment.runTime });
			r._from = r.from;
			r._to = r.to;
			return r;
		};

		return (
			<dl>
				<dt>
					<FormattedMessage id="ModelDashBoard.AnalysisExperimentSettingsView.LabelOutputRange" defaultMessage="Output Range"/>
				</dt>
				<Options className="range" propertyName="Output Range" get={e => Seq(e).sortBy(e => e.from).map(e => "(" + e.from + "-" + e.to + ")").join(", ")} value={e.ranges} options={Seq(e.ranges).sortBy(e => e.from)} enabled={editable}
					editable={editable} onAdd={() => actions.onAdd(creator(), true)} onRemove={e => actions.onRemove(e)} format={format}/>
			</dl>
		);
	}
}

OutputRangesControl.defaultProps = { step: 100 };