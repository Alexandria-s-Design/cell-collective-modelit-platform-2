import React from "react";
import Editable from "./../../base/editable";

export default function WarningValidator(props) {

	const { value: cellValue, attr: cellAttr, actions, rule: isAlert } = props;

	const handleEdit = (val) => {
		if (!val) { return }
		if (cellAttr === 'upperBound' && parseInt(val) < parseInt(cellValue.lowerBound)) {
			val = cellValue.lowerBound;
		}
		if (cellAttr === 'lowerBound' && parseInt(val) > parseInt(cellValue.upperBound)) {
			val = cellValue.upperBound;
		}
		actions.onEdit(cellValue, cellAttr, val)
	}

	let warningIcon = () => {
		if (typeof isAlert === 'function' && isAlert(cellAttr, cellValue[cellAttr]) === true) {
			return <input type="button" className="icon base-info warning-icon" disabled title="Invalid value" />
		}
		return null;
	}

	return (<span>
		<Editable onEdit={handleEdit.bind(this)} value={cellValue[cellAttr]} />
		{warningIcon()}
	</span>)
}