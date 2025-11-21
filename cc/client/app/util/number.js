
export function getOrdinalNumber(value = 0) {
	const pr = new Intl.PluralRules('en-US', { type: 'ordinal' });
	const suffixes = new Map([
		['one', 'st'], ['two', 'nd'], ['few', 'rd'], ['other', 'th']
	]);
	const rule = pr.select(value);
	const suff = suffixes.get(rule);
	return `${value}${suff}`;
}