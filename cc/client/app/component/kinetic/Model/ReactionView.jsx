import React from "react";
import { Seq, Map } from "immutable";
import { FormattedMessage } from 'react-intl';
import isEmpty from "lodash.isempty"

import Panel from "../../base/panel";
import Editable from "../../base/editable";
import Add from "../../../action/add";
import Update from "../../../action/update";
import Remove from "../../../action/remove";
import Checkbox from "../../base/checkbox";
import view from "../../base/view";
import Droppable from "../../base/droppable";
import Metabolite from "../../../entity/metabolic/Metabolite";
import Scrollable from "../../base/scrollable";
import Persist from "../../../mixin/persist";
import Reaction from "../../../entity/metabolic/Reaction";
import ReactionMetabolite from "../../../entity/metabolic/ReactionMetabolite";

export const getGenes = ({ model }, reaction) => {
	const genes = Seq(model.Regulator)
		.filter(r => r.reactionId == reaction.id)
		.map(r => model.Gene[r.geneId]);

	return genes;
}

const removeReactionMetabolite = ({ actions, selected: { Reaction: e } }, eRM, r) => {
	e = e ? e : r;

	const updates				= [ ];

	updates.push(new Remove(eRM));

	actions.batch(updates);
}

class ElementsView extends React.Component {
	render ( ) {
		const { props } = this;
		const { selected: { Reaction: reaction }, model, parentHeight, isReactants,
			maxWidth, dragging, actions, expandedView } = props;

		const metabolites = reaction && Seq(model.ReactionMetabolite)
			.filter(r => `${r.reactionId}` == `${reaction.id}`)
			.filter(r => (isReactants ? r.coefficient < 0 : r.coefficient > 0))
			.toArray();

		return (
			<Scrollable ref="scrollable" parentHeight={parentHeight}>
				{reaction && (
					<div className="reaction elements">
							{Seq(metabolites).map((eRM, i) => {
								const { metaboliteId, coefficient } = eRM;

								const metabolite = model.Metabolite[metaboliteId];
								const { name, speciesId } = metabolite;

								return (
									(
										<span>
											<span>
												<div className="metabolite" onClick={() => actions.onSelect(metabolite || "Metabolite")}>
													<Editable value={coefficient} onEdit={(e) => actions.onEdit(eRM, "coefficient", e)}/>
												</div>
											</span>
											<span>
												<div className="metabolite" onClick={() => actions.onSelect(metabolite || "Metabolite")}>
													{expandedView ? name : (speciesId || name)}
													{!dragging && (<div className="remove" onClick={() => removeReactionMetabolite(props, eRM, reaction)}/>)}
												</div>
												{i < (Seq(metabolites).count() - 1) && (<span> + </span>)}
											</span>
										</span>
									)
								)
							}).toArray()}
					</div>
				)}
			</Scrollable>
		)
	}
}

const rDroppable = ({selected: {Reaction: reaction}, model, dragging, actions}, r, l) => {
	const addMetabolite = (r) => {
		const metabolite 	= dragging.metabolite || dragging;

		const updates 		= [ ];

		const key					= `${reaction.id}-${metabolite.id}`;

		let eRM	= model.ReactionMetabolite[key];

		if ( !eRM ) {
			eRM	= new ReactionMetabolite({
				id: key,
				reactionId: reaction.id,
				metaboliteId: metabolite.id,
				coefficient: r ? -1 : +1
			});

			updates.push(new Add(eRM));
		} else {
			updates.push(new Update(eRM, "coefficient", r ? -1 : 1));
		}

		actions.batch(updates);
	};

	return (
		<div className={r ? "reactant" : "product"}>
			<Droppable onDrop={() => {
				if ( dragging instanceof Metabolite ) {
					addMetabolite(r);
				}
			}}>
				{l}
			</Droppable>
		</div>
	);
};

const rAdd = (props, r, p) => {
	return <div className="reaction add">
	{r && rDroppable(props, true, p ?
		<FormattedMessage id="Regulation.DropReactantMetabolite.DropReactantText" defaultMessage="Drop Reactant" />
		:
		<FormattedMessage id="Regulation.DropReactantMetabolite.DropMetaboliteText" defaultMessage="Drop Metabolite" />
	)}
	{p && rDroppable(props, false, r ?
		<FormattedMessage id="Regulation.DropProductMetabolite.DropProductText" defaultMessage="Drop Product" />
		:
		<FormattedMessage id="Regulation.DropProductMetabolite.DropMetaboliteText" defaultMessage="Drop Metabolite" />
	)}
</div>
}

class Content extends React.Component {
	render ( ) {
		const { props } = this;
		const { view, editable, minWidth, selected: { Reaction: reaction }, model } = props;

		const state = view.getState();
		const expandedView = state.expandedView;

		const massBalance = Reaction.checkMassBalance(props, reaction);
		// const massBalance = null;

		const title = (r, p, l) => (
			<div>
				<dt>{l}</dt>
				{reaction && editable && rAdd(this.props, r, p)}
			</div>
		);

		const rWarnMassBalance = () => {

			if ( !isEmpty(massBalance) ) {
				return (
					<div style={{padding:"5px"}}>
						<i>
								The following elements are unbalanced {Seq(massBalance)
									.filter(v => v.name !== "charge")
									.map((v, k) => `<b>${k}</b> - ${v}`)
									.join(", ")} {massBalance.charge ? `with a charge of ${massBalance["charge"]}` : ""}
						</i>
					</div>
				)
			}

			return null;
		}

		return (
			<span>
				{!isEmpty(massBalance) ?
					(
						<span style={{padding:"5px"}}>
							<i>
								Test
							</i>
						</span>
					) : null}
				<div>
					<Panel {...view} title={title(true, false, "Reactants")} width="50%" height="90%" minWidth={minWidth} >
						<ElementsView expandedView={expandedView} {...props} isReactants={true}/>
					</Panel>
					<Panel {...view} title={title(false, true, "Products")} width="50%" height="90%" minWidth={minWidth} left="50%" className="right">
						<ElementsView expandedView={expandedView} {...props} isProducts={true} />
					</Panel>
				</div>
			</span>
		);
	}
}

const Header = props => {
	const { selected: { Reaction: e }, dragging, parentWidth, minWidth, title, name } = props;
	return dragging instanceof Metabolite && e && parentWidth < 2 * minWidth ? rAdd(props, true, true) : title(e, name);
};

const Actions = (props) => {
	const { view, actions, editable, selected: { Reaction: reaction } } = props;
	const state = view.getState();
	const expandedView = state.expandedView;

	return {
		reversible: {
			title: "Reversibility",
			type: Checkbox,
			value: reaction && reaction.reversible,
			onEdit: editable && (e => {
				if ( reaction.reversible ) {
					actions.onEdit(reaction, "lowerBound", reaction.lowerBound >= 0 ? reaction.lowerBound : 0);
				} else {
					actions.onEdit(reaction, "lowerBound", reaction.lowerBound < 0 ? reaction.lowerBound : -1000);
				}
			})
		},
		table: {
			title: "View/Hide Information",
			type: Checkbox,
			value: expandedView,
			style: "icon base-table checkbox",
			onEdit: e => view.setState({ expandedView: e })
		}
	}
}

const persist = Persist(
	{ expandedView: false },
	null,
	null,
	null,
	{ expandedView: false }
)

export default view(Content, Header, Actions, {}, [persist]);
