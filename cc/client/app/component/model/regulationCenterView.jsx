import React from "react";
import { Seq } from "immutable";
import Utils from "../../utils";
import view from "../base/view";
import Panel from "../base/panel";
import Draggable from "../base/draggable";
import Droppable from "../base/droppable";
import Checkbox from "../base/checkbox";
import Biologic from "./regulationCenterBiologic";
import Compressed from "./regulationCenterCompressed";
import Add from "../../action/add";
import Remove from "../../action/remove";
import Update from "../../action/update";
import Entity from "../../entity/Entity";
import Component from "../../entity/Component";
import Regulator from "../../entity/Regulator";
import Condition from "../../entity/Condition";
import Dominance from "../../entity/Dominance";
import ConditionSpecies from "../../entity/ConditionSpecies";
import SubCondition from "../../entity/SubCondition";
import SubConditionSpecies from "../../entity/SubConditionSpecies";
import ConditionGene from "../../entity/metabolic/ConditionGene";
import SubConditionGene from "../../entity/metabolic/SubConditionGene";
import { FormattedMessage } from 'react-intl';
import Persist from "../../mixin/persist";

import Gene from "../../entity/metabolic/Gene";
import utils from "../../utils";
import { knockOutReaction } from "../../component/metabolic/Model/ReactionsView"

