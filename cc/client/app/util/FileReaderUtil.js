import * as XLSX from 'xlsx';

export class FileReaderUtil {

	static get csvDelimiters() {
		return {
			TAB: '\\t',
			PIPE: '\\|',
			COMMA: ',',
			SEMICOLON:  ';'
		}
	}
	
	setXLSBinary(binary) {
		this.xlsBin = XLSX.read(binary, { type: 'binary' });
	}
	static isCSV(mimeType) {
		let valid = false;
		if (mimeType == 'text/csv') {
			valid = true;
		}
		return valid;
	}

	static isXLS(mimeType) {
		let valid = false;
		if (mimeType == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
			valid = true;
		} else if (mimeType == 'application/vnd.ms-excel') {
			valid = true;
		} else if (mimeType == 'application/vnd.ms-excel.sheet.macroenabled.12') {
			valid = true;
		}
		return valid;
	}

	getXLSCols(sheet=0) {
		let sheetName = this.xlsBin.SheetNames[sheet];
		let worksheet = this.xlsBin.Sheets[sheetName];
		let range = XLSX.utils.decode_range(worksheet['!ref']);

		const cols = [];
		for (let C = range.s.c; C <= range.e.c; ++C) {
			const cellAddress = { c: C, r: range.s.r };
			const cellRef = XLSX.utils.encode_cell(cellAddress);
			const cell = worksheet[cellRef];
			if (cell && cell.t === 's') {
				cols.push(cell.v);
			} else {
				cols.push(null);
			}
		}		
		return {sheetName, columns: cols}
	}

	getCSVfromXLS(sheet=0) {
		const sheetName = this.xlsBin.SheetNames[sheet];
		const worksheet = this.xlsBin.Sheets[sheetName];
		return XLSX.utils.sheet_to_csv(worksheet);
	}

	static csvContentDelimiter(csvString) {
		const delimiterCounts = {};
		const	firstLine = csvString.split('\n')[0];		

		Object.values(FileReaderUtil.csvDelimiters).forEach(delimiter => {
			delimiterCounts[delimiter] = (firstLine.match(new RegExp(delimiter, 'g')) || []).length;
		});

		let maxCount = 0;
		let detectedDelimiter = null;

		for (const delimiter in delimiterCounts) {
			if (delimiterCounts[delimiter] > maxCount) {
				maxCount = delimiterCounts[delimiter];
				detectedDelimiter = delimiter;
			}
		}
		return detectedDelimiter;
	}
}