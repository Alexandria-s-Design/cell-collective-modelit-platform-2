import _data from './data'
import showToast from '../message'

/**
 * @description Converts a string containing newlines to breaks <br>.
 * 
 * @param {string} string The string to sanitize.
 * @returns               The sanitized string.
 * 
 */
const nl2br     = string =>
{
    const PATTERN   = /(?:\\r\\n|\\r|\\n)/g

    string = _data.cstr(string)
    string = string.replace(PATTERN, "<br>")

    return string
}

/**
 * @description A stupid pluralizer.
 * 
 * @param {string} string The string to pluralize.
 * @param {number} count  The count.
 * 
 * @returns               The pluralized string.
 * 
 */
const pluralize = (string, count) =>
{
    return `${string}${count == 1 ? "" : "s"}`;
};

/**
 * @description Generate ellipsis.
 * 
 * @param {string}    string The string to generate ellipsis for.
 * @param {ellipsis}  string Ellipsis type
 * @param {threshold} number The threshold (default 48)
 * 
 * @returns                  The string with ellipsis.
 */
const ellipsis = (string, ellipsis = "...", threshold = 48) =>
{
    if ( string.length <= threshold ) {
        return string;
    }
    
    const substring = string.slice(0, threshold + 1);
    const ellipsed  = `${substring}${ellipsis}`

    return ellipsed;
};

const copyToClipboard = (str) => {
	const el = document.createElement('textarea');
	el.value = str;
	document.body.appendChild(el);
	el.select();
	document.execCommand('copy');
	document.body.removeChild(el);

	showToast("Text copied to your clipboard");
};



export default { nl2br, pluralize, ellipsis, copyToClipboard }