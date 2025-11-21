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
import BoundaryControl from "../../../Model/BoundaryControl";
import BoundaryReaction, { ContextType } from "../../../../../entity/metabolic/ContextSpecific/BoundaryReaction";
import {csvParse} from "d3-dsv";
import "../style.scss";
import { FileReaderUtil } from "../../../../../util/FileReaderUtil";
import WarningValidator from "../../WarningValidator";


export const BoundaryReactionsViewBuilder = () => {

	const Content = (props) => {
		const {view, model, modelState: state, persisted, entities, selected: { BoundaryReaction: e }, actions} = props;

		const boundaryReactionsPath = ['contextSpecificGIMME', 'boundaryReactions'];
		const upload = state.getIn(boundaryReactionsPath.concat(['upload']));
		const customOptions = Seq([
			{ id: 0, name: 'Sink' },
			{ id: 1, name: 'Demand' },
			{ id: 2, name: 'Exchange' },
		]);

		const alertRules = {
			Reaction: (attr, val) => {
				let alertVal = Seq(model.Reaction).find(r => r.reactionId == val);
				return alertVal === undefined;
			},
			Compartment: (attr, val) => {
				let alertVal = Seq(model.Compartment).find(c => {
					return c.self.get('compartmentId') == val
				});
				return alertVal === undefined;
			},
			Bound: (attr, val) => {
				if (val >= -1000 && val <= 1000) { return	}
				return true
			}
		}
		
		const tableColumns = [
			{ get: "reactionId", label: "Reaction ID", def: "_reaction_id",
				format: e => <WarningValidator key={e.id} value={e} attr='reactionId' {...props} rule={alertRules.Reaction} />
			},
			{ get: "boundary", label: "Boundary", def: "_boundary", format: e => <BoundaryControl key={e.id} e={e} customOptions={customOptions} {...props} /> },
			{ get: "compartmentId", label: "Compartment", def: "_compartment_id",
				format: e => <WarningValidator key={e.id} value={e} attr='compartmentId' {...props} rule={alertRules.Compartment} />
			},
			{ get: "lowerBound", label: "Lower bound", def: "_lower_bound",
				format: e => <WarningValidator key={e.id} value={e} attr='lowerBound' {...props} rule={alertRules.Bound} />
			},
			{ get: "upperBound", label: "Upper bound", def: "_upper_bound",
				format: e => <WarningValidator key={e.id} value={e} attr='upperBound' {...props} rule={alertRules.Bound} />
			}
		];
		const tableData = Seq(model.BoundaryReaction).filter(r => r.contextType == ContextType.GIMME);
		const tableHeadHeight = 72;

		const handleCsvLoaded = (contentFile, file, fileEl, editState) => {
			try {
				let errors = [];
				let csvDataParsed = [];
				if (FileReaderUtil.isCSV(file.type)) {
					csvDataParsed = csvParse(contentFile);
				} else if (FileReaderUtil.isXLS(file.type)) {
					let xls = new FileReaderUtil();
					xls.setXLSBinary(contentFile);
					let csvData = xls.getCSVfromXLS();
					csvDataParsed = csvParse(csvData);
				} else {
					throw new Error(`The file type ${file.type} was not recognized.`);
				}

				let parsedCols = csvDataParsed.columns;
				if (parsedCols.length !== tableColumns.length) {
					errors.push('The file should have 5 columns.');
				}
				let mockupsCols = tableColumns.map(cl => cl.label);
				if (parsedCols.map(cl => `${cl}`.trim()).join('').toLowerCase() != mockupsCols.join('').toLowerCase()) {
					errors.push(`The headers in your file must match with -- "${mockupsCols.join(', ')}"`);
				}
				if (errors.length) {
					throw new Error(errors.join(' '));
				}
				const updates = [];
				csvDataParsed.forEach(v => {
					let row = new BoundaryReaction({
						contextType: ContextType.GIMME,
						reactionId: v.reaction_id || v['Reaction ID'],
						boundary: v.boundary || v.Boundary,
						compartmentId: v.compartment_id || v.Compartment,
						lowerBound: v.lower_bound || v['Lower Bound'],
						upperBound: v.upper_bound || v['Upper Bound']
					});
					updates.push(new Add(row));
				});
				actions.batch(updates);
				if (editState) { editState() }
			} catch(err) {
				fileEl.current.value = '';
				actions.onEditModelState(boundaryReactionsPath.concat(['upload']), null);
				actions.onShowMessageOnAction('Errors occurred during the file import: '+err.message);
			}
		}

		return (
			<Panel {...view} className="bar analysis1-phase1 panel-boundary-reactions">
				<ImportFile.BoundaryReactions
					actions={actions}
					download={upload}
					pathState={boundaryReactionsPath.concat(['upload'])}
					btnDownload={true}
					onLoaded={handleCsvLoaded.bind(this)}
				/>
				<Table {...actions}
						onDrag={null}
						references={[
							entities.get("BoundaryReaction")
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
	
	const addBoundary = ({ model, selected, actions }) => {
		const defName = Application.defNameExt(model.BoundaryReaction, "r", /^r[A-Z]\d*$/i, { propertyName: "reactionId" });
		const updates = [ ];				
		const boudaryReaction = new BoundaryReaction({
			contextType: ContextType.GIMME,
			reactionId: defName,
			boundary: null,
			lowerBound: -1,
			upperBound: 1,
			compartment: null
		});
		updates.push(new Add(boudaryReaction));		
		actions.batch(updates);
	}

	const removeBoundary = ({ model, selected: { BoundaryReaction: e }, actions }) => { 
		actions.batch([new Remove(e)]);
	};

	const downloadBoundary = () => {
		return Utils.downloadFile("");
	}

	const Actions = (props) => {		
		const { model, modelState: state } = props;

		const emptyPanel = Seq(model.BoundaryReaction).cacheResult().isEmpty();
		const editable = emptyPanel === false;

		return {
			add: {
				action: model.id !== undefined && addBoundary.bind(null, props),
				title: 'Add Boundary Reaction'
			},
			remove: {
				action: editable && removeBoundary.bind(null, props),
				title: 'Remove Boundary Reaction'
			},
			download: {
				action: editable && downloadBoundary.bind(null, props),
				title: 'Download Boundary Reactions'
			}
		};
	};
	
	return view(Content, null, Actions);
}

export default BoundaryReactionsViewBuilder();