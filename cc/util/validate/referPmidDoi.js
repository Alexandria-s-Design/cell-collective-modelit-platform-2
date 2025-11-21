
const DOI_PATTERN = /\b10.\d{4,9}\/[-._;()/:A-Z0-9]+\b/i;
const PMID_PATTERN = /^\d+$/;

export class ReferPmidDoi {
	static testValidValue(value) {
		if (DOI_PATTERN.test(value) || PMID_PATTERN.test(value)) {
				return value;
		} else {
				return null;
		}
	}
}