import React from "react";
import { Seq, Map } from "immutable";
import Application from "../../application";
import Add from "../../action/add";
import Update from "../../action/update";
import Remove from "../../action/remove";
import view from "../base/view";
import Panel from "../base/panel";
import MovableList from "../base/movableList";
import Editable from "../base/editable";
import RichEditable from "../base/richEditable";
import Checkbox from "../base/checkbox";
import Options from "../base/options";
import CheckboxN from '../base/checkboxN';
import Survey from "../../entity/survey";
import Utils from "../../utils";
import SurveyQuestion from "../../entity/surveyQuestion";
import SurveyItemPlainText from "./surveyItemPlainText";
import SurveyItemMultiple from "./surveyItemMultiple";
import SurveyItemTable from "./surveyItemTable";
import { Classification } from "../../entity/surveyQuestion";
import ButtonPanel from "../base/buttonPanel";
import SurveyQuestionText from "../../entity/surveyQuestionText";
// import { connect } from "http2";


/* c: component_to_render, t: text, i: name_for_icon */
const conf = {
	1: { "c": SurveyItemMultiple(true), "t": "Multiple choice", "i": "multiple" },
	2: { "c": SurveyItemMultiple(false), "t": "Radio button choice", "i": "radio" },
	3: { "c": SurveyItemTable, "t": "Table", "i": "table"},
	0: { "c": SurveyItemPlainText, "t": "Text question", "i": "text" }
};

const get_qWidth = (parentWidth, extraWidth, isEditingTeacher) => parentWidth - 10 - (isEditingTeacher ? 22 * (1 + Seq(conf).count()) : 0) - (Math.ceil(extraWidth) + 14);

