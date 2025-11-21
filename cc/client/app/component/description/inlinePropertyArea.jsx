import React from "react";
import Editable from "../base/editable";

export default ({entity, name, actions, parentWidth, onEdit, separate, label}) => {
	const e = entity[name];
	if( actions ){
		return <Editable value={e} placeHolder={label} onEdit={separate ? actions.onEdit.bind(null,entity,name) : actions.onEditProperty.bind(null,name)} maxWidth={parentWidth} />;
	}else{
		return e && <span>{e}</span>;
	}
};
