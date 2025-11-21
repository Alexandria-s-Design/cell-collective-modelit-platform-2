import React from "react";
import { Seq } from "immutable";
import Editable from "../base/editable";
import Options from "../base/options";
import Add from "../../action/add";
import Remove from "../../action/remove";
import Entity from "../../entity/Entity";

export default ({entity, name, parse, format, label, placeHolder, actions, parentWidth}) => {
	const d = Entity[name = "m" + name];
	const v = Seq(entity[name]).first();

	const rValue = () => {
		const edit = e => (e !== undefined ? (v ? actions.onEdit(v, "value", parse ? parse(e, v.value) : e) : (!parse || (e = parse(e)) !== undefined) && actions.onAdd(new d({ value: e }))) : actions.onRemove(v));
		return actions ? (<Editable className="bold" value={v && v.value} placeHolder={placeHolder} onEdit={edit} maxWidth={parentWidth - 8*(label.length+1)}/>) : (<dd>{v && (format ? format(v.value) : v.value)}</dd>);
	};

	const rReference = () => {
		let p = d.prototype;
		const edit = e => actions.batch([v && new Remove(v), e && new Add(new d({ valueId: e.id }))]);
		return actions ? (<Options get="value" value={v && v.value} def={p.def} options={Seq(p.values).sortBy(e => e.position)} onChange={edit}/>) : (<dd>{(p = (v && v.value || p.def)) && p.value}</dd>);
	};

	return (
		<dl>
			{label && (<dt>{label + ":"}</dt>)}
			{d.prototype.values ? rReference() : rValue()}
		</dl>
	);
};