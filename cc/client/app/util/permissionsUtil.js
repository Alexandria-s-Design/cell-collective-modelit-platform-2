/**
 * @param {{
 * 		permissions: {},
 * }} baseModel 
 * @returns {boolean}
 */
export function isEditEnabled(baseModel) {
		let enabledEdit = baseModel.permissions?.edit ?? false;
		return enabledEdit;
}