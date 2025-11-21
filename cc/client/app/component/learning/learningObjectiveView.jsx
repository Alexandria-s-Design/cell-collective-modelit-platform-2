import React from "react";
import { Seq , Map} from "immutable";
import Application from "../../application";
import view from "../base/view";
import Panel from "../base/panel";
import Scrollable from "../base/scrollable";
import MetadataMultiple from "../description/metadataMultiple";
import { FormattedMessage } from "react-intl";
import MovableList from "../base/movableList";
import { QuestionView } from "../content/surveyView";
import SurveyQuestion from "../../entity/surveyQuestion";
import BasicOptions from "../base/basicOptions";

class Content extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const { view, model, model: { top: { id } }, editable, editableContent, actions, actions: { onAdd }, parentWidth, entity, onDrag } = this.props;
		const p = { parent: this, actions: editable && Application.domain === "teaching" ? actions : null, entity: model, view: view };

		const adding = view.getState().doAdd;

		const proportion = 30

		const sel = this.state.selected ? this.state.selected : null;
		const questions = Seq(model.Survey).map(survey => Seq(survey.questions)).flatten(2).filter(sq => (sq.learnId !== null && sq.learnId === sel))
											.toKeyedSeq().toJS();
		const SurveyEntity = (sel !== null) ? { questions } : { questions: {} };

		const Surveys = Map(model.Survey).mapEntries(([_, v]) => [v.id, v.name]).toJS();
		
		const addQuestion = (survey) => {
			const c = Seq(survey.questions).count();
			onAdd(new SurveyQuestion({ parent: survey, index: c, type: 0, title: `Question ${c+1}`, learnId: sel }));
		};
		const onAddClicked = () => {
			if( this.state.selectedSurvey === null ) return;
			let survey = null;
			Seq(model.Survey).some(s => {
				if( s.id === this.state.selectedSurvey ) {
					survey = s;
					return true;
				} else return false;
			});
			if( survey !== null ) addQuestion(survey);
		};
		
		const isEditingTeacher = Application.domain === "teaching" && editableContent;

		return (
			<React.Fragment>
				<Panel {...view} key={id} className="description" width={'100%'}>
					<Scrollable ref="scrollable">
						<MetadataMultiple {...p} name="LearningObjective" label="" placeHolder="objective" doAdd={adding} selectable={true}
							onChange={sel => this.setState({ selected: sel })} />
					</Scrollable>
				</Panel>
				{ false && <Panel {...view} className="description lo-right-panel" width={`${100-proportion}%` } left={`${proportion}%`}>
						<Scrollable>
							{ sel !== null ?
								<React.Fragment>
									<h2 className="lo-related">
										Related Questions
										{ isEditingTeacher ? 
											<span className="add">
												Add to:&nbsp;&nbsp;
												<BasicOptions options={Surveys} onChange={sel => this.setState({ selectedSurvey: sel })} />
												<input type="button" className="icon base-add" onClick={onAddClicked}
													disabled={this.state.selectedSurvey == null} />
											</span> : null }
									</h2>
									<MovableList
										actions={actions}
										header={null}
										scrollable={false}
										editable={editableContent}
										props={Seq(this.props).concat({ view: { parentWidth: parentWidth - 10 } }).concat({ onRemove: (e) => this.refs.list.onRemove(e) }).toObject()}
										ref='list'
										entityCreator={SurveyQuestion}
										className="survey"
										creator={QuestionView}
										dragLabel="Survey question"
										entity={SurveyEntity}
										dataKey="questions" />
								</React.Fragment> :
								<React.Fragment>
									<h2 className="lo-related">Select an objective.</h2>
								</React.Fragment>
							}
						</Scrollable>
					</Panel>
				}
			</React.Fragment>
		);
	}
}

const AddObjective = ({ view }) => {
	view.setState({ doAdd: true }); //trigger re-render to add the content box
};

export default view(Content, null, (props) => ((props.editable && Application.domain === "teaching") ? { add: () => AddObjective(props) } : null), { doAdd: false });
