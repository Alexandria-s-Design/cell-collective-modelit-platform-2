import Immutable, { Seq, Map } from "immutable";

export default class ModelKineticMap {
	static buildMapToResults(results = []) {
		return Immutable.fromJS(results).reduce((result, item) => {
			const id = item.get('id');
			result = result.set(id, item.delete('id'));
			return result;
		}, Immutable.Map());
	}

	/** contentReferenceMap, pageMap */
	static addReferencesToPages(fromKey, targetKey, targetModel) {
		
		if (!targetModel.hasOwnProperty(fromKey) || !targetModel.hasOwnProperty(targetKey)) {
			return;
		}

		let pagesMap = Map(targetModel[targetKey].map((pVal, pKey) => ({...Map(pVal).toObject(), pageId: pKey}) )).toObject();
		targetModel[fromKey].forEach(ref => {
			let contentRef = targetModel['contentMap'].find((_, ckey) => ckey == ref.get('contentId'));
			if (contentRef) {
				let pageRef = pagesMap[contentRef.get('pageId')]
				if (!pageRef.hasOwnProperty('references')) {
					pageRef.references = [];
				}
				pageRef.references.push(ref.get('referenceId'));
				pagesMap[contentRef.get('pageId')] = pageRef;
			}
		});
		targetModel[targetKey] = Map(pagesMap);
	}
}