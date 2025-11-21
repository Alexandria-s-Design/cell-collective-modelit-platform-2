import React from "react";
import { Seq } from "immutable";
import Application from "../../../../application";
import util from "../../../../utils";
import view from "../../../base/view";
import Panel from "../../../base/panel";
import Table from "../../../base/table";
import Checkbox from "../../../base/checkbox";
import Add from "../../../../action/add";
import Remove from "../../../../action/remove";
//import Experiment from "../../../../entity/Experiment";
//import OutputRange from "../../../../entity/outputRange";
import { format } from "date-fns";
import ImportFile from "../ImportFileView";
import DrugScore from "../../../../entity/DrugScore";
import { FileReaderUtil } from "../../../../util/FileReaderUtil";
import { tsvParse, csvParse, dsvFormat } from "d3-dsv";
import Persist from "../../../../mixin/persist";
import DrugListControl from "./DrugListControl";
import DrugEnvironment from "../../../../entity/metabolic/DrugEnvironment";
import { convertDrugScoreToBlob } from "./convertDataToBlob";


export const DrugListViewBuilder = ({
	experimentType = null,
	expandedView = false,
} = { }) => {
	class Content extends React.Component {
		render ( ) {        
			const {view, model, modelState: state, persisted, entities, 
				selected: { DrugScore: selectedDrug, DrugEnvironment: environment }, actions} = this.props;

			expandedView = view.getState().expandedView;

			const analysisDrugPath = ['analysisDrugIdentification', 'drugList'];
			const uploadCSV = state.getIn(analysisDrugPath).toObject().upload;

			const tableColumns = [
				{ get: "name", label: "Drug Name", editable: true, def: "name" },
				{ get: "target", label: "Gene Target", editable: true, def: "target" }
			];
			if (!expandedView) {
				tableColumns.push({ get: "moa", label: "Mechanism", editable: true, def: "mechanism" });
				tableColumns.push({ get: "phase", label: "Approval Phase", editable: true, def: "phase" });
			}
			tableColumns.push({ get: "d_score", label: "Score", editable: true, def: "score" });

			let tableData = Seq([]);
			const tableHeadHeight = !uploadCSV ? 90 : 97;

			if (environment) {
				tableData = Seq(model.DrugScore).filter(d => d.parentId == environment.id);
			}

			const handleCsvLoaded = (contentFile, file, fileEl, editState) => {
				try {
					let errors = [];
					let csvDataParsed = [];
					if (FileReaderUtil.isCSV(file.type)) {
						let csvDelimiter = FileReaderUtil.csvContentDelimiter(contentFile);						
						if (csvDelimiter === FileReaderUtil.csvDelimiters.COMMA) {
								csvDataParsed = csvParse(contentFile);
						} else if (csvDelimiter === FileReaderUtil.csvDelimiters.TAB) {
								csvDataParsed = tsvParse(contentFile);
						} else {
								let ssvParse = dsvFormat(';');
								csvDataParsed = ssvParse.parse(contentFile);
						}
					} else if (FileReaderUtil.isXLS(file.type)) {
						let xls = new FileReaderUtil();
						xls.setXLSBinary(contentFile);
						let csvData = xls.getCSVfromXLS();
						csvDataParsed = csvParse(csvData);
					} else {
						throw new Error(`The file type ${file.type} was not recognized.`);
					}
					
					let parsedCols = csvDataParsed.columns;
					if (parsedCols.length < 2) {
						errors.push(`The file must contain at least 2 columns.`);
					}
					let requiredCols = ['Drug Name', 'Gene Target'];
					if (!requiredCols.every(col => csvDataParsed.columns.includes(col))) {
						errors.push(`The file must contain columns: ${requiredCols.map(col => `"${col}"`).join(', ')}.`);
					}
					if (errors.length) {
						throw new Error(errors.join(' '));
					}
					const updates = [];
					let selectedEnv = environment;

					if (!environment) {
						const newEnvDrug = new DrugEnvironment({name : Application.defName(model.DrugEnvironment, "Drug List ")});
						updates.push(new Add(newEnvDrug, true));
						selectedEnv = newEnvDrug;
					}				

					const dataDrugScore = Seq(model.DrugScore).filter(d => d.parentId == selectedEnv.id).toObject();
					const defCode = Application.defNameExt(dataDrugScore, "cd", /^cd[A-Z]\d*$/i, { propertyName: "code" });
					csvDataParsed.forEach((v, k) => {
						let row = new DrugScore({
							parent: selectedEnv,
							id: k+1,
							code: defCode+''+(k+1),
							name: v['Drug Name'],
							moa: v['moa'],
							target: v['Gene Target'],
							entrez_gene_id: null,
							phase: v['clinical_phase'],
							d_score: ''
						});
						updates.push(new Add(row));
					});
					if (editState) { editState() }
					actions.batch(updates);
				} catch(err) {
					fileEl.current.value = '';
					actions.onEditModelState(analysisDrugPath.concat(['upload']), null);
					actions.onShowMessageOnAction('Errors occurred during the file import: '+err.message);
				}
			}

			return (
				<Panel {...view} className="bar analysis1-phase1">
					<ImportFile.DrugList
						title='Import'
						actions={actions}
						download={uploadCSV}
						pathState={analysisDrugPath.concat(['upload'])}
						btnDownload={true}
						onLoaded={handleCsvLoaded.bind(this)}
					/>
					<Table {...actions}
						onDrag={null}
						references={[entities.get("DrugScore"), environment, expandedView]}
						owner={model}
						selected={selectedDrug}
						data={tableData}
						creator={() => {}}
						editable={e => !e.userId}
						headHeight={tableHeadHeight}
						columns={tableColumns}>
					</Table>
				</Panel>
			);
		}    
	}

	const addDrugRow = ({ model, selected: { DrugEnvironment: environment }, actions }) => {
		let selectedEnv = environment;
		const updates = [ ];
		
		if (!environment) {
			const newEnvDrug = new DrugEnvironment({name : Application.defName(model.DrugEnvironment, "Drug List ")});
			updates.push(new Add(newEnvDrug, true));
			selectedEnv = newEnvDrug;
		}

		let dataDrugScore = Seq(model.DrugScore).filter(d => d.parentId == selectedEnv.id).toObject();
		const defName = Application.defNameExt(dataDrugScore, "d", /^d[A-Z]\d*$/i);
		const defCode = Application.defNameExt(dataDrugScore, "cd", /^cd[A-Z]\d*$/i, { propertyName: "code" });
		const drugRow = new DrugScore({
			parent: selectedEnv,
			code: defCode,
			name: defName,
			moa: '',
			target: '',
			entrez_gene_id: null,
			phase: '',
			d_score: ''
		});
		updates.push(new Add(drugRow));		
		actions.batch(updates);
	}

	const removeDrugRow = ({ model, selected: { DrugScore: e }, actions }) => { 
		actions.batch([new Remove(e)]);
	};

	const downloadDrug = ({ model,  selected: { DrugEnvironment: environment } }) => {
		if (environment) {
			const dataDrugScore = Seq(model.DrugScore).filter(d => d.parentId == environment.id);
			const dateTimestamp = format(new Date(), "MMMM d, yyyy hh:mm aaaaa'm'");
			let filename = `drug_score_${model.top.Persisted}_${dateTimestamp}.csv`;
			const blob = convertDrugScoreToBlob(dataDrugScore);
			util.downloadBinary(filename, blob);
		}
	}

	const Actions = (props) => {
		const { view, model, modelState: state, selected: { DrugEnvironment: environment } } = props;

		let emptyPanel = true;
		if (environment) {
			emptyPanel = Seq(model.DrugScore).filter(d => d.parentId == environment.id).cacheResult().isEmpty();
		}
		
		const editable = emptyPanel === false;
		let expandedView = view.getState().expandedView;

		return util.pick({	
			envOption: (
				<span>
					<DrugListControl {...props} editable={true}/>
				</span>
			),
			add: {
				action: model.id !== undefined && addDrugRow.bind(null, props),
				title: 'Add Drug'
			},
			remove: {
				action: editable && removeDrugRow.bind(null, props),
				title: 'Remove Drug'
			},
			table: {
				title: "View/Hide Information",
				type: Checkbox,
				value: expandedView,
				style: "icon base-table checkbox",
				onEdit: e => {
					view.setState({ expandedView: e})
				}
			},
			download: {
				action: editable && downloadDrug.bind(null, props),
				title: 'Download Drug List'
			}
		});
	};
	
	const persist = Persist(
		{ expandedView: false },
		null,
		null,
		null,
		{ expandedView: true}
	)

	return view(Content, null, Actions, {}, [persist]);
}

export default DrugListViewBuilder();