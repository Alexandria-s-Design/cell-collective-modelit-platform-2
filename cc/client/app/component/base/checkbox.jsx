import React from "react";
import Utils from "../../utils";

export default ({value, onEdit, onMouseDown, className, title}) =>
	(<span className={Utils.css(className, "checkbox", value && "checked", Utils.enabled(onEdit))} onClick={onEdit && onEdit.bind(null, !value)} onMouseDown={onMouseDown} title={title}/>);
