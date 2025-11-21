import React from "react";
import Editable from "../base/editable";

export default ({entity, name, label, format, formatTitle, placeHolder, actions, parentWidth, hideEmpty, separate}) => {
	const e = entity[name];
	return (
		<dl>
			<dt>{label + ":"}</dt>
			{actions && !format ? (<Editable className="bold" value={e} placeHolder={placeHolder || label} onEdit={separate ? actions.onEdit.bind(null,entity,name) : actions.onEditProperty.bind(null, name)} maxWidth={parentWidth - 8*(label.length+1)}/>) :
				(<dd title={formatTitle ? formatTitle(e) : undefined}>{format ? format(e) : e}</dd>)}
		</dl>
	);
};