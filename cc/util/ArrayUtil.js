
function removeDuplicates(list = []) {
	return [...new Set(list)];
}

export const ArrayUtil = {
	removeDuplicates
}