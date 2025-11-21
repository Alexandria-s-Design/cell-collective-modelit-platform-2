import React from "react";
import { Seq } from "immutable";
import Utils from "../../utils";
import Application from "../../application";
import view from "../base/view";
import Panel from "../base/panel";
import Table from "../base/table";
import Checkbox from "../base/checkbox";
import FileInput from "../base/fileInput";

const Content = ({view, model, player}) => {
	const record = player.record;
	const actions = record ? record.actions : model.logger && model.logger.actions;
	const position = player.position;
	const processed = player.runner || position >= 0 ? position >= 0 && actions[position].id : -Number.MAX_VALUE;

	const name = e => (e = (record ? player.map && player.map[e.className][e.id] : (model["_" + e.className] || model.top["_" + e.className])[e.id])) && (e.name || (e.component && e.component.name) || e.id);

	const rEntity = e => (
		<dl className={e.action}>
			<dt>{e.entity.className}</dt>
			<dd>{e.entity.id ? name(e.entity) : "null"}</dd>
		</dl>
	);

	const rProperties = (t, p) => {
		let i, values = t && Application.values[t];
		return (
			<span className="properties">
				{Seq(p).filterNot((_, k) => values && (k = values[k]) && !k.to).map((v, k) => (
					<dl key={k}>
						<dt>{k}</dt>
						<dd>{values && (i = values[k]) ? i.to[v] || "null" : (v != null ? (v.className ? name(v) : v.toString()) : "null")}</dd>
					</dl>)).toArray()}
			</span>);
	};

	const transform = e => {
		const o = {};
		let p = e.property;

		if (Array.isArray(p)) {
			p = p.map(e => (e.className ? name(e) : e));
			e.type && p.unshift(e.type);
			p = "[" + p + "]";
		}
		o[p] = e.value;
		return o;
	};

	const rLog = e => {
		switch (e.group) {
		case "Entity":
			switch (e.action) {
			case "add": return (
				<span>
					{rEntity(e)}
					{rProperties(e.entity.className, e.properties)}
				</span>);
			case "update": return (
				<span>
					{rEntity(e)}
					{rProperties(e.entity.className, transform(e))}
				</span>);
			case "remove":
			case "select": return rEntity(e);
			}
		case "Model": return e.action === "update" && rProperties("Model", transform(e));
		case "State": return rProperties(null, transform(e));
		case "Simulation": return e.entity && rEntity(e);
		case "Layout":
			switch(e.action){
			case "changeWorkspace":
				return JSON.stringify(e.ws);
			default:
				return e.name;
			}
		}
	};

	return (
		<Panel {...view} className="bar logger">
			<Table
				references={[actions && actions.length, processed]}
				owner={record || model}
				selected={record && actions[position]}
				data={Seq(actions)}
				search="action"
				columns={[
					{ get: e => -e.id, format: e => Math.round(0.001 * e.time), title: "Time", style: "checkbox number time" },
					{ get: e => e.group + "." + e.action, format: e => (<span className={e.action}>{e.group + "." + e.action}</span>), label: "Action", style: "middle" },
					{ get: "id", format: e => (<span className={Utils.css(e.id < processed && "dirty")}>{rLog(e)}</span>), sortable: false, label: "Description" }
				]}>
			</Table>
		</Panel>
	);
};

const upload = (player, e) => {
	e = e[0];
	const fr = new FileReader();
	fr.onload = () => player.load(e.name, JSON.parse(fr.result));
	fr.readAsText(e);
};

const download = e => Utils.downloadBinary(e.name + " (" + new Date(e.logger.time).toLocaleString().replace(/[/:]/g, "-").replace(/,/g, "") + ").json", new Blob([JSON.stringify(e.logger)], { type: "application/json" }));

const Actions = props => {
	const {view, model, player, player: {record}} = props;
	return {
		run: { type: Checkbox, value: player.runner, onEdit: record && (e => (e ? player.start() : player.stop())) },
		rewind: { type: Checkbox, value: view.getState().rewind, onEdit: e => view.setState({ rewind: player.rewind = e }) },
		upload: { type: FileInput, ext: ".json", onChange: upload.bind(null, player) },
		download: model.logger && model.logger.actions.length > 0 && download.bind(null, model)
	};
};

export default view(Content, ({title, player, name}) => title(player, name), Actions);