class QuestionView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			qWidth: 0,
			draggable: false
		}
	}
	onActionMouseDown() {
		if (this.props.editableContent) {
			this.setState({draggable: true})
		}
	}
	onActionMouseOut() {
		if (this.state.draggable === true) {
			this.setState({draggable: false})
		}		
	}
	getExtraWidth() {
		const width = el => (el ? el.getBoundingClientRect().width : 0);
		const isEditingTeacher = Application.domain === "teaching" && this.props.editableContent;
		const ret = width(this.refs.points) + (isEditingTeacher ? (width(this.refs.learningObjective) + width(this.refs.skill) + width(this.refs.qtype)) : 0);
		return ret;
	}

	shouldComponentUpdate(props) {
		const isEditingTeacher = Application.domain === "teaching" && this.props.editableContent;
		return this.props.editable !== props.editable || this.props.editableContent !== props.editableContent || !view.equal(this.props.view, props.view) || this.props.entities !== props.entities || this.props.dragging !== props.dragging || this.state.qWidth !== get_qWidth(this.props.parentWidth, this.getExtraWidth(), isEditingTeacher);
	}
	UNSAFE_componentWillMount(){
		this.setState({
			qWidth: 0
		});
	}
	componentDidMount() {
		const { view: { parentWidth } } = this.props;
		this.setState({
			qWidth: get_qWidth(parentWidth, this.getExtraWidth(), Application.domain === "teaching" && this.props.editableContent)
		});
	}
	componentDidUpdate(_, prevState) {
		const { view: { parentWidth } } = this.props;
		const extraWidth = this.getExtraWidth();
		const qWidth = get_qWidth(parentWidth, extraWidth, Application.domain === "teaching" && this.props.editableContent);
		if (prevState.qWidth !== qWidth) {
			this.setState({ qWidth });
		}
	}
	render() {

	const {
		entity, actions: { onEdit, onRemove, batch, checkLessonComplete }, editableContent, onClick, onMouseDown, dragging, model,
		view: { parentWidth, parentHeight }, pos
	 } = this.props;

		const maybeEdit = (k, constr, props) => {
			return React.createElement(constr, Seq(props).concat({ value: entity[k], editable: editableContent,
				onEdit: (editableContent &&  Application.isTeach) && (e => { onEdit(entity, k, e); }), 
				preventDefault: false
			}).toObject())
		};

		const maybeEditParent = (obj, k, constr, props) => {
			return React.createElement(constr, Seq(props).concat({ value: obj[k], editable: editableContent,
				onEdit: (editableContent &&  Application.isTeach) && (e => { onEdit(obj, k, e); }), 
				preventDefault: false
			}).toObject())
		};

		const changeNewType = (k) => batch(Seq([new Update(entity, "type", k)]).concat(conf[k].c.checkData && conf[k].c.checkData(entity) || []).toArray());

		const isEditingTeacher = Application.domain === "teaching" && editableContent;
		const validate = value => {
			const result = parseInt(value);
			if (!isNaN(result) && result < 0) {
				return undefined;
			}
			return result;
		};

		const editLO = e => {
			const learnId = e === null ? null : e.learnId;
			onEdit(entity, "learnId", learnId);
		}
		const getLO = ent => {
			if( ent === null ) return "No Objective";
			const learnId = ent.learnId;
			let retItem = null;
			Seq(model.mLearningObjective).some(item => {
				const isItem = item.id == learnId ? true : false;
				if( isItem ) retItem = item;
				return isItem;
			});
			return retItem ? retItem.value : "No Objective";
		};

		const getSkill = e => {
			const noSkill = (e.learnSkill === null || e.learnSkill === undefined);
			return noSkill ? "General Skills" : Classification.Skills[e.learnSkill];
		};
		const editSkill = e => onEdit(entity, "learnSkill", e ? e.learnSkill : null);

		const getQType = e => {
			const noType = (e.learnType === null || e.learnType === undefined);
			return noType ? "No Question Type" : Classification.Types[e.learnType];
		}
		const editQType = e => onEdit(entity, "learnType", e ? e.learnType : null);

		return <React.Fragment>
			<li className="li-question" onClick={onClick} onPointerDown={onMouseDown} draggable={this.state.draggable || false} data-pos={pos} data-id={entity.id} data-entity={"SurveyQuestion"}>
				{isEditingTeacher && (<div className="survey-q-drag">
					<input type="button" className="icon base-close-gray" onClick={onRemove.bind(null, entity)} />
					<input
						className="icon base-skew"
						onMouseDown={this.onActionMouseDown.bind(this)} 
						onMouseLeave={this.onActionMouseOut.bind(this)}
					/>
				</div>)}				
				<div className="survey-q-content">
				<div className="survey-q-header">
					<span className="base-button-group">
						{ isEditingTeacher ?
							<React.Fragment>
								<span className="survey-options" ref="qtype">
									<Options
										value={entity}
										get={getQType}
										dropdowIcon="base-menu-gray"
										options={Map(Classification.Types).keySeq().map(e => {return { learnType: e, id: e }})}
										onChange={editQType}
										/>
								</span>
								<span className="survey-options" ref="skill">
									<Options
										none="General Skills"
										value={entity}
										get={getSkill}
										dropdowIcon="base-menu-gray"
										options={Map(Classification.Skills).keySeq().map(e => {return { learnSkill: e, id: e }})}
										onChange={editSkill}
										/>
								</span>
								<span className="survey-options" ref="learningObjective">
									<Options
										none="No Objective"
										value={entity}
										get={getLO}
										dropdowIcon="base-menu-gray"
										options={Seq(model.mLearningObjective).sortBy(e => e.value).map(e => { return { learnId: e.id, id: e.id } })}
										onChange={editLO}
										/>
								</span>
							</React.Fragment>
						: null }
						{isEditingTeacher ? Seq(conf).map((e, k) => (
							<input key={k} type="button" title={e.t} className={Utils.css("icon", "base-" + e.i, entity.type === parseInt(k) && "selected")} onClick={changeNewType.bind(null, parseInt(k))} />
						)).toArray() : null}
						<span className="points-box" ref="points">
							<label>Points:&nbsp;</label>
							{isEditingTeacher ? <Editable value={entity.points} onEdit={value => onEdit(entity, "points", validate(value) || entity.points)} /> : entity.points}
						</span>
					</span>
					{maybeEdit("title", Editable, { placeHolder: "Enter Question", className: "header", multiline: true, maxWidth: this.state.qWidth, maxWidthStatic: this.props.view.parentWidth-10 })}
				</div>
				{conf[entity.type] && React.createElement(conf[entity.type].c, this.props)}
				</div>
			</li>
			</React.Fragment>;
	}
}

