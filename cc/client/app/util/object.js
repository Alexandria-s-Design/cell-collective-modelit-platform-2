const exclude = (obj, ...excludeKeys) => {
	const out = {};
	for (const key in obj) {
		if (excludeKeys.includes(key)) continue;
		else {
			out[key] = obj[key];
		}
	}
	return out;
};

export { exclude };