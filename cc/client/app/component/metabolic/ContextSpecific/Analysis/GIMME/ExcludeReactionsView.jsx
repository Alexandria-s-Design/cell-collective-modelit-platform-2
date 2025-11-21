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
import ExcludeReaction, { ContextType } from "../../../../../entity/metabolic/ContextSpecific/ExcludeReaction";
import {csvParse} from "d3-dsv";
import "../style.scss";
import WarningValidator from "../../WarningValidator";


export const ExcludeReactionsViewBuilder = () => {

	const Content = (props) => {
		const {view, model, modelState: state, persisted, entities, selected: { ExcludeReaction: e }, actions} = props;
		
		const excludeReactionsPath = ['contextSpecificGIMME', 'excludeReactions'];
		const upload = state.getIn(excludeReactionsPath.concat(['upload']));
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
				const row = new ExcludeReaction({
					contextType: ContextType.GIMME,
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

		const tableData = Seq(model.ExcludeReaction).filter(r => r.contextType == ContextType.GIMME);
		const tableHeadHeight = 72;

		return (
			<Panel {...view} className="bar analysis1-phase1 panel-exclude-reactions">
				<ImportFile.ExcludeReactions
					actions={actions}
					download={upload}
					pathState={excludeReactionsPath.concat(['upload'])}
					btnDownload={true}
					onLoaded={handleCsvLoaded.bind(this)}
				/>
				<Table {...actions}
						onDrag={null}
						persisted={persisted.ExcludeReaction}
						references={[
							entities.get("ExcludeReaction")
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
	

	const addExcludeReaction = ({ model, selected, actions }) => {
		const defName = Application.defNameExt(model.ExcludeReaction, "r", /^r[A-Z]\d*$/i, { propertyName: "reactionId" });
		const updates = [ ];				
		const excludeReaction = new ExcludeReaction({
			contextType: ContextType.GIMME,
			reactionId: defName,
		});
		updates.push(new Add(excludeReaction));		
		actions.batch(updates);
	}

	const removeExcludeReaction = ({ model, selected: { ExcludeReaction: e }, actions }) => { 
		actions.batch([new Remove(e)]);
	};

	const downloadExcludeReaction = () => {
		return Utils.downloadFile("");
	}

	const Actions = (props) => {		
		const { model, modelState: state } = props;

		const emptyPanel = Seq(model.ExcludeReaction).cacheResult().isEmpty();
		const editable = emptyPanel === false;

		return {
			add: {
				action: model.id !== undefined && addExcludeReaction.bind(null, props),
				title: 'Add exclude Reaction'
			},
			remove: {
				action: editable && removeExcludeReaction.bind(null, props),
				title: 'Remove exclude Reaction'
			},
			download: {
				action: editable && downloadExcludeReaction.bind(null, props),
				title: 'Download exclude Reactions'
			}
		};
	};
	
	return view(Content, null, Actions);
}

export default ExcludeReactionsViewBuilder();