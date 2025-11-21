import React from "react";
import RichEditable from "../base/richEditable";
import Editable from "../base/editable";
import Application from "../../application";

import { EditorState, ContentState } from 'draft-js';

const createEditorState = txt => EditorState.createWithContent(ContentState.createFromText(txt));

export default class extends React.Component {
	shouldComponentUpdate(props) {
		return this.props.entities !== props.entities;
	}
	render() {
		// create a variable to alter the editor state? - moveFocusToEnd?
		const {entity, actions: {onEdit}, view: {parentWidth}, editable} = this.props;

		const targetValue = Application.domain === "teaching" ? entity.text : createEditorState(entity.studentText || '');


		const doEdit = Application.domain === "teaching" ? (value) => onEdit(entity, "text", value) : (value) => {
			const studentText = value.getCurrentContent().getPlainText('');
			onEdit(entity, 'studentText', studentText);
		};

		return <RichEditable value={targetValue} placeHolder='answer here' maxWidth={parentWidth-10} multiline={true} onEdit={editable && doEdit} />;
	}
}
