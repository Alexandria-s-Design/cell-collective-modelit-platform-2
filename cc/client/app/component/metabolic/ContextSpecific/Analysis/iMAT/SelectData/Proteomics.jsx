import React from "react";
import { Seq, Map } from "immutable";
import SliderInput from "../../../../../base/sliderInput";
import Utils from "../../../../../../utils";
import ImportFile from "../../../ImportFileView";
import {csvParse} from "d3-dsv";
import { FileReaderUtil } from "../../../../../../util/FileReaderUtil";

export default function Proteomics({ actions, state, editable }) {
	
	const proteomicsPath = ['contextSpecificiMAT', 'typeProteomics'];
	const componentStates = state.getIn(proteomicsPath).toObject();

	const handleSlider = (type, e) => {
		actions.onEditModelState(proteomicsPath.concat([type]), e);
	}

	const handleUploadLoaded = (contentFile, file, fileEl, editState) => {
		try {
			if (FileReaderUtil.isCSV(file.type)) {
				let errors = [];
				let dataParsed = csvParse(contentFile);
				dataParsed = dataParsed.columns;
				if (dataParsed.length < 2) {
					errors.push('The CSV file should have at least 2 columns.');
				}
				if (dataParsed[0] !== 'SampleName') {
					errors.push('The CSV file should have the 1st column named \'SampleName\'.');
				}
				if (dataParsed[1] !== 'Group') {
					errors.push('The CSV file should have 2nd column named \'Group\'.');
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
				if (dataParsed[0] !== 'SampleName') {
					errors.push('The Excel file should have the 1st column named \'SampleName\'.');
				}
				if (dataParsed[1] !== 'Group') {
					errors.push('The Excel file should have the 2nd column named \'Group\'.');
				}
				if (errors.length) {
					throw new Error(errors.join(' '));
				}
			} else {
				throw new Error(`The file type ${file.type} was not recognized.`);
			}
			if (editState) { editState() }
		} catch(err) {
			fileEl.current.value = '';
			actions.onEditModelState(proteomicsPath.concat(['upload']), null);
			actions.onShowMessageOnAction('Errors occurred during the file import: '+err.message);
		}
	}

	const disabledStyle = !editable ? {pointerEvents: 'none', opacity: 0.5} : {};

	return (<div className="bottom">
			<ImportFile.Proteomics
				actions={actions}
				download={componentStates.upload}
				pathState={proteomicsPath.concat(['upload'])}
				btnDownload={true}
				onLoaded={handleUploadLoaded.bind(this)}
				/>
				<div style={disabledStyle}>

			<div className="underline">Activity Ratios</div>
			<dt>
				<dd>Gene-to-Replicate: </dd>
				<SliderInput
					min={0}	max={1.001}
					maxLength={3}
					value={componentStates.geneReplicate}
					format={(v) => Utils.toFixed1Float(v)} 
					onEdit={handleSlider.bind(null, 'geneReplicate')}
					step={0.1}
				/>
			</dt>
			<dt>
				<dd>Gene-to-Group: </dd>
				<SliderInput
					min={0}	max={1.001}
					maxLength={3}
					value={componentStates.geneGroup}
					format={(v) => Utils.toFixed1Float(v)} 
					onEdit={handleSlider.bind(null, 'geneGroup')}
					step={0.1}
				/>
			</dt>
			<dt>
				<dd>High Confidence Gene-to-Replicate: </dd>
				<SliderInput
					min={0}	max={1.001}
					maxLength={3}
					value={componentStates.highConfidenceGeneReplicate}
					format={(v) => Utils.toFixed1Float(v)} 
					onEdit={handleSlider.bind(null, 'highConfidenceGeneReplicate')}
					step={0.1}
				/>
			</dt>
			<dt>
				<dd>High Confidence Gene-to-Group: </dd>
				<SliderInput
					min={0}	max={1.001}
					maxLength={3}
					value={componentStates.highConfidenceGeneGroup}
					format={(v) => Utils.toFixed1Float(v)} 					
					onEdit={handleSlider.bind(null, 'highConfidenceGeneGroup')}
					step={0.1}
				/>
			</dt>
				</div>
		</div>)
}