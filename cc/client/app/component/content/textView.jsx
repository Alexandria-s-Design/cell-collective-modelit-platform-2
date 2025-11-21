import React from "react";
import Panel from "../base/panel";
import Scrollable from "../base/scrollable";
import view from "../base/view";
import RichEditable from "../base/richEditable";
import Editable from "../base/editable";
import TextEditorPanel from "../../entity/textEditorPanel";
import { Seq } from "immutable";

import CheckboxN from "../base/checkboxN";

class Content extends React.Component{

	shouldComponentUpdate(props){
		return this.props.entities !== props.entities || this.props.parentHeight !== props.parentHeight;
	}


    render() {
        const {view, editable, entity, entity: {editorText}, actions: {onEdit} } = this.props;
        
        return (
                <Scrollable>
                    <RichEditable
                    {...view}
                    onEdit={editable && onEdit.bind(null, entity, "editorText")}
                    value={editorText}
                    enableStyling={entity.styling}
                    placeHolder="Enter text here..."
                    />
                </Scrollable>
        );
    }
}

const Actions = ({ entity, editable, actions: { onEdit } }) => ({
    toggle: entity && editable && {
        className: `icon base-${entity.styling ? "asc" : "desc"}-inverse`,
            title: `${entity.styling ? "Hide" : "Show"} Styling`,
             type: CheckboxN,
        numStates: 2,
            value: entity.styling ? 1 : 0,
           onEdit: e => onEdit(entity, "styling", !!e)
    }
});

export default view(Content, view.EntityMultipleHeader, Actions);