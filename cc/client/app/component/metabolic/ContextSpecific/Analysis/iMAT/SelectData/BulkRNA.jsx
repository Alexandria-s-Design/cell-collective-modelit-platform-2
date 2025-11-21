import React from "react";
import { Seq, Map } from "immutable";
import Options from "../../../../../base/options";
import SliderInput from "../../../../../base/sliderInput";
import Utils from "../../../../../../utils";
import ImportFile from "../../../ImportFileView";
import { csvParse } from "d3-dsv";
import { FileReaderUtil } from "../../../../../../util/FileReaderUtil";
import Range from "../../../../../../mixin/range";


export default function BulkRNA({ optionsLayout, optionsMethod, actions, state, editable }) {

	const bulkRNAPath = ['contextSpecificiMAT', 'typeBulkTotalRNA'];
	const componentStates = state.getIn(bulkRNAPath).toObject();
	const uploadCSV = state.getIn(bulkRNAPath.concat(['upload']));
	const selectedMethod = state.getIn(bulkRNAPath.concat(['method']));
	const selectedLayout = state.getIn(bulkRNAPath.concat(['layout']));
	const minimumActivityLevelValue = state.getIn(bulkRNAPath.concat(['methodActivity']));
	const methodActivityRange = state.getIn(bulkRNAPath.concat(['methodActivityRange']));
	const disabledRangeValue = 999;
	let stateData = state.getIn(bulkRNAPath);
	//console.log("stateData ", stateData)

	const handleSelectLayout = (e) => {
		actions.onEditModelState(bulkRNAPath.concat(['layout']), e)
	}

	const handleSlider = (type, e) => {
		actions.onEditModelState(bulkRNAPath.concat([type]), e);
	}

	const handleSelectMethod = (e) => {
		stateData = { ...stateData.toObject() };
		let optValue = stateData.methodActivity;
		let optRange = stateData.methodActivityRange;
		stateData.method = e;
		switch (e.id) {
			case 'zfpkm': optRange.min = -5; optRange.max = 5; optValue = -3; break;
			case 'quantile': optRange.min = 0; optRange.max = 100; optValue = 50; break;
			case 'cpm': optRange.min = 0; optRange.max = disabledRangeValue; optValue = 0; break;
			default: ;
		}
		stateData.methodActivity = optValue;
		stateData.methodActivityRange = optRange;
		actions.onEditModelState(bulkRNAPath, new Map(stateData));
	}

	const getSelectedOption = (e) => {
		return typeof (e) == 'string' ? Utils.capitalize(e) : e.name;
	}

	const handleUploadLoaded = (contentFile, file, fileEl, editState) => {
		try {
			if (FileReaderUtil.isCSV(file.type)) {
				let errors = [];
				let dataParsed = csvParse(contentFile);
				let dataParsedCols = dataParsed.columns;
				if (dataParsedCols.length < 2) {
					errors.push('The CSV file should have at least 2 columns.');
				}
				if (dataParsedCols[0] !== 'genes') {
					errors.push('The CSV file should have the 1st column named \'genes\'.');
				}
				for (const row of dataParsed) {
					for (const [rKey, rVal] of Seq(row).skip(1).entries()) {
						if (/\D/.test(rVal)) {
							throw new Error(`The line '${row['genes']}' and column '${rKey}' should have a numerical value.`);
						}
					}
				}
				if (errors.length) {
					throw new Error(errors.join(' '));
				}
			} else if (FileReaderUtil.isXLS(file.type)) {
				let errors = [];
				let xls = new FileReaderUtil();
				xls.setXLSBinary(contentFile);
				let dataParsed = xls.getXLSCols();
				dataParsed = dataParsed.columns;
				if (dataParsed.length < 2) {
					errors.push('The Excel file should have at least 2 columns.');
				}
				if (dataParsed[0] !== 'genes') {
					errors.push('The Excel file should have the 1st column named \'genes\'.');
				}
				if (errors.length) {
					throw new Error(errors.join(' '));
				}
			} else {
				throw new Error(`The file type ${file.type} was not recognized.`);
			}
			if (editState) { editState() }
		} catch (err) {
			fileEl.current.value = '';
			actions.onEditModelState(bulkRNAPath.concat(['upload']), null);
			actions.onShowMessageOnAction('Errors occurred during the file import: ' + err.message);
		}
	}

	const styles = {
		disabledStyle: !editable ? { pointerEvents: 'none', opacity: 0.5 } : {},
		disabledTextStyle2: { color: '#c0c0c0', display: 'flex' },
		line: {
			width: "21%",
			height: "1px",
			backgroundColor: "#c0c0c0",
			transform: "translateY(-50%)",
			marginTop: "10px"
		}
	};

	return (
		<div className="bottom">
			<ImportFile.BulkRNA
				actions={actions}
				download={uploadCSV}
				pathState={bulkRNAPath.concat(['upload'])}
				btnDownload={true}
				onLoaded={handleUploadLoaded.bind(this)}
			/>
			<div style={styles.disabledStyle}>
				<dt>
					<dd>Sequencing Layout:</dd>
					<Options none={'Select Layout'}
						value={selectedLayout}
						get={getSelectedOption}
						options={optionsLayout.sortBy(e => (e && e.name && e.name.toLowerCase()))}
						enabled={optionsLayout.size}
						editable={editable}
						dropdowIcon="base-menu-gray"
						onChange={handleSelectLayout} />
				</dt>
				<div className="underline">Normalization</div>
				<dt>
					<dd>Method:</dd>
					<Options none={'Select'}
						value={selectedMethod}
						get={getSelectedOption}
						options={optionsMethod.sortBy(e => (e && e.name && e.name.toLowerCase()))}
						enabled={optionsMethod.size}
						editable={editable}
						dropdowIcon="base-menu-gray"
						onChange={handleSelectMethod} />
				</dt>
				<dt>
					{!(methodActivityRange.max === disabledRangeValue || Number.isNaN(stateData.methodActivity)) ? (
						<SliderInput
							min={methodActivityRange.min}
							max={methodActivityRange.max}
							value={minimumActivityLevelValue} //minimumActivityLevelValue
							maxLength={3}
							format={methodActivityRange.max === disabledRangeValue && (() => "NA")}
							onEdit={handleSlider.bind(null, 'methodActivity')} 
						/>
					) : (<div style={styles.disabledTextStyle2}>
						Minimum Activity Level:
						<div style={styles.line}></div>
						<div style={{ display: 'inline-block', marginLeft: '8px' }}>
							N/A
						</div>
					</div>)}
				</dt>
				<div className="underline">Activity Ratios</div>
				<dt>
					<dd>Gene-to-Replicate: </dd>
					<SliderInput
						min={0} max={1.001}
						value={componentStates.geneReplicate}
						maxLength={3}
						format={(v) => Utils.toFixed1Float(v)} 
						onEdit={handleSlider.bind(null, 'geneReplicate')}
						step={0.1} 		
					/>
				</dt>
				<dt>
					<dd>Gene-to-Group: </dd>
					<SliderInput
						min={0} max={1.001}
						value={componentStates.geneGroup}
						maxLength={3}
						format={(v) => Utils.toFixed1Float(v)} 
						onEdit={handleSlider.bind(null, 'geneGroup')}
						step={0.1}
					/>
				</dt>
				<dt>
					<dd>High Confidence Gene-to-Replicate: </dd>
					<SliderInput
						min={0} max={1.001}
						value={componentStates.highConfidenceGeneReplicate}
						maxLength={3}
						format={(v) => Utils.toFixed1Float(v)} 
						onEdit={handleSlider.bind(null, 'highConfidenceGeneReplicate')}
						step={0.1}
					/>
				</dt>
				<dt>
					<dd>High Confidence Gene-to-Group: </dd>
					<SliderInput
						min={0} max={1.001}
						value={componentStates.highConfidenceGeneGroup}
						maxLength={3}
						format={(v) => Utils.toFixed1Float(v)} 
						onEdit={handleSlider.bind(null, 'highConfidenceGeneGroup')}
						step={0.1}
					/>
				</dt>
			</div>
		</div>
	)
}