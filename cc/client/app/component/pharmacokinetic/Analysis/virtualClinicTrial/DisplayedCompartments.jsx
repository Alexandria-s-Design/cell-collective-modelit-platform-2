import React from "react";
import view from "../../../base/view";
import Panel from "../../../base/panel";
import Table from "../../../base/table";
import { Seq, Map } from "immutable";
import utils from "../../../../utils";

class Content extends React.Component {
	constructor(props) {
		super(props);
		this.state = { running: false };
	}

	render() {
		const props = this.props;
		const { model, actions, persisted, entities, modelState, editable, draggable } = props;
		let expandedView = false;
		let data = Seq(model.Compartment);
		// expandedView = state.expandedView;

		return (
			<Panel {...props.view}>
				<Table {...actions} top="10%"
					onDrag={(editable || isDraggable) && actions.onDrag.bind(null, draggable)}
					persisted={persisted.Reaction}
					references={[
						entities.get("Reaction"),
						entities.get("Experiment"),
						modelState.get("Reaction"),
					]}
					owner={model}
					// selected={reaction}
					// onSelect={e => onSelectKBEntity(props, e)}
					data={data}
					// creator={() => createReaction(props)}
					search="name"
					columns={[
						expandedView && {
							get: "compartment_id", label: "ID", editable: editable, def: "compartment_id"
						},
						{
							get: "name", label: "Name", editable: editable, def: "_name"
						},
						// showVisibility && {
						// 	get: e => getModelState(e, "visibility"),
						// 	title: "Visible",
						// 	format: e => (
						// 		<Checkbox
						// 			value={getModelState(e, "visibility")}
						// 			onEdit={editable && editModelState.bind(null, e, "visibility")}/>
						// 	),
						// 	style: "checkbox visibility"
						// },

					].filter(Boolean)}>
				</Table>
			</Panel>
		);
	}
}

const Actions = (props) => {
	let { editable } = props;
	editable = editable;

	return utils.pick({
		add: editable && {
			title: "Create a new Gene",
			// action: (() => createGene(props))
		},
		remove: editable != null && {
			title: "Remove selected Gene(s)",
			// action: (() => removeGene(props))
		}
	}, editable)
}


export default view(Content, null, Actions);
