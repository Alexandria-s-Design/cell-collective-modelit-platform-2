import React from "react";
import Editable from "../base/editable";
import Application from "../../application";

export default ({entity, name, label, actions, parentWidth, onEdit, separate}) => {
	const e = entity && entity[name];
	return (
		<dl className="area">
			{label && <dt>{label}</dt>}
			{(actions) ? (<Editable value={e} placeHolder={label} onEdit={separate ? actions.onEdit.bind(null,entity,name) : actions.onEditProperty.bind(null, name)} maxWidth={parentWidth}/>) : e && (<dd>{e}</dd>)}
		</dl>
	);
};