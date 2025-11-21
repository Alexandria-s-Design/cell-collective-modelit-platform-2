import isEmpty from "lodash.isempty"
import isObject from "lodash.isobject";

/**
 * @description Casts any object to a string.
 * 
 * @param {any} value - The value to be converted.
 * 
 * @returns {string}  - The converted string.
 * 
 * @example
 * cc._.cstr(1);
 * // '1'
 */
const cstr = value =>
{
    if (typeof value === 'undefined' || value === null) {
        return ''
    }

    const  result = `${value}`
    return result
}

export default { cstr, isEmpty, isObject };