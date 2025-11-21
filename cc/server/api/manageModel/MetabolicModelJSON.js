
const _negateId = (id, negateId) => negateId ? parseInt(id) * -1 : id

export function buildMetabolicModelJSON(model) {
	let attrs = [
		'compartments',
		'metabolites',
		'reactions',
		'genes',
		'conditions',
		'regulators',
		'objective',
		'modelReferenceIds'
	]
	attrs.forEach(attr => {
		if (!(attr in model)) {
			model[attr] = []
		}
	});
}

export function buildKineticModelJSON(model) {
	let attrs = [
		'species',
		'compartments',
		'reactions',
		'parameters',
		'kinetic_laws'
	]
	attrs.forEach(attr => {
		if (!(attr in model)) {
			model[attr] = []
		}
	});
}

export function buildConditions(
	target, labelParentId, labelParent, labelSpeciesId,
	mParent, mConditions=[], mSpecies=[], negateId = false, slim
) {
	let tmConditions = mConditions.filter(c => c[labelParentId] == mParent.id)

	for ( let n = 0 , e = tmConditions.length ; n < e ; ++n ) {

		const mCondition = tmConditions[n];		
		const mConditionGenes = mSpecies.filter(c => c[labelSpeciesId] == mCondition.id);
		const geneIds = mConditionGenes.map(c => _negateId(parseInt(c.GeneId), negateId));

		const condition = {
			type: 						mCondition.type,
			state: 						mCondition.state,
			[labelParent]: 		_negateId(parseInt(mParent.id), negateId),
			speciesRelation: 	mCondition.speciesrelation,
			genes: 						geneIds
		};

		if ( slim ) {
			target[_negateId(mCondition.id, negateId)] = condition;
		} else {
			condition.id 					= _negateId(parseInt(mCondition.id), negateId);
			condition._createdBy 	= condition._createdBy;
			condition._createdAt	= condition._createdAt;
			condition._updatedAt	= condition._updatedAt;
			condition._updatedBy	= condition._updatedBy;
			target.push(condition);
		}
	}
}