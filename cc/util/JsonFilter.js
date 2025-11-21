/**
 * Usage:
 * const jsonFltr = new JsonFilter(datajson);
 * jsonFltr.toFilter(doStoreSpecialChars).getJson()
 */

/**
 * Valid character base
 */
 const charBase = '\\s,\\u0020-\\u007E';

 /**
	* List all characters allowed to save to
	*/
 const charCode = {
	 "ê": "e", "→": "->",
	 "α": "\\u03B1","β": "\\u03B2","ß": "\\u03B2","γ": "\\u03B3","δ": "\\u03B4",
	 "ε": "\\u03B5","ζ": "\\u03B6","η": "\\u03B7","θ": "\\u03B8","ι": "\\u03B9","κ": "\\u03BA",
	 "λ": "\\u03BB","μ": "\\u03BC","ν": "\\u03BD","ξ": "\\u03BE","ο": "\\u03BF","π": "\\u03C0",
	 "ρ": "\\u03C1","σ": "\\u03C3","τ": "\\u03C4","υ": "\\u03C5","φ": "\\u03C6","χ": "\\u03C7",
	 "ψ": "\\u03C8","ω": "\\u03C9","Α": "\\u0391","Β": "\\u0392","Γ": "\\u0393","Δ": "\\u0394",
	 "Ε": "\\u0395","Ζ": "\\u0396","Η": "\\u0397","Θ": "\\u0398","Ι": "\\u0399","Κ": "\\u039A",
	 "Λ": "\\u039B","Μ": "\\u039C","Ν": "\\u039D","Ξ": "\\u039E","Ο": "\\u039F","Π": "\\u03C0",
	 "Ρ": "\\u03A1","Σ": "\\u03A3","Τ": "\\u03A4","Υ": "\\u03A5","Φ": "\\u03A6","Χ": "\\u03A7",
	 "Ψ": "\\u03A8","Ω": "\\u03A9","§": "\\u00A7","©": "\\u00A9","®": "\\u00AE","℗": "\\u2117",
	 "°": "\\u00B0","µ": "\\u00B5","½": "\\u00BD","¼": "\\u00BC","¾": "\\u00BE",
	 "×": "\\u00D7","÷": "\\u00F7","ª": "\\u00AA","$": "\\u0024","€": "\\u20AC",
	 "£": "\\u00A3","¥": "\\u00A5","¢": "\\u00A2","₹":"\\u20B9","₨": "\\u20A8",
	 "₱": "\\u20B1","₩": "\\u20A9"
 }
 
 /**
	* Function to prepare allowed characters before saving them
	*/
 export function doFilterSpecialChar(key, value) {
	 if (typeof value === "string") {
	 	return value.replace(/\\[\w]/g, "")
			.replace(/\"/g, '\"')		 	
			.replace(/\'/g, "\'")
			.replace(RegExp(`[^${charBase}]`, "g"), (i) => charCode[i] || "\\u0671" );
	 }
	 return value;
 }
 

 /**
	* Main class to filter valid JSON data ready to save
	*/
 export default class JsonFilter {
	constructor (json) {
		this.json = json;
	}
 
	/**
	 * Convert JSON to filtered String
	 */
	toFilter(...filters) {
		if (!filters.length) {
			throw new Error("Please inform at least one filter function.");
		}		
		for (const f of filters) {
			this.json = JSON.stringify(this.json, f);
		}
		return this;
	}
 
	toRevert() {
		return this;
	}

	getJson() {
		return this.json;
	}
}