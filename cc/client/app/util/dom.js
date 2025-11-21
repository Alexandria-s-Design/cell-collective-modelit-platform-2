const fullHeight = domEl => {
	const style = getComputedStyle(domEl);
	const vMargins = parseFloat(style['marginTop']) + parseFloat(style['marginBottom']);

	return Math.ceil(domEl.offsetHeight + vMargins);
};

export { fullHeight };