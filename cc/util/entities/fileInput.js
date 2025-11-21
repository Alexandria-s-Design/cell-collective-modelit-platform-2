/**
 * Extract/Store values from input files
 */
export class FileInputAssigned {
	constructor(name, arr=[]) {
		this.name = name;
		if (arr && arr.length > 1) {
			this.value = arr[0];
			this.lastModified = arr[1];
		}
	}
	getName() { return this.name }
	getValue() { return this.value }
	getLastModified() { return this.lastModified }
}