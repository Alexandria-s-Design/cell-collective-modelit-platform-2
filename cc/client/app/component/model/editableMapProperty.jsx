import React from "react"
import Utils from "../../utils"
import Editable from "../base/editable"

export default ({ entity, property, min, max, label, onEdit, parentWidth, postfix }) => (
	<dl>
		<dt>{label + ":"}</dt>
		<Editable className="bold" value={entity.get(property)} maxLength={max && max.toString().length} onEdit={onEdit && (v => onEdit(entity, property, max ? Utils.range(parseInt(v) || 0, min, max) : v))}
			maxWidth={parentWidth - 8 * (label.length + 1)} />
		<b>{postfix}</b>
	</dl>
)