class QuestionTextView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			qWidth: 0,
			draggable: false
		}
	}
	onActionMouseDown() {
		if (this.props.editableContent) {
			this.setState({draggable: true})
		}
	}
	onActionMouseOut() {
		if (this.state.draggable === true) {
			this.setState({draggable: false})
		}		
	}
	getExtraWidth() {
		const width = el => (el ? el.getBoundingClientRect().width : 0);
		const isEditingTeacher = Application.domain === "teaching" && this.props.editableContent;
		const ret = width(this.refs.points) + (isEditingTeacher ? (width(this.refs.learningObjective) + width(this.refs.skill) + width(this.refs.qtype)) : 0);
		return ret;
	}

	shouldComponentUpdate(props) {
		const isEditingTeacher = Application.domain === "teaching" && this.props.editableContent;
		return this.props.editable !== props.editable || this.props.editableContent !== props.editableContent || !view.equal(this.props.view, props.view) || this.props.entities !== props.entities || this.props.dragging !== props.dragging || this.state.qWidth !== get_qWidth(this.props.parentWidth, this.getExtraWidth(), isEditingTeacher);
	}
	UNSAFE_componentWillMount(){
		this.setState({
			qWidth: 0
		});
	}
	componentDidMount() {
		const { view: { parentWidth } } = this.props;
		this.setState({
			qWidth: get_qWidth(parentWidth, this.getExtraWidth(), Application.domain === "teaching" && this.props.editableContent)
		});
	}
	componentDidUpdate(_, prevState) {
		const { view: { parentWidth } } = this.props;
		const extraWidth = this.getExtraWidth();
		const qWidth = get_qWidth(parentWidth, extraWidth, Application.domain === "teaching" && this.props.editableContent);
		if (prevState.qWidth !== qWidth) {
			this.setState({ qWidth });
		}
	}
	render() {

	const {
		entity, actions: { onEdit, onRemove, batch, checkLessonComplete }, editableContent, onClick, onMouseDown, dragging, model,
		view: { parentWidth, parentHeight }, pos
	 } = this.props;

	 	const isEditingTeacher = Application.domain === "teaching" && editableContent;

		const maybeEdit = (k, constr, props) => {
			return React.createElement(constr, Seq(props).concat({ value: entity[k], editable: editableContent,
				onEdit: (editableContent &&  Application.isTeach) && (e => { onEdit(entity, k, e); }), 
				preventDefault: false
			}).toObject())
		};

		const isStudentTextEmpty = () => {
			if (isEditingTeacher) { return false }
			return !entity.text
		}

		return <li className={`li-text `+(isStudentTextEmpty() ? 'empty' : null)} draggable={this.state.draggable || false} data-pos={pos} data-id={entity.id} data-entity={"SurveyQuestionText"}>
				{isEditingTeacher && (<div className="survey-q-drag">
					<input type="button" className="icon base-close-gray" onClick={onRemove.bind(null, entity)} />
					<input
						className="icon base-skew"
						onMouseDown={this.onActionMouseDown.bind(this)} 
						onMouseLeave={this.onActionMouseOut.bind(this)}
					/>
				</div>)}
				<div className="survey-q-top">
					{maybeEdit("text", RichEditable, {
						value: entity.text,
						placeHolder: "Enter Text",
						className: "survey question descr", 
						enableStyling: editableContent ? true : false,
						maxWidth: parentWidth - 50,
						minHeight: (parentHeight * 30) / 100,
						multiline : true
					})}
				</div>
			</li>
	}
}

