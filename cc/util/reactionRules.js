import BooleanAnalysis from 'ccbooleananalysis';
import logger from '../logger';

/**
 * @return Promise
 * @test tests/spec/cc/util/reactionRule.spec.js
 */

const operators = ['and','or','not']
function parseOperators(rule) {
  let tokens = rule.replace(/([\(\)])/g, ' $1 ').split(/\s+/);
  return tokens.filter(token => token !== '');
}

function removeNulls(rules) {
	let result = parseOperators(rules);
	for (let i = 0; i < result.length; i++) {
	  	if (result[i] == 'null'){
	  		result[i] = null;
	  	}
	  	if (result[i] === null && operators.includes(result[i-1])) {
	  		result[i-1] = null
	  	}
  	}
  	return result.filter(v=>v).join(' ');
}

function removeInvalidOperators(rules) {
	let result = parseOperators(rules);
	for (let i = 0; i < result.length; i++) {
	  	if (operators.includes(result[i]) && result[i-1] == '(') {
	  		result[i] = null
	  	}
  	}
  	return result.filter(v=>v).join(' ');
}

function removeEmptyParentheses(rules) {
  const expr = /\([^()\d]*\)/g;
  while (expr.test(rules)) {
    rules = rules.replace(expr, '');
  }
  return rules;
}

function removeInvalidGroups(rules) {	
	let expr1 = new RegExp(`(and\s+\(\s?\))|(or\s+\(\s?\))|(not\s+\(\s?\))`, 'g');
	let expr2 = new RegExp(`(\s{2,})`, 'g');
	let expr3 = new RegExp(`^(?:${operators.join('|')})\\s*|\\s*(?:${operators.join('|')})$`, 'g');
	let expr4 = /(and\s+\))|(or\s+\))/g;
	let strGroup = removeEmptyParentheses(rules);
		strGroup = strGroup.replace(expr1, '').trim();
		strGroup = strGroup.replace(expr2, ' ');
		strGroup = strGroup.replace(expr3, '');
		strGroup = strGroup.replace(expr4, ')');
	return strGroup ? `(${strGroup})` : '';
}

export function removeInvalidRule(rules) {
  let result = removeNulls(rules);
  result = removeInvalidOperators(result);
  result = removeInvalidGroups(result);
  return result;
}

export function parseGeneReactionRule(rule, logging=false, params) {

	if (!rule) {
		return new Promise((resolve, reject) => resolve(null));
	}

	let _rule = removeInvalidRule(rule)
	_rule = _rule.replace(/ and /g, "*");
	_rule = _rule.replace(/ or /g,  "+");
	_rule = _rule.replace(/ not /g, "~");

	return new Promise(async (resolve, reject) => {
		try {
			const data = BooleanAnalysis.getBiologicalConstructs(_rule);
			logging && (logger.info(`Parsing ${params.i + 1}/${params.n} reaction rule: ${rule}...`))
			resolve({ data: { data } })
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * Retrieve the ID of a Reactant or Product (Chemical Species)
 */
export function getChemicalSpeciesId(species) {
	let speciesId = species;
	if (typeof species === 'object' && 'id' in species) {
		speciesId = species.id;
	}
	return speciesId;
}