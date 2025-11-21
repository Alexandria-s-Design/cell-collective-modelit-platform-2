const toString = o => "" + o;
const template = (strings, ...keys) => ((values) => {
	let result = [strings[0]];
	keys.forEach((key, i) => {
		result.push(values[key], strings[i+1]);
	});
	return result.join('');
});

export { toString, template };