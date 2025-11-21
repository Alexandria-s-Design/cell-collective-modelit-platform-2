import React from "react";
import { TransitionGroup } from "react-transition-group";
import { Seq } from "immutable";
import Utils from "../../utils";
import Scrollable from "../base/scrollable";
import TransitionItem from "../base/transitionItem";
import Draggable from "../base/draggable";
import Droppable from "../base/droppable";
import Editable from "../base/editable";
import Regulator from "../../entity/Regulator";
import Condition from "../../entity/Condition";
import ConditionSpecies from "../../entity/ConditionSpecies";

export default class Content extends React.Component {
	UNSAFE_componentWillReceiveProps(props) {
		this.props.selected.Biologic !== props.selected.Biologic && this.refs.scrollable.setPosition(0);
	}
	render() {
		const props = this.props;
		const { selected: {Biologic: biologic}, hover, editable, actions, dropOnRegulator, dropOnComponents, dropOnCondition, renderSpecies, renderType, parentWidth } = props;
		const ti = { done: () => this.refs.scrollable.componentDidUpdate() };

		const rRelation = (e, p, a) => (
			<TransitionGroup>
				{Utils.count(a) > 1 && (
					<TransitionItem {...ti}>
						<span className="relation" onClick={editable && actions.onEdit.bind(this, e, p, !e[p])} {...hover(e, p)}>{e[p] ? Utils.and : Utils.or}</span>
					</TransitionItem>)}
			</TransitionGroup>
		);

		const rCondition = (e, t) => (
			<div className="condition" {...hover(e)}>
				<Editable value={e.name} onEdit={editable && actions.onEdit.bind(this, e, "name")} maxWidth={parentWidth - 54 - (t ? 20 : 0)}>
					<Draggable onDrag={editable && actions.onDrag.bind(null, () => props.draggable(e, t + "Condition"), e)}>
						<span>
							{e.name || (t + "Condition")}
							{editable && !props.dragging && (<div className="remove" onClick={props.remove.bind(this, e)}/>)}
						</span>
					</Draggable>
				</Editable>
			</div>);

		const rConditionSpecies = (e, t) => (
			<Droppable onDrop={dropOnComponents && dropOnComponents(t, e)}>
				{rRelation(e, "componentRelation", e.components)}
				<TransitionGroup>
					{Seq(e.components).sort(ConditionSpecies.comparator).map(e => (<TransitionItem key={e.id} {...ti}>{renderSpecies(e, null, parentWidth - 76 - (t ? 20 : 0))}</TransitionItem>)).toArray()}
				</TransitionGroup>
			</Droppable>
		);
		const rBreak = e => (<TransitionGroup>{Utils.count(e) > 1 && (<TransitionItem {...ti}><br/></TransitionItem>)}</TransitionGroup>);

		return (
			<Scrollable ref="scrollable" parentHeight={props.parentHeight}>
				{biologic && (
					<ul key={biologic.id} className="regulation compressed">
						<TransitionGroup>
							{props.data.sort(Regulator.comparator).map(m => (
								<TransitionItem key={m.id} {...ti}>
									<li>
										<Droppable onDrop={dropOnRegulator && dropOnRegulator(m)}>
											{renderType(m, "type", "type")}
											{rRelation(m, "conditionRelation", m.conditions)}
											{renderSpecies(m, "species", parentWidth - 52)}
										</Droppable>
										<ul>
											<TransitionGroup>
												{Seq(m.conditions).sort(Condition.comparator).map(c => (
													<TransitionItem key={c.id} {...ti}>
														<li>
															<Droppable onDrop={dropOnCondition && dropOnCondition(c)}>
																{renderType(c, "form", "state")}
																{rRelation(c, "subConditionRelation", c.conditions)}
																{rCondition(c, "")}
															</Droppable>
															{rBreak(c.components)}
															{rConditionSpecies(c, "")}
															<ul>
																<TransitionGroup>
																	{Seq(c.conditions).sort(Condition.comparator).map(sc => (
																		<TransitionItem key={sc.id} {...ti}>
																			<li>
																				<div>
																					{renderType(sc, "form", "state")}
																					{rCondition(sc, "Sub")}
																				</div>
																				{rBreak(sc.components)}
																				{rConditionSpecies(sc, "Sub")}
																			</li>
																		</TransitionItem>
																	)).toArray()}
																</TransitionGroup>
															</ul>
														</li>
													</TransitionItem>
												)).toArray()}
											</TransitionGroup>
										</ul>
									</li>
								</TransitionItem>
							)).toArray()}
						</TransitionGroup>
					</ul>
				)}
			</Scrollable>
		);
	}
}