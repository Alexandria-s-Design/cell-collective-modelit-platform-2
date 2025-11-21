
export default class DateTimeUtil {

	static toStr(dt = new Date(), sepDt='', sepTm='') {
		let mon = `${dt.getMonth()+1}`.padStart(2,'0');
		let day = `${dt.getDate()}`.padStart(2,'0');
		let hour = `${dt.getHours()}`.padStart(2,'0');
		let min = `${dt.getMinutes()}`.padStart(2,'0');
		let sec = `${dt.getSeconds()}`.padStart(2,'0');
		
		let str = `${dt.getFullYear()}${sepDt}${mon}${sepDt}${day}`;
		if (sepTm) { str +=' ' }
		str += `${hour}${sepTm}${min}${sepTm}${sec}`;
		return str;
	}

	static toUtcMs(input) {
		if (!input) return NaN;

		if (input instanceof Date) return input.getTime();
		if (typeof input === 'number') return input;

		if (typeof input === 'string') {
			const s = input.trim();
			const hasTz = /[zZ]|[+-]\d{2}:\d{2}$/.test(s);
			const normalized = hasTz ? s : s.replace(' ', 'T') + (s.includes('T') ? 'Z' : 'T00:00:00Z');
			const t = Date.parse(normalized);
			return Number.isNaN(t) ? NaN : t;
		}

		return NaN;
	}

}