export const RegulatoryMechanismViewBuilder = ({
	modelType = "boolean",
	viewType  = "Biologic"
} = { }) => {
	const rDroppable = ({ selected: { Biologic: biologic, Reaction: reaction }, dragging, actions }, t, l) => {
		const addRegulator = () => {
			const adding = new Regulator({
				type: t,
				conditionRelation: false,
				// boolean
				parent: biologic,
				component: dragging.component || dragging,
				// metabolic
				reaction: reaction,
				gene: dragging.gene || dragging
			});

			const regulators = Seq(biologic ? biologic.upStreams : reaction.regulators);
			const positives = regulators.filter(e=>e.type);
			const negatives = regulators.filterNot(e=>e.type);

			let dominances = [];

			if (t) {
				dominances = negatives.map(negative => new Add(new Dominance({ positive: adding, negative }))).cacheResult();
			} else {
				dominances = positives.map(positive => new Add(new Dominance({ positive, negative: adding }))).cacheResult();
			}

			actions.batch(Seq([new Add(adding)]).concat(dominances));
		};

		return (
			<div className={t ? "positive" : "negative"}>
				<Droppable onDrop={(dragging instanceof Component || dragging instanceof Gene || 
					dragging instanceof ConditionSpecies || dragging instanceof SubConditionSpecies
					|| dragging instanceof SubConditionGene || dragging instanceof SubConditionGene)
					&& addRegulator}>{l}</Droppable>
			</div>
		);
	};
	
	const rAdd = (props, p, n) => {
		const mType = props.model.modelType || modelType;

		const DropSpecies = mType == "boolean" ?
			<FormattedMessage id="Regulation.DropComponent.DropComponentText" defaultMessage="Drop Component"/>
			:
			<FormattedMessage id="Regulation.DropGene.DropGeneText" defaultMessage="Drop Gene"/>

		return (
			<div className="regulation add">
				{p && rDroppable(props, true,  n ? 
					<FormattedMessage id="Regulation.DropPositiveRegulator.DropPositiveRegulatorText" defaultMessage="Drop Positive Regulator"/>
					:
					DropSpecies
				)}
				{n && props.modelType !== "metabolic" && rDroppable(props, false, p ?
					<FormattedMessage id="Regulation.DropNegativeRegulator.DropNegativeRegulatorText" defaultMessage="Drop Negative Regulator"/>
					:
					DropSpecies
				)}
			</div>
		);
	}

	class Content extends React.Component {
		shouldComponentUpdate(props, state) {
			return this.props.selected.Biologic !== props.selected.Biologic || this.props.selected.Reaction !== props.selected.Reaction ||
				this.props.entities !== props.entities || this.props.dragging !== props.dragging || !view.equal(this.props.view, props.view) ||
				this.props.view.getState().expandedView !== props.view.getState().expandedView;
		}

		render() {
			const { model, view, selected: { Biologic: biologic, Reaction: reaction }, dragging, editable, actions } = this.props;
			const mType = model.modelType || modelType;
			const speciesType = mType == "boolean" ? "component" : "gene";
			const regulatorParent = biologic || reaction;
			const regulators = Seq(mType == "boolean" ? biologic && biologic.upStreams : reaction && reaction.regulators);
			const interactions = biologic && biologic.interactions;
			const min = this.props.minWidth;
			const ConditionEntity = 'Condition'+(mType == 'boolean' ? 'Species' : 'Gene')

			const content = e => {
				const fromComponent = (e, a) => actions.batch((e instanceof Component || e instanceof Gene) ? a(e) : a(e[speciesType]).concat(new Remove(e)));
				const createCondition = (t, e) => fromComponent(dragging, s => {
					const n = t + "Condition";
					const o = { parent: e, type: true, state: true, componentRelation: false };
					!t && (o.subConditionRelation = false);
					const c = new Entity[n](o);
					return [new Add(c), new Add(new Entity[t + ConditionEntity]({ parent: c, [speciesType]: s }))];
				});
				const createConditionSpecies = (t, e) => fromComponent(dragging, s => [new Add(new Entity[t + ConditionEntity]({ parent: e, [speciesType]: s }))]);
				const moveCondition = e => actions.onEdit(dragging, "parent", e);
	
				const props = {
					data: e,
					modelType: mType,
					positive: biologic && Seq(biologic.upStreams).filter(e => e.type)
				};
	
				if (dragging) {
					if (dragging instanceof Component || dragging instanceof Gene
						|| dragging instanceof ConditionSpecies || dragging instanceof SubConditionSpecies
						|| dragging instanceof ConditionGene || dragging instanceof SubConditionGene) {
						props.dropOnRegulator = e => createCondition.bind(this, "", e);
						props.dropOnCondition = e => createCondition.bind(this, "Sub", e);
						props.dropOnComponents = (t, e) => dragging.parent !== e && createConditionSpecies.bind(this, t, e);
					}
					else if (dragging instanceof Condition) {
						props.dropOnRegulator = e => dragging.parent !== e && moveCondition.bind(this, e);
					}
					else if (dragging instanceof SubCondition) {
						props.dropOnCondition = e => dragging.parent !== e && moveCondition.bind(this, e);
					}
				}
				props.hover = (e, p) => !dragging && { onMouseOver: actions.onHover.bind(null, e, p), onMouseOut: actions.onHover.bind(null, null, null) };
	
				props.createConditionSpecies = (e, t, n) => {
					const s = n.toLowerCase();
					const SpeciesClass = modelType == "boolean" ? Component : Gene;
					let c = Seq(this.props.model[Utils.capitalize(speciesType)]).find(e => s === e.name.toLowerCase());
					actions.batch([!c && new Add(c = new SpeciesClass({ name: n, isExternal: false })), new Add(new Entity[t + ConditionEntity]({ parent: e, [speciesType]: c }))]);
				};
	
				props.remove = (e, _) => {
					actions.onRemove(e);
					_.stopPropagation();
				};
	
				if (modelType == 'metabolic') {
					props.renderType = () => (<div className="positive" style={{cursor:"default"}}/>);
				} else {
				props.renderType = (e, v, p) => (<div className={e[v] ? "positive" : "negative"} onClick={editable &&
					(() => actions.batch(Seq([new Update(e, p, !e[p])]).concat(p === "type" && Seq(e[p] ? e.dominants : e.recessives).map(e => new Remove(e))).toArray()))} {...props.hover(e, v)}/>);
				}
	
				props.renderSpecies = (e, p, w) => {
					let species = e[speciesType];
					
					const state = view.getState();
					const expandedView = state.expandedView;

					if (props.modelType === 'metabolic' && speciesType == 'gene'
							&& e.className === 'Regulator' && 'component' in e) {
							species = e['component'];
					}

					return (
						<Draggable onClick={actions.onSelect.bind(null, species)} onDrag={editable && actions.onDrag.bind(null, () => this.props.draggable(species), p ? e[p] || species : e)} hasDraggableChild={true}>
							<div className={Utils.css(species && species.isExternal ? "external" : "internal", interactions && interactions[e.componentId] && "delay")} {...props.hover(e, p)}>
								<div style={{maxWidth: w}} draggable="true">
									{expandedView ? species.name : (species.speciesId || species.name)}
								</div>
								{editable && !dragging && (<div className="remove" onClick={props.remove.bind(this, e)}/>)}
							</div>
						</Draggable>
					)
				}
	
				return React.createElement(Content[viewType || this.props.type], Seq(this.props).concat(props).toObject());
			};
			
			const options = {
				with: this.props.modelType === "metabolic" ? "100%" : "50%",
				fullWith: this.props.modelType === "metabolic",
				title: (p, n, l) => (
					<div >
						<dt>{l + " Regulators"}</dt>
						{regulatorParent && editable && rAdd(this.props, p, n)}
					</div>
				)
			}

			return (
				<span>
					{!options.fullWith ?
					<Panel {...view} maxWidth={2 * min}>
						{content(regulators)}
					</Panel>
					: null}
					<Panel {...view} title={options.title(true, false, "Positive")} width={options.with} minWidth={min} className="phase1-model3">
						{content(regulators.filter(e => e.type))}
					</Panel>
					{!options.fullWith ?
					<Panel {...view} title={options.title(false, true, "Negative")} className="right" width={options.with} minWidth={min} left={options.with}>
						{content(regulators.filterNot(e => e.type))}
					</Panel>
					: null}
				</span>
 
			);
		}
	}
	
	Content.Biologic = Biologic;
	Content.Compressed = Compressed;

	const Header = props => {
		const { model, selected: { Biologic, Reaction }, dragging, parentWidth, minWidth } = props;
		const mType = model.modelType || modelType;
		const e = mType == "boolean" ? Biologic : Reaction;
		
		return dragging instanceof (mType == "boolean" ? Component : Gene)
			&& parentWidth < 2 * minWidth ? rAdd(props, true, true) : props.title(e, props.name)
	}
	
	const Actions = (props) => {
		const { view, selected: { Biologic: biologic, Reaction: reaction }, editable, actions } = props;
		const state = view.getState();
		const expandedView = state.expandedView;

		return utils.pick({
			absentState: biologic && {
				type: Checkbox,
				value: biologic.absentState,
				onEdit: editable && (e => actions.onEdit(biologic, "absentState", e || undefined)),
				title: "Basal Value"
			},
			knockOut: editable && reaction && {
				type: Checkbox,
				value: reaction.knockedOut,
				onEdit: editable && knockOutReaction.bind(null, props, reaction),
				title: "Knock Out"
			},
			table: editable && reaction && {
				title: "View/Hide Information",
				type: Checkbox,
				value: expandedView,
				style: "icon base-table checkbox",
				onEdit: e => view.setState({ expandedView: e })
			}
		}, [editable, biologic, reaction]);
	}

	const persist = Persist(
		{ expandedView: false },
		null,
		null,
		null,
		{ expandedView: false }
	)
	
	return view(Content, Header, Actions, {}, [persist]);
}

export default RegulatoryMechanismViewBuilder();