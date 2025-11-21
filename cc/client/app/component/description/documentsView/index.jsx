import React from "react";
import { Seq, Map } from "immutable";
import Utils from "../../../utils";
import Application from "../../../application";
import view from "../../base/view";
import Panel from "../../base/panel";
import Table from "../../base/table";
import Checkbox from "../../base/checkbox";
import FileInput from "../../base/fileInput";
import Add from "../../../action/add";
import Remove from "../../../action/remove";
import Entity from "../../../entity/Entity";

const DocumentComponent = ({view, model, entities, selected: { Document: selected }, editable, actions}) => {
	const educationCondition = (Application.isEducation && Application.domain === "teaching") || !Application.isEducation;
	editable = educationCondition && editable;
	const { entity, progress } = view.getState();
	const binding = e => Seq(e.bindings).first();
	const isPublic = e => binding(e).className === "mDocumentPublic";
	const flip = (evt, e) => {
		evt.stopPropagation();
		edit(e, !isPublic(e));
	};
	const edit = (e, v) => (e = binding(e)) && actions.batch([new Remove(e), new Add(new Entity["mDocument" + (v ? "Public" : "Private")]({ value: e.value, position: e.position }))]);
	const rProgress = e => (
		<div className="progress">
			{e}
			<div style={{width: e}}/>
		</div>
	);

	const cols = [
		{ get: "name", label: "File Name", style: "large" },
                { get: "description", label: "Description", editable: editable },
                { get: "uploaded", format: e => (e.uploaded ? e.uploaded.toLocaleDateString() : rProgress(progress.get(e.id, 0) + '%')), label: "Uploaded", style: "date", minWidth: 500 }
	];
	if( Application.domain === "teaching" ){
		cols.push({
			get: isPublic, label: "Publish to: ", format: e => <span className="expand" onClick={editable && Application.domain === "teaching" && e.uploaded ? (evt) => { flip(evt, e) } : null}>{isPublic(e) ? "Everyone" : "Instructors Only"}</span>, style: 'middle'
		});
	}

	return (
		<Panel {...view}>
			<Table {...actions}
				onDrag={null}
				references={[entities.get("Document"), entities.get("mDocumentPublic"), entities.get("mDocumentPrivate"), entity, progress]}
				owner={model}
				selected={selected}
				data={entity.concat(model.mDocumentPublic || {}, model.mDocumentPrivate || {}).map(e => e.value)}
				search={null}
				cursor="pointer"
				onClick={(document) => {
					if ( document && document.token ) {
						Utils.downloadFile(Application.url(document))
					}
				}}
				columns={cols}>
			</Table>
		</Panel>
	);
};

const init = ({view, model}, e) => {
	const entities = view.getState().entity;
	let i = ((entities.size ? entities : Seq(model.mDocumentPublic || {}).concat(model.mDocumentPrivate || {})).map(e => e.position).max() + 1) || 0;
	view.setState({ entity: entities.concat(e.toKeyedSeq().mapEntries(([_, e]) => [e.id, new Entity.mDocumentPrivate({ value: e, position: i++ })])) });
};

const done = ({view, actions}, k, v) => {
	const id = v.get("id");
	const entities = view.getState().entity;
	const e = entities.get(id);
	e.value.Persisted = k;
	view.setState({ entity: entities.delete(id) });
	actions.batch([new Add(e.value.set(v)), new Add(e)]);
};

const progress = ({view}, e, p) => view.setState({ progress: view.getState().progress.set(e.id, Math.round(100 * p.loaded / p.total)) });

const Actions = props => {
	const {selected: { Document: e }, editable, actions} = props;
	return {
		upload: editable ? { type: FileInput, ext: ".pdf,.txt,.jpg,.jpeg,.png", multiple: true, onChange: actions.uploadDocuments.bind(null, init.bind(null, props), done.bind(null, props), progress.bind(null, props)) } : null,
		remove: editable && (e && e.token) != null && null,
		download: (e && e.token) != null && Utils.downloadFile.bind(null, Application.url(e))
	};
};
const EduActions = Application.domain === "teaching" ? props => {
	const {selected: { Document: e }, editable, actions} = props;
	return editable ? {
		add: { type: FileInput, ext: ".pdf,.txt,jpg,.jpeg,.png", multiple: true, onChange: actions.uploadDocuments.bind(null, init.bind(null, props), done.bind(null, props), progress.bind(null, props)) },
		remove: (e && e.token) != null && null
	} : null;
} : null;

const LearningDocumentsView = view(DocumentComponent, () => (<div className="bar">Supporting Materials</div>), EduActions, { entity: new Map(), progress: new Map() });
export { LearningDocumentsView };
export default view(DocumentComponent, null, Actions, { entity: new Map(), progress: new Map() });