import React from "react";
import { TransitionGroup } from "react-transition-group";
import { Transition } from "react-transition-group";
import { Seq } from "immutable";
import Utils from "../../utils";
import Scrollable from "../base/scrollable";
import TransitionItem from "../base/transitionItem";
import Draggable from "../base/draggable";
import Droppable from "../base/droppable";
import Editable from "../base/editable";
import Add from "../../action/add";
import Remove from "../../action/remove";
import Regulator from "../../entity/Regulator";
import Condition from "../../entity/Condition";
import ConditionSpecies from "../../entity/ConditionSpecies";
import SubCondition from "../../entity/SubCondition";
import ConditionGene from "../../entity/metabolic/ConditionGene";
import SubConditionGene from "../../entity/metabolic/SubConditionGene";
import Dominance from "../../entity/Dominance";
import { FormattedMessage } from "react-intl";

export default class RegulationCenterBiologic extends React.Component {
	constructor(props) {
		super(props);
		this.state = { conditionSpecies: null, dominance: null };
	}

	UNSAFE_componentWillReceiveProps(props) {
		if (this.props.selected.Biologic !== props.selected.Biologic || this.props.selected.Reaction !== props.selected.Reaction) {
			this.state.dominance && this.dominance();
			this.refs.scrollable.setPosition(0);
		}
	}
	dominance(m, e) {
		let dominance;
		if (m && (!this.state.dominance || this.state.dominance.entity !== m)) {
			const rect = e.target.getBoundingClientRect();
			const style = { right: window.innerWidth - rect.right };
			rect.top < 0.5 * window.innerHeight ? (style.top = rect.bottom) : (style.bottom = window.innerHeight - rect.top);
			dominance = { entity: m, style: style };
		}
		this.setState({ dominance: dominance });
	}
	render() {
		const props = this.props;
		const { model, modelType, positive, selected: { Biologic: biologic, Reaction: reaction }, hover, editable, actions, dropOnRegulator, dropOnComponents, dropOnCondition, renderSpecies, parentWidth } = props;
		const mType = model.modelType || modelType;
		const e = mType == "boolean" ? biologic : reaction;
		const speciesType = mType == "boolean" ? "component" : "gene"
		const positiveNum = Utils.count(positive) > 0;
		const ti = { done: () => this.refs.scrollable.componentDidUpdate() };

		const rRemove = e => editable && (<input type="button" className="icon base-close-gray" onClick={actions.onRemove.bind(null, e)}/>);

		const rRelation = (e, p, a) => (
			<TransitionGroup>
				{Utils.count(a) > 1 && (
					<Transition><TransitionItem {...ti}>
						<span>
							{" ("}
							<span className="relation" onClick={editable && actions.onEdit.bind(this, e, p, !e[p])} {...hover(e, p)}>{e[p] ? "Co-operative" : "Independent"}</span>
							{")"}
						</span>
					</TransitionItem></Transition>)}
			</TransitionGroup>
		);

		const rCondition = (e, t) => (
			<div className="condition" {...hover(e)}>
				<Editable
					className="bold"
					value={e.name}
					onEdit={editable && actions.onEdit.bind(this, e, "name")}
					maxWidth={parentWidth - 56 - (t ? 14 : 0)}>
					<Draggable
						onDrag={editable && actions.onDrag.bind(null, () => props.draggable(e, t + "Condition"), e)}>
						<b>{e.name || (t + "Condition")}</b>
					</Draggable>
				</Editable>
			</div>
		);

		const rConditionSpecies = (e, t) => {
			const rcc = () => this.setState({ conditionSpecies: null });
			const form = e.form ? "positive" : "negative";
			let key, rel = e.componentRelation ? " and " : " or ";
			const maxWidth = parentWidth - 46 - (t ? 14 : 0);
			const speciesList = e[`${speciesType}s`];
			const add = e === this.state.conditionSpecies;
			const count = Utils.count(speciesList);
			const rAdd = c => editable && (<input type="button" className={Utils.css("icon base-add-gray", c)} onClick={() => this.setState({ conditionSpecies: e })}/>);
			const isBoolean = (mType=='boolean');

			return add || count ?
				(
					<Droppable onDrop={dropOnComponents && dropOnComponents(t, e)}>
						<span className={form} onClick={editable && actions.onEdit.bind(this, e, "type", !e.type)}>{e.type ? "If/When " : "Unless "}</span>
						{add && (
							<div key="new" className="internal new">
								<Editable values={Seq(props.model[Utils.capitalize(speciesType)])
									.map(e => e.name).valueSeq()} onEdit={(n, b) => (n && !b && props.createConditionSpecies(e, t, n), (n || b) && rcc())} maxWidth={maxWidth}>
									<b>
										New {Utils.capitalize(speciesType)}
									</b>
								</Editable>
								{!props.dragging && (<div className="remove" onClick={rcc}/>)}
							</div>
						)}
						{add && count && rel}
						<TransitionGroup>
							{Seq(speciesList).sort(isBoolean ? ConditionGene.comparator : ConditionSpecies.comparator)
								.toIndexedSeq().interpose(rel)
								.map(e => (<TransitionItem key={e[speciesType] ? (key = e.id) : ("_" + key)} {...ti}>
									{e[speciesType] ? renderSpecies(e, null, maxWidth) : (<span>{e}</span>)}
								</TransitionItem>)).toArray()}
						</TransitionGroup>
						{add + count > 1 ? " are " : " is "}
						<span className={form} onClick={editable && actions.onEdit.bind(this, e, "state", !e.state)}>{e.state ? "Active " : "Inactive "}</span>
						{rRelation(e, "componentRelation", speciesList)}
						{!add && rAdd("hidden")}
					</Droppable>
				)
				:
				(
					<span>
						<Droppable className="static" onDrop={dropOnComponents && dropOnComponents(t, e)}>
							Drop {mType == "boolean" ? "Components" : "Genes"} Here
						</Droppable>
						{rAdd()}
					</span>
				);
		};

		const rDominance = e => {
			const map = Seq(e.entity.recessives || {}).mapEntries(([_, v]) => [v.positiveId, v]).toObject();
			return (
				<div className="dominance menu" style={e.style} data-fixed="true">
					<ul className={Utils.css("ul", e.style.top ? "down" : "up")}>
						<div>
							<input className="no-hover" type="button" value="All" disabled={Utils.enabled(editable && Utils.count(e.entity.recessives) !== Utils.count(positive))} onMouseDown={_ => actions.batch(positive.filterNot(p => map[p.id]).map(p => new Add(new Dominance({ positive: p, negative: e.entity }))).toArray()) || _.preventDefault()}/>
							<input className="no-hover" type="button" value="None" disabled={Utils.enabled(editable && e.entity.recessives)} onMouseDown={_ => actions.batch(Seq(e.entity.recessives).map(d => new Remove(d)).toArray()) || _.preventDefault()}/>
						</div>
						{positive.sort(Regulator.comparator).map(p => {
							const d = map[p.id];
							return (
								<li key={p.id}>
									<div className={Utils.checked(d)} onMouseDown={editable && (_ => (d ? actions.onRemove(d) : actions.onAdd(new Dominance({ positive: p, negative: e.entity }))) || _.preventDefault())}>{p.component.name}</div>
								</li>
							);
						}).toArray()}
					</ul>
				</div>
			);
		};

		return (
			<Scrollable ref="scrollable" parentHeight={props.parentHeight}>
				{e && (
					<ul key={e && e.id} className="regulation biologic">
						<div>
							{props.data.sort(Regulator.comparator).map(m => (
									<li key={m.id}>
										<div>
											{props.renderType(m, "type", "type")}
											{renderSpecies(m, "species", parentWidth - 60 - (m.type ? 0 : 62))}
											{rRemove(m)}
											{positiveNum && !m.type && (<input className={Utils.css("no-hover right", m.recessives && "bold")} type="button" value="Dominance" onClick={this.dominance.bind(this, m)} onBlur={this.dominance.bind(this, null)}/>)}
										</div>
										<Droppable onDrop={dropOnRegulator && dropOnRegulator(m)}>
										<div>
											<FormattedMessage id="ModelDashboard.RegulationCenterBiologic.Condition" defaultMessage="Conditions"/>
										</div>
											{rRelation(m, "conditionRelation", m.conditions)}
											{editable && (<input type="button" className="icon base-add" onClick={() => actions.onAdd(new Condition({
												parent: m,
												type: true,
												state: true,
												componentRelation: false,
												subConditionRelation: false
											}))}/>)}
										</Droppable>
										<ul>
											<div>
												{Seq(m.conditions).sort(Condition.comparator).map(c => (
														<li className="condition" key={c.id}>
															{rCondition(c, "")}
															{rRemove(c)}
															<br/>
															{rConditionSpecies(c, "")}
															<br/>
															<Droppable onDrop={dropOnCondition && dropOnCondition(c)}>
															<div>
																<FormattedMessage id= "ModelDashboard.RegulationCenterBiologic.subConditionRelation" defaultMessage="SubConditions"/>
															</div>	
																{rRelation(c, "subConditionRelation", c.conditions)}
																{editable && (<input type="button" className="icon base-add-gray" onClick={() => actions.onAdd(new SubCondition({ parent: c, type: true, state: true, componentRelation: false }))}/>)}
															</Droppable>
															<ul>
																<div>
																	{Seq(c.conditions).sort(Condition.comparator).map(sc => (
																			<li className="condition" key={sc.id}>
																				{rCondition(sc, "Sub")}
																				{rRemove(sc)}
																				<br/>
																				{rConditionSpecies(sc, "Sub")}
																			</li>
																	)).toArray()}
																</div>
															</ul>
														</li>
												)).toArray()}
											</div>
										</ul>
									</li>
							)).toArray()}
						</div>
					</ul>
				)}
				{this.state.dominance && rDominance(this.state.dominance)}
			</Scrollable>
		);
	}
}