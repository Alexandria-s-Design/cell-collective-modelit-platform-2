import React from "react";
import Utils from "../../utils";
import Scrollable from "./scrollable";
import {Editor, EditorState, RichUtils } from "draft-js";
import debounce from "lodash.debounce";
import Panel from "./panel";
import edit from "../../mixin/edit";

// richeditable props: value=targetvalue, multiline=true, onEdit
class RichEditable extends React.Component {
	constructor(props) {
		super(props);
		this.editorRef = React.createRef<Editor>(null);
		this.state = {value : false, editing: false };
		this._saved = true;
	}
	
    stateHasChange = (oldState, newState) => {
		const prev = oldState && oldState._immutable;
		const next = newState && newState._immutable;
        return next !== prev;
	}
	
	_executeSave = () => {
		if(  this.state.value && this.stateHasChange(this.state.value, this.props.value) ){
			const value = this.state.value;
			this.props.onEdit(value);	
			this._saved = true;
		}
	}
	
	_debouncedSave = debounce(() => {
		if (!this._saved) { this._executeSave(); }
	}, 1000)

	lazyDataPropagateToDataLayer = () => {
		this._saved = false;
		this._debouncedSave();
	};

	propagateDataToDataLayerRightNow = () => {
		this._executeSave();
	}

	shouldComponentUpdate(nextProps, nextState){
		if(nextProps.value !== this.props.value){
			this.setState({value: false});
			nextState = {
				...nextState,
				value: false
			}
			return !this.state.value;
		}
		
		return nextState.value !== this.state.value ||
			nextState.editing !== this.state.editing ||
			// props.value !== this.props.value ||
			this.props.parentHeight !== nextProps.parentHeight ||
			this.props.enableStyling !== nextProps.enableStyling;
	}


	render() {
		let {entity, onEdit, enableStyling, placeHolder, parentWidth, maxHeight, parentHeight} = this.props;
		const value = this.state.value || this.props.value || EditorState.createEmpty();
		// fix editor bug
		const onChange = (value, style) => {	
			this.setState({value, style});
		};
		const onAction = (f, style) => { onChange(RichUtils[f](value,style), style); };

		const activeStyle = (type, style) => ((type === style) ? " RichEditor-activeButton" : "");

		const selection = value.getSelection();
		const blockType = value
			.getCurrentContent()
			.getBlockForKey(selection.getStartKey())
			.getType();

		const blockEditors = (
			<div>
				<span onClick={onAction.bind(this, "toggleBlockType", "unstyled")} className={activeStyle(blockType, "unstyled")} title="Normal Text">Normal Text</span>
				<span onClick={onAction.bind(this, "toggleBlockType", "header-four")} className={activeStyle(blockType, "header-four")} title="Caption">Caption</span>
				<span onClick={onAction.bind(this, "toggleBlockType", "header-one")} className={activeStyle(blockType, "header-one")} title="Heading One">Heading 1</span>
				<span onClick={onAction.bind(this, "toggleBlockType", "header-two")} className={activeStyle(blockType, "header-two")} title="Heading Two">Heading 2</span>
				<span onClick={onAction.bind(this, "toggleBlockType", "header-three")} className={activeStyle(blockType, "header-three")} title="Heading Three">Heading 3</span>
				<span onClick={onAction.bind(this, "toggleBlockType", "unordered-list-item")} className={activeStyle(blockType, "unordered-list-item")} title="Unordered List" ><img src="/assets/images/textEditor/unordered.png" /></span>
				<span onClick={onAction.bind(this, "toggleBlockType", "ordered-list-item")} className={activeStyle(blockType, "ordered-list-item")} title="Ordered List" ><img src="/assets/images/textEditor/ordered.png" /></span>
				<span onClick={onAction.bind(this, "toggleInlineStyle", "BOLD")} title="Bold"><img src="/assets/images/textEditor/bold.png"/></span>
				<span onClick={onAction.bind(this, "toggleInlineStyle", "UNDERLINE")} title="Underline"><img src="/assets/images/textEditor/underline.png"/></span>
				<span onClick={onAction.bind(this, "toggleInlineStyle", "ITALIC")} title="Italic"><img src="/assets/images/textEditor/italicize.png" alt="Format Italic"/></span>
				<span onClick={onAction.bind(this, "toggleInlineStyle", "SUPERSCRIPT")} title="Superscript"><img src="/assets/images/textEditor/superscript.png" alt="Format Superscript"/></span>
				<span onClick={onAction.bind(this, "toggleInlineStyle", "SUBSCRIPT")} title="Subscript"><img src="/assets/images/textEditor/subscript.png" alt="Format Subscript"/></span>
			</div>
		);

		// problem: not in ref 
		// console.log("onFocus");});
		// && (() => { console.log("onBlur");this.setState({editing: false, value },  })
		const editor = (
		<div>
		<Editor
			readOnly={!onEdit}
			ref="editor"
			editorState={value}
			onChange={onChange}
			onFocus={onEdit && (() => {this.setState({editing: true });})}
			onBlur={onEdit && (() => {this.setState({editing: false, value,  }, this.propagateDataToDataLayerRightNow) })}
			preserveSelectionOnBlur={true}
			spellCheck={true}
			placeholder={onEdit ? placeHolder : ''}
			customStyleMap={ {
				SUBSCRIPT: { fontSize: "0.8em", verticalAlign: "sub" },
				SUPERSCRIPT: { fontSize: "0.8em", verticalAlign: "super" },
			}}
		/>
		</div>);

				

		const header = onEdit && enableStyling && (<div className="select-options">
			{blockEditors}
		</div>);
		maxHeight = (maxHeight || parentHeight) - (header ? 30 : 0);
      
		return (
			<div className={Utils.css("text-editor","references",this.state.editing && "dirty")}>
				{header}
				<div style={maxHeight ? {position: "sticky"} : {}}>
					{maxHeight ? (
						<div style={{height: maxHeight}}>
							<Scrollable parentWidth={parentWidth} parentHeight={maxHeight}>
								{editor}
							</Scrollable>
						</div>) : editor}
				</div>
			</div>
		);
	}
}

export default RichEditable;
