import React from "react";
import { TransitionGroup, Transition } from "react-transition-group";
import { Seq } from "immutable";
import Utils from "../../utils";
import view from "../base/view";
import Panel from "../base/panel";
import Scrollable from "../base/scrollable";
import TransitionItem from "../base/transitionItem";
import Draggable from "../base/draggable";
import Editable from "../base/editable";
import Regulator from "../../entity/Regulator";
import Condition from "../../entity/Condition";
import ConditionSpecies from "../../entity/ConditionSpecies";
import SubCondition from "../../entity/SubCondition";
import SubConditionSpecies from "../../entity/SubConditionSpecies";
import ccbooleananalysis from "ccbooleananalysis";

class Content extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	formatExpression(expr){
		expr = expr.replace(/(∧|&&|\b(and)\b|&)/gi, " AND ").replace(/(¬|~|!|\b(not)\b)/gi, "NOT ").replace(/(∨|\b(or)\b)|\b(\|)\b|(\|\|)/gi, " OR ").replace(/(\.)|(\/)/gi, "").replace(/[^A-Za-z0-9\(\)\s]/gi, "_");
		return expr;
	}

	onCompare() {
		const biologic = this.props.selected.Biologic;
		let exprEquality = false;
		if (biologic && this.state.value) {
			let curr_expr = biologic.expression(e => e.name);
			let user_expr = this.state.value;
			curr_expr = this.formatExpression(curr_expr);
			user_expr = this.formatExpression(user_expr);
			if (curr_expr) {
				try {
					exprEquality = ccbooleananalysis.compareBooleansSAT(curr_expr, user_expr);
				}
				catch (_) {
					exprEquality = false;
				}
			}
		}
		return exprEquality;
	}
	setValue(evt){
		this.setState({ value : evt});
	}

	UNSAFE_componentWillReceiveProps(props) {
		this.props.selected.Biologic !== props.selected.Biologic && this.refs.scrollable.setPosition(0);
	}
	shouldComponentUpdate(props, state) {
		return this.props.selected.Biologic !== props.selected.Biologic
			|| this.props.selected.Reaction !== props.selected.Reaction
			|| this.props.entities !== props.entities
			|| this.props.hover !== props.hover
			|| !view.equal(this.props.view, props.view)
			|| this.state !== state;
	}
	render() {
		const { model, view, selected: {Biologic: biologic, Reaction: reaction}, hover, draggable, editable, actions, view: {parentWidth} } = this.props;
		const ti = { done: () => this.refs.scrollable.componentDidUpdate() };
		const interactions = biologic && biologic.interactions;
		const hovered = {};

		if (hover) {
			let e = hover.entity;
			if (e instanceof Regulator || e instanceof Condition || e instanceof ConditionSpecies || e instanceof SubCondition || e instanceof SubConditionSpecies) {
				const hc = (c, i) => "hover" + c + "_" + i;
				let i = 0, c = 0, o = {};

				for (let p = e; p.parent.parent; p = p.parent) c++;

				hover.property ? (o[hover.property] = hc(++c, 0), o[e.id] = hc(c, ++i)) : o[e.id] = hc(c, 0);
				hovered[e.className] = o;

				while (e.parent.parent) {
					e = e.parent;
					o = {};
					o[e.id] = hc(c, ++i);
					hovered[e.className] = o;
				}
			}
		}

		const style = (e, p) => {
			const h = hovered[e.className];
			return (h && (p ? h[e.id] && h[p] : h[e.id])) || "";
		};

		const tg = (v, k) => (<TransitionGroup key={k}>{v.filter(e => e).map(e => (<Transition><TransitionItem key={e.key} {...ti}>{e}</TransitionItem></Transition>))}</TransitionGroup>);
		const rChar = e => (<span key={e}>{e}</span>);

		const join = (e, a, r, f) => {
			a = a.toArray();
			const result = [];
			if (a.length) {
				e && a.length > 1 && result.push(rChar("("));
				f && result.push(f(a[0].key));
				result.push(a[0]);
				const s = e && style(e, r);
				const rs = e && e[r] ? Utils.and : Utils.or;
				for (let i = 1; i < a.length; i++) {
					result.push((<span key={"_" + a[i].key} className={s}>{rs}</span>));
					f && result.push(f(a[i].key));
					result.push(a[i]);
				}
				e && a.length > 1 && result.push(rChar(")"));
			}
			return tg(result, r);
		};

		const mType = model.modelType || "boolean";
		const speciesType = mType == "boolean" ? "component" : "gene";
		const species = {};
		const cc = e => Seq(e.conditions).find(e => e.species || cc(e));
		const hasCondition = (e) => e.conditions && Seq(e.conditions).count();
		const rType = (e, p, k) => !e[p] && (<span key={p + k} className={style(e, p)}>{Utils.not}</span>);
		const rSpecies = (e, p) => {
			const sp = e[speciesType];

			return (species[sp.id] = e) && (
				<Draggable key={e.id} onClick={actions.onSelect.bind(null, sp)} onDrag={editable && actions.onDrag.bind(null, () => draggable(sp), sp)}>
					<div className={Utils.css(e.component && e.component.isExternal ? "external" : "internal", interactions && interactions[e.componentId] && "delay", style(e, p))}>{sp.name}</div>
				</Draggable>
			)
		};
		const rSpeciess = e => join(e, Seq(e.components || e.genes).sort(ConditionSpecies.comparator).map(e => rSpecies(e)), "componentRelation", rType.bind(this, e, "form"));
		const rRegulator = e => {
			const dominants = Seq(e.type ? e.dominants : null).map(e => e.negative).filterNot(e => e.type).cacheResult();

			return (
				<span key={e.id} className={style(e)}>
					{tg([
						(dominants.size || cc(e)) && rChar("("),
						rSpecies(e, "species"),
						hasCondition(e) && (
							<span key="conditions">
								{Utils.and}
								{join(e, Seq(e.conditions).filter(e => (e.components || e.genes) || cc(e)).sort(Condition.comparator).map(c => (
									<span key={c.id} className={style(c)}>
										{tg([
											hasCondition(c) && rChar("("),
											rSpeciess(c),
											hasCondition(c) && (
												<span key="conditions">
													{tg([(c.components || c.genes) && rChar(Utils.and)])}
													{join(c, Seq(c.conditions).filter(e => (e.components || e.genes)).sort(Condition.comparator).map(sc => (
														<span key={sc.id} className={style(sc)}>
															{rSpeciess(sc)}
														</span>
													)), "subConditionRelation")}
												</span>
											),
											hasCondition(c) && rChar(")")
										])}
									</span>
								)), "conditionRelation")}
							</span>
						),
						dominants.size && (
							<span key="dominants">
								{Utils.and}
								{Utils.not}
								{join(e, dominants.sort(Regulator.comparator).map(e => negative[e.id]))}
							</span>
						),
						(dominants.size || cc(e)) && rChar(")")
					])}
				</span>
			);
		};

		const regulators = Seq(biologic ? biologic && biologic.upStreams : reaction && reaction.regulators);
		const negative = regulators.filterNot(e => e.type).sort(Regulator.comparator).map(rRegulator).toObject();
		const positive = regulators.filter(e => e.type).sort(Regulator.comparator).map(rRegulator)
		const filterSpecies = Seq(species).sortBy(e => e[speciesType].name.toLowerCase()).map(rSpecies)

		const bool = this.onCompare();

		const e = biologic ? biologic : reaction;

		return (
			<span>
				<Panel {...view} height="50%">
					<Scrollable ref="scrollable">
						{e && (
							<div key={e.id} className={Utils.css("expression hey-gtes", hover && "hovered")}>
								{
										regulators.filter(e => e.type).count() 
										? join(null, positive) 
										: Utils.count(negative) > 0 && 
										<span>
											{Utils.not}
											{"("}
											{join(null, Seq(negative))}
											{")"}
										</span>
								}

								{regulators && e.absentState && (
									<span>
										{Utils.or}
										{Utils.not}
										{"("}
										{join(null, filterSpecies)}
										{")"}
									</span>
								)}
							</div>
						)}
					</Scrollable>
				</Panel>
				<Panel {...view} height="50%"  top="50%">
					<span>
						<div>Compare Boolean function (supported operators: AND, OR, NOT, ||, &, ∨, ∧, ¬)</div><br/>
						<div className="search menu">
							<Editable placeHolder="Enter expression" onEdit={this.setValue.bind(this)} maxWidth={parentWidth-10} value={this.state.value} />
						</div><br/><br/>
						{(this.state.value !== undefined && <div >{bool ? <div className="match">Expressions Match</div> : <div className="not-match">Expressions do not match</div>}</div>)}
					</span>
				</Panel>
			</span>
		);
	}
}

export default view(Content, ({ title, selected: { Biologic: b, Reaction: r } }) => title(b || r, "Expression"));
