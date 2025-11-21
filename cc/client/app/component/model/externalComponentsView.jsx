import React from "react";
import { Seq } from "immutable";
import Application from "../../application";
import view from "../base/view";
import Panel from "../base/panel";
import Table from "../base/table";
import Droppable from "../base/droppable";
import Update from "../../action/update";
import Remove from "../../action/remove";
import Component from "../../entity/Component";

const Content = ({view, model, persisted, entities, selected: { Component: e }, editable, draggable, actions}) => (
	<Panel {...view} className="bar">
		<Table {...actions}
			onDrag={editable && actions.onDrag.bind(null, draggable)}
			persisted={persisted.Component}
			references={[entities.get("Component")]}
			owner={model}
			selected={e}
			data={Seq(model.Component).filter(e => e.isExternal)}
			creator={() => new Component({ name: Application.defNameExt(model.Component, "e", /^e[A-Z]\d*$/i), isExternal: true })}
			master={false}
			search="name"
			columns={[
				{ get: "name", label: "Name", editable: editable, def: "_name" }
			]}>
		</Table>
	</Panel>
);

const Header = ({name, dragging: e, actions}) => (e instanceof Component && !e.isExternal ? (
	<div className="add">
		<Droppable onDrop={() => actions.batch(Seq([new Update(e, "isExternal", true)]).concat(Seq(e.upStreams).map(e => new Remove(e))).toArray())}>Drop to Make External</Droppable>
	</div>
) : (<span>{name}</span>));

const Actions = ({model, selected: { Component: component }, subSelected, editable, actions}) => ({
	add: editable && {
		title: "Create new Component",
		action: () => actions.onAdd(new Component({ name: Application.defNameExt(model.Component, '', /^[A-Z]\d*$/i), isExternal: true }), true)
	},
	remove: editable && component != null && component.isExternal && {
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
	}
});

export default view(Content, Header, Actions);
