import React from "react";
import Application from "../../application";
import { TransitionGroup } from "react-transition-group";
import { Seq } from "immutable";
import view from "../base/view";
import Panel from "../base/panel";
import Scrollable from "../base/scrollable";
import TransitionItem from "../base/transitionItem";
import Editable from "../base/editable";
import Add from "../../action/add";
import Reference from "../../entity/reference";
import ModelReference from "../../entity/modelReference";
import ModifyLink from "../../util/links";

class Content extends React.Component {
	constructor(props){
		super(props);
		this.state = {};
	}

	UNSAFE_componentWillMount() {
		this.props.view.setState({ refError: null });
	}

	removeContent() {
		this.props.view.setState({ content: null });
	}
	render() {
		const props = this.props;
		let { view, model, editable, actions } = props;
		editable = editable && ((Application.isEducation && Application.domain === "teaching") || !Application.isEducation);
		const ti = { done: () => this.refs.scrollable.componentDidUpdate() };

		const add = id => (id && !Seq(model.ModelReference).some(e => e.reference.pmid === id || e.reference.doi === id) ?
			actions.getReference(id, e => {
				if( 'error' in e ){
					this.props.view.setState({ refError: e.response });
					return;
				}
				e && actions.batch([!e.isAttached && new Add(e), new Add(new ModelReference({ reference: e }))]);
				this.removeContent();
			}) : this.removeContent());

		const error = this.props.view.getState().refError;
		const mReferences = model.Reference && Object.keys(model.Reference).length
			? Seq(Object.values(model.Reference).sort(Reference.comparator))
			: Seq([]);

		return (
			<Panel {...view}>
				<Scrollable ref="scrollable">
					<ol key={model.id} className="references">
						{view.getState().content && (
							<li>
								<div>
									<Editable placeHolder={error ? <span className="error">{error}</span> : "pmid or doi"} onEdit={add}/>
									<div className="remove" onClick={this.removeContent.bind(this)}/>
								</div>
							</li>
						)}
						<TransitionGroup>
							{mReferences.map((v, k) => (
								<TransitionItem key={k} {...ti}>
									<li>
										<div>
											<span dangerouslySetInnerHTML={{__html: ModifyLink(v.text)}}/>
											{editable && (<div className="remove" onClick={actions.onRemove.bind(null, v)}/>)}
										</div>
									</li>
								</TransitionItem>
							)).toArray()}
						</TransitionGroup>
					</ol>
				</Scrollable>
			</Panel>
		);
	}
}

const Actions = ({view, readonly, editable}) => !readonly && { reference: editable && !view.getState().content && { action: () => view.setState({ content: { type: "Reference" }, refError: null }) }};
const EduActions = ({view, readonly, editable}) => ((!readonly && editable && Application.domain === "teaching") ? {add: !view.getState().content && { action: () => view.setState({ content: { type: "Reference" }, refError: null }) } } : null);

export const LearningReferencesView = view(Content, null, EduActions);
export default view(Content, null, Actions);