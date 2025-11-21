import React from "react";
import FileInput from "../../base/fileInput";
import { FileReaderUtil } from "../../../util/FileReaderUtil";


const styled = {
	wrapper: { marginBottom: '10px' },
	inputFileWrap: { display: 'none' },
	inputBtn: { cursor: 'pointer', fontSize: '11px'	},
	inputMessage: { marginLeft: '8px', fontWeight: 'bold' },
	emptyInputMessage: { marginLeft: '8px' },
}

const ImportFileViewBuilder = ({ fileType }) => {

	return (props) => {
		const extensions = ['.csv', '.xls', '.xlsx'];
		const { download, actions, pathState, btnDownload, onLoaded, title, onEdit } = props;

		const inputRef = React.useRef(null);

		const handleUpload = (e) => {
			let file = e[0];
			let editState = () => {
				file.input = fileType;
				actions.onEditModelState(pathState, {
					name: file.name,
					size: file.size,
					type: file.type,
					path: file.name,
					objectFile: file
				});
			}
			if (typeof(onLoaded) === 'function') {
				const reader = new FileReader();
				reader.onload = () => { onLoaded(reader.result, file, inputRef, editState); }
				if (FileReaderUtil.isXLS(file.type)) {
					reader.readAsBinaryString(file);
				} else {
					reader.readAsText(file);
				}				
			} else {
				editState();
			}
			if (typeof(onEdit) === 'function') {
				onEdit(file);
			}
		}

		const handleDownload = () => {
			const downloadLink = document.createElement('a');
			downloadLink.href = URL.createObjectURL(download.objectFile);
			downloadLink.setAttribute('download', download.name);
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
		}

		return (<div className="section-import-file" style={styled.wrapper}>
			{title ? <h3>{title}</h3> : null}
			<div>
				<button onClick={() => inputRef.current.click()} style={styled.inputBtn}>Choose File</button>
				<div style={styled.inputFileWrap}>
				<FileInput
					inSpan={true}
					name={fileType + '_upload'}
					ext={extensions}
					onChange={handleUpload}
					inputRef={inputRef}
				/>
				</div>
				{!download ? (<span style={styled.emptyInputMessage}>No File Chosen</span>) : null}
				{btnDownload && download ? (<span className="uploadedFile" style={styled.inputMessage}>
					{download.name}
					<input type="button" title={download.name} className="icon base-download" onClick={handleDownload.bind(this)} />
				</span>) : null}
			</div>
		</div>)
	}

}

export default {
	"DrugList": ImportFileViewBuilder({
		fileType: "drug_list"
	}),
	"UpRegulated": ImportFileViewBuilder({
		fileType: "upregulated"
	}),
	"DownRegulated": ImportFileViewBuilder({
		fileType: "downregulated"
	}),
}