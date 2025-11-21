import React from "react";
import view from "../base/view";
import {Seq} from "immutable";
import SurveyQuestionOption from "../../entity/surveyQuestionOption";
import Update from "../../action/update";
import Editable from "../base/editable";
import MovableList from "../base/movableList";
import Application from "../../application";

const SurveyQuestionItem = (multichoice) => (class extends React.Component {
	constructor(props) {
		super(props);
		this.state = { submitted: false };
	}
	componentDidMount() {
		if (Application.domain === "learning") {
			const courseId = this.props.state ? this.props.state.course : null;
			this.props.actions.checkIsSubmitted(this.props.model, courseId).then(result => {
				this.setState({
					submitted: result
				});
			});
		}
	}
	shouldComponentUpdate(props, state) {
		return this.props.entities !== props.entities || !view.equal(this.props.view, props.view) || state.submitted !== this.state.submitted;
	}
	render(){
		const {entity, actions: {onEdit}, editable, editableContent, onChange, onClick, onMouseDown, onRemove, dragging, view: {parentWidth}} = this.props;

		const isEditingTeacher = editableContent && Application.domain === "teaching";
		let isChecked = Application.domain === "teaching" ? entity.checked : (entity.studentAnswer || false);

		let cls = "";
		if (Application.domain === "learning" && this.state.submitted) {
			if (entity.checked) {
				cls += "correct"
			} else {
				cls += "incorrect"
			}
		}

		return (
			<div className='option' onClick={onClick} onPointerDown={onMouseDown}>
				<input type={multichoice ? "checkbox" : "radio"} className={cls} checked={isChecked} onChange={editable ? onChange.bind(null, entity) : null} value={entity.id}  />
				{((editable && Application.domain === "teaching") ? (<Editable value={entity.text} onEdit={onEdit.bind(null, entity, "text")} multiline={true} maxWidth={parentWidth - 30} placeHolder="Enter question" />) : entity.text)}
				{isEditingTeacher && !dragging && (<div className="remove" onClick={onRemove.bind(this, entity)}/>)}
			</div>);
	}
});

export default (multichoice) => {
	const targetAttr = Application.domain === "teaching" ? "checked" : "studentAnswer";
	const ret = class extends React.Component {
		shouldComponentUpdate(props) {
			return this.props.entities !== props.entities || !view.equal(this.props.view, props.view);
		}
		render() {
			const {actions: {batch}, entity, editable, editableContent, view: {parentWidth}} = this.props;

			const isEditingTeacher = editableContent && Application.domain === "teaching";
			const onChange = (e) => batch(Seq([new Update(e, targetAttr, !e[targetAttr])]).concat(Seq(entity.options).filter(e=>!multichoice && e[targetAttr]).map(e=>new Update(e, targetAttr, false))).filter(e=>e).toArray());

			return (
				<div>
					{isEditingTeacher && (<div>Options: <input type='button' className="icon base-add" onClick={(_=>this.refs.listOptions.onAdd({parent: entity, text: "Option "+(Seq(entity.options).count()+1)}))} /></div>)}
					<MovableList
						ref='listOptions'
						{...this.props}
						editable={editableContent}
						props={Seq(this.props).concat({view: {parentWidth: parentWidth - 10}}).concat({onChange: onChange, onRemove: e=>this.refs.listOptions.onRemove(e)}).toObject()}
						entity={entity}
						entityCreator={SurveyQuestionOption}
						creator={SurveyQuestionItem(multichoice)}
						dragLabel="Option"
						dataKey="options" />
				</div>
			);
		}
	};
	ret.checkData = (entity) => !multichoice && Seq(entity.options).filter(e=>e[targetAttr]).skip(1).map(e=>new Update(e, targetAttr, false));
	return ret;
};
