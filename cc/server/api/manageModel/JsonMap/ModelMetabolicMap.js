import Immutable, { Seq } from "immutable";
export default class ModelMetabolicMap {

	fillReactionNotes(targetModel = {}, reactions = []) {
		if (!targetModel.hasOwnProperty('pageMap')) {
			targetModel.pageMap = {};
		}
		if (!targetModel.hasOwnProperty('sectionMap')) {
			targetModel.sectionMap = {};
		}
		if (!targetModel.hasOwnProperty('contentMap')) {
			targetModel.contentMap = {};
		}
				
		if (reactions.length == 0) {
			return;
		}

		if (!reactions[0].hasOwnProperty('newId')) {
			throw new Error('Please define the new Reaction ID from: '+JSON.stringify(reactions[0])+'.')
		}

		let newEntityId = 0;

		for ( let i = 0, n = reactions.length ; i < n; ++i ) {
			newEntityId--;
			const reaction = reactions[i];
			if (reaction.notes) {
				let pageId = newEntityId;
				targetModel.pageMap[newEntityId] = { reactionId: reaction.newId }
				newEntityId--;
				targetModel.sectionMap[newEntityId] = {
					pageId,
					position: 0,
					title: reaction.name,
					type: "Description"
				}
				let sectionId = newEntityId;
				let contentPos = 0;
				Seq(reaction.notes).forEach((v, k) => {
					newEntityId--;
					targetModel.contentMap[newEntityId] = {
						sectionId,
						position: contentPos,
						text: [k,v].join(' ')
					}
					contentPos++;
				})
			}
		}
	}

	static buildMapToResults(results = []) {
		return Immutable.fromJS(results).reduce((result, item) => {
			const id = item.get('id');
			result = result.set(id, item.delete('id'));
			return result;
		}, Immutable.Map()).toJS();
	}

	fillObjectivesFunction(targetModel = {}, addAttrs={}) {
		if (!targetModel.hasOwnProperty('objectives')) {
			targetModel.objectives = {};
		}
		
		let objectivesMap = Seq(targetModel.objectives);

		if (objectivesMap.isEmpty()) {
			return;
		}

		objectivesMap.forEach((v,k) => {
			targetModel.objectives[k] = {
				...v,
				...addAttrs
			}
		});
	}

	fillSubsystems(targetModel = {}, addAttrs={}) {
		if (!targetModel.hasOwnProperty('subsystems')) {
			targetModel.subsystems = {};
		}		
		let subsystemsMap = Seq(targetModel.subsystems);
		if (subsystemsMap.isEmpty()) { return	}

		subsystemsMap.forEach((v,k) => {
			targetModel.subsystems[k] = {
				...v,
				...addAttrs
			}
		});
	}

	fillDrugEnvironment(targetModel = {}, addAttrs={}) {
		if (!targetModel.hasOwnProperty('drugEnvironmentMap')) {
			targetModel.drugEnvironmentMap = {};
		}		
		let drugEnvironmentMap = Seq(targetModel.drugEnvironmentMap);
		if (drugEnvironmentMap.isEmpty()) { return	}

		drugEnvironmentMap.forEach((v,k) => {
			targetModel.drugEnvironmentMap[k] = {
				...v,
				...addAttrs
			}
		});
	}
}