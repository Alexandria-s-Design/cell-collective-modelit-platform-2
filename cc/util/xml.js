/**
 * Provide XML interaction in the codebase
 */

const XML_HEADER = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>`;

export function ElementXML(attr, value) {
	return {attr, value}
}

function parseElementXML(name, value) {
  if (typeof value === 'string') {
    return `<${name}>${value}</${name}>`;
  } else {
    return `<${name}>${builderXML(value)}</${name}>`;
  }
}

function builderXML(xmlObject) {
  let xml = '';
  if (Array.isArray(xmlObject)) {
    //parsing the last element
    if (xmlObject.length == 2 && typeof xmlObject[1] === 'string') {
        return parseElementXML(xmlObject[0], xmlObject[1]);
    }
    for (const element of xmlObject) {
        xml += parseElementXML(element[0], element[1]);
    }
  }
  return xml;
}

function parseElements(xml) {
  if (typeof xml === 'string') {
    return xml;
  } else if (Array.isArray(xml)) {
    const nestedArray = [];
    for (const element of xml) {
     nestedArray.push([element.attr, parseElements(element.value)]);
    }
    return nestedArray;
  }
  return [xml.attr, parseElements(xml.value)];
}

export function generateXML(el = []) {
	let build = XML_HEADER;
	build += builderXML(parseElements([el]))
	return build;
}

export const XMLParser = {
		parseFromString: function(xmlContent) {
			const result = {};
			const regex = /<([A-Za-z0-9]+)[^>]*>(.*?)<\/\1>/gs;
			let match;

			while ((match = regex.exec(xmlContent))) {
				const [, tagName, tagContent] = match;
				const nestedContent = XMLParser.parseFromString(tagContent);

				if (result[tagName]) {
					if (!Array.isArray(result[tagName])) {
						result[tagName] = [result[tagName]];
					}
					result[tagName].push(nestedContent);
				} else {
					result[tagName] = nestedContent;
				}
			}

			if (Object.keys(result).length === 0) {
				return xmlContent.trim();
			}
			return result;
		}
}  
