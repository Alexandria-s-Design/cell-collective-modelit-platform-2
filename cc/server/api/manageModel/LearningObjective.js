import { Seq } from "immutable";
import Metadata, { MetadataDefinition } from "./Metadata";
import {
	Value,
	ValueText,
	TempValue,
	EntityValue,
	LearningObjective as LearningObjectiveEntity,	
	RemoveLearningObjective as RemoveLearningObjectiveEntity
} from "./MetadataEntity";

export default class LearningObjective {

	constructor (modelInstance = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
	}

	/**
	 * This function prepares the metadata learning objectives to save them in the correct modelid version
	 */
	async preparingToSave(root, index, versionId = 0, version = 0, modelVersions = [], oldMetadatas = []) {
		const dataToStore = { create: [], remove: [] };

		if (!root || !root[index].hasOwnProperty('metadataValueMap')) {
			return dataToStore;
		}

		for (const [k, meta] of Seq(root[index].metadataValueMap).entries()) {
			let modelVersionId = modelVersions.filter(m => m.id == versionId && m.version == version);
			modelVersionId = modelVersionId.length && modelVersionId[0].modelid;

			if (meta && k < 0 && meta.definitionId == MetadataDefinition.LearningObjective) {
					const findIdx = oldMetadatas.findIndex(v => v.entity_id == modelVersionId && v.value_text == meta.value);
					if (findIdx == -1 ) {
						dataToStore.create.push(new LearningObjectiveEntity(
							new Value({
								definition_id: meta.definitionId,
								position: meta.position
							}), new ValueText({
								value_id: 0,
								value: meta.value
							}),	new EntityValue({
								value_id: 0,
								entity_id: modelVersionId
							}), new TempValue({
								key: k,
								version: version,
								version_id: versionId
							})
						));
					}
					root[index].metadataValueMap[k] = undefined;
			}
			if (meta === null && k) {
				dataToStore.remove.push(new RemoveLearningObjectiveEntity({
					valueId: k, version, versionId
				}));
			}
		}
		return dataToStore;
	}

	async defineObjectiveSurvey(root, index, versionId, version) {
		if (!root || !root[index] || !root[index].hasOwnProperty('survey')) {
			return;
		}
		if (!root[index].survey.hasOwnProperty('surveyQuestionMap')) {
			return;
		}
		const refLearningObjective = await this.dbInstance.LearningObjective.findAll({
			attributes: ['version', 'versionId', 'valueId','valueRefId'],
			where: {
				version,
				versionId,
				valueRefId: {[this.dbInstance.Sequelize.Op.lt]: 0}
			},
			order: [
				['id', 'DESC']
			]
		});
		for (const [k, v] of Seq(root[index].survey.surveyQuestionMap).entries()) {
			if (v.hasOwnProperty("learnId") && v.learnId < 0) {
				const findIdx = refLearningObjective.findIndex(vl => vl.valueRefId == v.learnId);
				findIdx >= 0 && (root[index].survey.surveyQuestionMap[k].learnId = refLearningObjective[findIdx].valueId);
			}
		}
	}
}