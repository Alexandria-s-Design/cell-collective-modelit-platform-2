
export function convertDrugScoreToBlob(data) {
	let drugResultCSV = data.map(row => {
		return `${row.code}\t${row.name}\t${row.target}\t${row.moa}\t${row.phase}\t${row.d_score}`;
	}).toArray();
	drugResultCSV = `code\tpert_iname\ttarget\tmoa\tclinical_phase\td_score\n`+drugResultCSV.join('\n');
	return new Blob([drugResultCSV], { type: 'text/csv' });
}

export function convertDrugListToCSV(data) {
	let drugListCSV = data.map(row => {
		return `${row.code}\t${row.name}\t${row.target}\t${row.moa}\t${row.phase}`;
	}).toArray();
	drugListCSV = `code\tpert_iname\ttarget\tmoa\tclinical_phase\n`+drugListCSV.join('\n');
	let fileResult = new Blob([drugListCSV], { type: 'text/csv' });
	fileResult = new File([fileResult], `drug_list.csv`, { type: 'text/csv' });
	fileResult.input = 'druglist';
	return fileResult;
}