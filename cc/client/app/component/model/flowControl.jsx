import React from "react";
import { Seq } from "immutable";
import Utils from "../../utils";
import Application from "../../application";
import Options from "../base/options";
import RangeInput from "../base/rangeInput";
import Add from "../../action/add";
import Experiment from "../../entity/Experiment";
import Flow from "../../entity/flow";
import FlowRange from "../../entity/flowRange";
import { FormattedMessage } from "react-intl";

export default class FlowControl extends React.Component {
	render() {
		const props = this.props;
		const { model, flow, editable, actions, onChange, actions: { onEdit: edit }, parentWidth } = props;
		const flows = Seq(model.Flow);
		let copy, rFlow;

		if (flow) {
			const creator = (f, t) => {
				const e = new FlowRange({ name: Application.defName(flow.ranges, "New Range "), parent: flow, from: f, to: t });
				e._from = f;
				e._to = t;
				return e;
			};
			copy = () => {
				const e = flow.copy({ name: Application.defNameCopy(model.Flow, flow) }, ["ranges"]).toArray();
				props.onAdd(e[0].entity, e.slice(1).map(e => new Add(e.entity)));
			};

			const ranges = Seq(flow.ranges);
			const max = ranges.map(e => e.to).max() || 0;
			const range = props.range;

			const format = (e, f, s) => (
				<div>
					<dt onMouseDown={s.bind(null, e)}>{e.name}</dt>
					<RangeInput max={Math.max(100, max)} ext={Experiment.maxRunTime} value={{ min: e.from, max: e.to }} minDef={e._from} maxDef={e._to} preventDefault="true" onEdit={editable && ((p, v) => edit(e, p === "min" ? "from" : "to", v))} onBlur={f}/>
				</div>
			);

			rFlow = (
				<div>
					<dl>
						<dt>
							<FormattedMessage id="ModelDashBoard.ComponentFlowControl.LabelRange" defaultMessage="Range"/>
						</dt>
						{range && range.sortBy ? (<dd>{range.sortBy(e => e.to - e.from).map(e => e.name).join(", ")}</dd>) :
							(<Options className="range" value={range} none="Default" options={ranges.sortBy(e => e.from)} maxWidth={parentWidth - 76} enabled={flow.ranges || false} onChange={e => actions.onSelect(e || "FlowRange")}
								editable={editable} onEdit={edit} onAdd={() => props.onAddRange(creator(Math.min(Experiment.maxRunTime - props.step, max), Math.min(Experiment.maxRunTime, max + props.step)))}
								onRemove={e => actions.onRemove(e, e !== range ? range : undefined)} format={format}/>)}
					</dl>
				</div>
			);
		}

		return (
			<div className="flow">
				<dl>
					<dt>
						<FormattedMessage id="ModelDashBoard.ComponentFlowControl.LabelSimulationFlow" defaultMessage="Simulation Flow"/>
					</dt>
					<Options value={flow} options={flows.sortBy(e => e.name.toLowerCase())} maxWidth={parentWidth - 140} enabled={onChange && flows.size} onChange={onChange} editable={editable} onEdit={edit}
						propertyName="Sim Flow" onAdd={() => props.onAdd(new Flow({ name: Application.defName(model.Flow, "New Flow ") }))} onRemove={e => actions.onRemove(e, e !== flow ? flow : undefined)}/>
					{editable && (<input type="button" className="icon base-copy" disabled={Utils.enabled(flow)} title="Copy" onClick={copy}/>)}
				</dl>
				{rFlow}
			</div>
		);
	}
}

FlowControl.defaultProps = { step: 1000 };