class Content extends React.Component {

	shouldComponentUpdate(props) {
		return this.props.entities !== props.entities || this.props.editableContent !== props.editableContent || this.props.editable !== props.editable || !view.equal(this.props.view, props.view) || this.props.dragging !== props.dragging || !view.equal(this.props.view, props.view);
	}

	render() {
		const { view, editable, model, entity,  entity: {description}, editableContent, actions: { onEdit }, view: { parentWidth, parentHeight } } = this.props;
		// const maybeEdit = (k, constr, props) => (editableContent ? React.createElement(constr, Seq(props).concat({ value: entity[k], editable: editableContent, onEdit: e => onEdit(entity, k, e) }).toObject()) : (React.createElement(constr, Seq(props).concat({ value: entity[k] }).toObject())));
		const  maybeEdit = (k, constr, props) => ((React.createElement(constr, Seq(props).concat({ value: entity[k] }).toObject())));


		return (<React.Fragment>
			<Panel {...view}>

				{entity && (<MovableList {...this.props}
					scrollable={true}
					//   footer={(<input type='button' className='raised' value='Check results' />)}
					header={entity.showDescription && (
						<div>
							{maybeEdit("description", RichEditable, {
								onEdit: (editable && editableContent) && onEdit.bind(null, entity, "description"),
								value: description,
								placeHolder: "Enter description",
								className: "survey descr", 
								enableStyling: true,
								maxWidth: parentWidth - 50,
								minHeight: (parentHeight * 30) / 100,
								multiline : true
							})}
						</div>					
					)}
					editable={editableContent}
					props={Seq(this.props).concat({ view: { parentWidth: parentWidth - 10 } }).concat({ onRemove: (e) => this.refs.list.onRemove(e) }).toObject()}
					ref='list'
					entityCreator={SurveyQuestion}
					className="survey"
					creator={QuestionView}
					dragLabel="Survey question"
					entity={entity}
					dataKey="questions"
					sortable={true}
					creators={{questions: QuestionView, questionsText: QuestionTextView}}
				/>)}
			</Panel>
			</React.Fragment>
		);
	}
}

const descriptionModes = {
	[false]: 'Description hidden',
	[true]: 'Description shown'
};

const Actions = (props) => {
	let { selected: { Component: e }, entity, model, actions: { onAdd, onEdit }, editable, editableContent, user } = props

	if(user.id === model.userId) {
		editable = true;
		editableContent = true;
	}

	const retActions = {};

	if (editable &&  Application.domain === "teaching") {
		retActions.addText = {
			title: 'Add Text',
			label: 'Text',
			className: 'icon base-add',
			type: ButtonPanel,
			onEdit: e => {
				const c = Seq(entity.questions).count()+Seq(entity.questionsText).count();
				onAdd(new SurveyQuestionText({ parent: entity, index: c, text: null, position: c }))
			}
		};
		retActions.addQuestion = {
			title: 'Add Question',
			label: 'Question',
			className: 'icon base-add',
			type: ButtonPanel,
			onEdit: e => {
				const c = Seq(entity.questions).count()+Seq(entity.questionsText).count();
				onAdd(new SurveyQuestion({ parent: entity, index: (c), type: 0, title: "Question " + (c), questionText: null, position: (c)}));
			}
		};
	}
	if (editable && Application.domain === "teaching" && entity && entity.showDescription) {
		retActions.description = {
			title: descriptionModes[entity.showDescription],
			className: entity.showDescription ? 'icon base-description' : 'icon base-description-disabled',
			type: CheckboxN,
			value: entity.showDescription ? 1 : 0,
			numStates: 2,
			onEdit: (v) => onEdit(entity, 'showDescription', !!v)
		};
	}
	return retActions;
};

export { QuestionView };

export default view(Content, view.EntityMultipleHeader, Actions);
