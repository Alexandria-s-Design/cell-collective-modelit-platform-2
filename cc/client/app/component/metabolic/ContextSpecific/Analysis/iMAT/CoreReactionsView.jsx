import React from "react";
import { Seq } from "immutable";
import Application from "../../../../../application";
import view from "../../../../base/view";
import Panel from "../../../../base/panel";
import Table from "../../../../base/table";
import Add from "../../../../../action/add";
import Remove from "../../../../../action/remove";
import ImportFile from "../../ImportFileView";
import Utils from "../../../../../utils";
import CoreReaction, { ContextType } from "../../../../../entity/metabolic/ContextSpecific/CoreReaction";
import {csvParse} from "d3-dsv";
import "./style.scss";
import WarningValidator from "../../WarningValidator";


export const CoreReactionsViewBuilder = () => {

	const Content = (props) => {
		const {view, model, modelState: state, persisted, entities, selected: { CoreReaction: e }, actions} = props;
		
		const coreReactionsPath = ['contextSpecificiMAT', 'coreForceReactions'];
		const upload = state.getIn(coreReactionsPath.concat(['upload']));
		const alertRules = {
			Reaction: (attr, val) => {
				let alertVal = Seq(model.Reaction).find(r => r.reactionId == val);
				return alertVal === undefined;
			},
		}

		const handleCsvLoaded = (csvData, _, __, editState) => {
			const csvDataParsed = csvParse(csvData);
			const updates = [];
			csvDataParsed.forEach(v => {
				const row = new CoreReaction({
					contextType: ContextType.iMAT,
					reactionId: v.reaction_id || v['Reaction ID'],
				});
				updates.push(new Add(row));
			});
			actions.batch(updates);
			if (editState) { editState() }
		}

		const tableColumns = [
			{ get: "reactionId", label: "Reaction ID", def: "_reaction_id",
				format: e => <WarningValidator key={e.id} value={e} attr='reactionId' {...props} rule={alertRules.Reaction} />
			},
		];

		const tableData = Seq(model.CoreReaction).filter(r => r.contextType == ContextType.iMAT);
		const tableHeadHeight = 72;

		return (
			<Panel {...view} className="bar analysis1-phase1 panel-core-reactions">
				<ImportFile.CoreReactions
					actions={actions}
					download={upload}
					pathState={coreReactionsPath.concat(['upload'])}
					btnDownload={true}
					onLoaded={handleCsvLoaded.bind(this)}
				/>
				<Table {...actions}
						onDrag={null}
						references={[
							entities.get("CoreReaction"),
						]}
						owner={model}
						selected={e}
						data={tableData}
						creator={() => {}}
						headHeight={tableHeadHeight}
						columns={tableColumns}>
				</Table>
			</Panel>
		)
	}

	const addReaction = ({ model, selected, actions }) => {
		const defName = Application.defNameExt(model.CoreReaction, "r", /^r[A-Z]\d*$/i, { propertyName: "reactionId" });
		const updates = [ ];				
		const coreReaction = new CoreReaction({
			contextType: ContextType.iMAT,
			reactionId: defName,
		});
		updates.push(new Add(coreReaction));		
		actions.batch(updates);
	}

	const removeReaction = ({ model, selected: { CoreReaction: e }, actions }) => {
		actions.batch([new Remove(e)]);
	};

	const downloadReaction = () => {
		return Utils.downloadFile("");
	}

	const Actions = (props) => {	

		const { model, modelState: state } = props;

		const emptyPanel = Seq(model.CoreReaction).cacheResult().isEmpty();
		const editable = emptyPanel === false;

		return {
			add: {
				action: model.id !== undefined && addReaction.bind(null, props),
				title: 'Add Reaction'
			},
			remove: {
				action: editable && removeReaction.bind(null, props),
				title: 'Remove Reaction'
			},
			download: {
				action: editable && downloadReaction.bind(null, props),
				title: 'Download Reactions'
			}
		};
	};
	
	return view(Content, null, Actions);
}

export default CoreReactionsViewBuilder();