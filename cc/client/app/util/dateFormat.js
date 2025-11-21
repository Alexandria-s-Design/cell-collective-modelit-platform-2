
export function dateFormat(format, dateTimestamp = new Date()) {
	const _fullyear = dateTimestamp.getFullYear();
	const _month = `${dateTimestamp.getMonth() +1}`.padStart(2, '0');
	const _date = `${dateTimestamp.getDate()}`.padStart(2, '0');

	let dateProcessed = '';
	switch (format) {
		case 'MM/DD/YYYY':
				dateProcessed = `${_month}/${_date}/${_fullyear}`;
				break;
		default: dateProcessed = dateTimestamp.toDateString();
	}
	return dateProcessed;
}