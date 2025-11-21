import React from "react";
import { Seq } from "immutable";
import Application from "../../application";
import view from "../base/view";
import Panel from "../base/panel";
import Table from "../base/table";
import Droppable from "../base/droppable";
import Add from "../../action/add";
import Update from "../../action/update";
import Component from "../../entity/Component";
import Regulator from "../../entity/Regulator";
import Dominance from "../../entity/Dominance";

const Content = ({view, model, persisted, entities, selected: { Component: e }, editable, draggable, actions}) => (
	<Panel {...view} className="add phase1-model2">
		<Table {...actions}
			onDrag={editable && actions.onDrag.bind(null, draggable)}
			persisted={persisted.Component}
			references={[entities.get("Component"), entities.get("Regulator")]}
			owner={model}
			selected={e}
			data={Seq(model.Component).filterNot(e => e.isExternal)}
			creator={() => new Component({ name: Application.defNameExt(model.Component, "", /^[A-Z]\d*$/i), isExternal: false })}
			search="name"
			columns={[
				{ get: "name", label: "Name", editable: editable, def: "_name" },
				{ get: e => Seq(e.upStreams).count(e => e.type), title: "Positive Regulators", style: "regulator number checkbox positive" },
				{ get: e => Seq(e.upStreams).count(e => !e.type), title: "Negative Regulators", style: "regulator number checkbox negative" }
			]}>
		</Table>
	</Panel>
);

const Header = ({name, dragging, actions}) => (dragging instanceof Component && dragging.isExternal ? (
	<div className="add">
		<Droppable onDrop={actions.onEdit.bind(this, dragging, "isExternal", false)}>Drop to Make Internal</Droppable>
	</div>
) : (<span>{name}</span>));

const copy = (name, source) => {
	const e = source.copy({ name: name, x: undefined, y: undefined }, []);
	const p = e.first().entity;
	let s = Seq(source.upStreams || {}).sort(Regulator.comparator).reverse().map(e => e.copy({ parent: p }, ["conditions"])).cacheResult();
	const map = s.map(e => e.first()).mapEntries(([_, e]) => [e.id, e.entity]).toObject();
	s = s.flatten(true).cacheResult();
	return e.concat(s, Seq(source.upStreams).filterNot(e => e.type).map(e => Seq(e.recessives).map(e => ({ entity: new Dominance({ positive: map[e.positiveId], negative: map[e.negativeId] }) }))).
		flatten(true), Seq(source.interactions).map(e => e.copy({ target: p, source: e.source === source ? p : e.source }).first())).map((e, i) => new Add(e.entity, !i)).
		concat(s.map(e => e.entity).filter(e => e.component === source).map(e => new Update(e, "component", p)));
};

const Actions = ({model, selected: {Biologic: bioModel, Component: component }, subSelected, editable, actions}) => ({

	add: editable && {
		title: "Create new Component",
		action: () => actions.onAdd(new Component({ name: Application.defNameExt(model.Component, '', /^[A-Z]\d*$/i), isExternal: false }), true)
	},
	remove: editable && component != null && !component.isExternal && {
		title: "Remove selected Component",
		action: () => {
			const subNodes = Seq(subSelected)
				.map(v => Seq(v).valueSeq())
				.valueSeq()
				.flatten(true);
			if (!subNodes.isEmpty()) {
				actions.onSelect(component);
				actions.batch(
					Seq(subNodes)
						.map(v => new Remove(v))
						.toArray(),
				);
			} else {
				actions.onRemove(component);
			}
		}
	},
	copy: { action: editable && bioModel != null && (() => actions.batch(copy(Application.defNameCopy(model.Component, bioModel), bioModel).toArray())), title: "Copy" }
});

export default view(Content, Header, Actions);
