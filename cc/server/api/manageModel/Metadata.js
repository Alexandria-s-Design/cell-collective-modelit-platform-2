import { Seq } from "immutable";
import { Value, ValueText, EntityValue, LearningObjective, TempObjective } from "./MetadataEntity";

export const MetadataDefinition = {
	TargetAudience: 		1,
	LearningType: 			2,
	Cover: 							3,
	EstimatedTime: 			4,
	DocumentPrivate: 		5,
	DocumentPublic: 		6,
	LearningObjective: 	7,
	BackgroundImage: 		8
}

export default class Metadata {

	constructor (modelInstance = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
	}

	async getMetadataByVersion(versionId = 0, version = 0) {
		return this.dbInstance.sequelize.query(
			`	select
				vw.entity_id as modelid, vw.id as value_id,
				vw.definition_id as "definitionId", vw."index", vw.value_decimal,	value_text,
				vw."position", mv.version
				from public.model_version mv
				inner join metadata.entity_metadata_view vw on vw.entity_id = mv.modelid
				where mv.id = :versionId and mv."version" = :version
		`,{
				type: this.dbInstance.sequelize.QueryTypes.SELECT,
				replacements: {versionId, version}
			});
	}

	async defineMetadataValues(root, index, versionId, version) {
		if (!root || !root[index]) {
			return;
		}
		const metadataValues = await this.getMetadataByVersion(versionId, version);
		Seq(root[index].metadataValueMap).forEach((v,k) => {
			if (v && v.hasOwnProperty("definitionId")) {
				if (v.definitionId == MetadataDefinition.EstimatedTime) {
					delete root[index].metadataValueMap[k];
				}
				if (v.definitionId == MetadataDefinition.LearningObjective) {
					delete root[index].metadataValueMap[k];
				}
			}
		});
		metadataValues.forEach((v) => {
			if (v.definitionId == MetadataDefinition.EstimatedTime) {
				root[index].metadataValueMap[v.value_id] = {
					value: v.value_decimal,
					position: v.position,
					definitionId: v.definitionId
				}
			}
			if (v.definitionId == MetadataDefinition.LearningObjective) {
				root[index].metadataValueMap[v.value_id] = {
					value: v.value_text,
					position: v.position,
					definitionId: v.definitionId
				}
			}
		});
	}

	async getEntityModelsByVersions(modelVersions = [], definition = null) {
		const modelIds = modelVersions.map(v => parseInt(v.modelid));
		let params = { modelIds };
		if (modelIds.length == 0) {	return [] }
		if (definition) {
			params.definition = definition;
		}
		return this.dbInstance.sequelize.query(
			`	SELECT
					vw.entity_id,
					vw.id as value_id,
					vw.definition_id,
					vw."index", vw.value_decimal,
					vw.value_text,
					vw."position"
				FROM metadata.entity_metadata_view vw
				WHERE vw.entity_id in (:modelIds) AND vw.definition_id = :definition
		`,{
				type: this.dbInstance.sequelize.QueryTypes.SELECT,
				replacements: params
			});
	}

	/**
	 * Preparing to save only valid and new metadata
	 */
	async preparingToSave(metadatas = [], oldMetadatas = [], modelVersions = []) {
		const dataToStore = { create: [] };
		for (const data of metadatas) {
			const _data = Object.values(data);
			for (const version of modelVersions) {
				Seq(_data[0]).forEach(meta => {
					const findIdx = oldMetadatas.findIndex(v => v.entity_id == version.modelid && v.value_text == meta.value);
					if (findIdx == -1 ) {
						dataToStore.create.push(new LearningObjective(
							new Value({
								definition_id: meta.definitionId,
								position: meta.position
							}), new ValueText({
								value_id: 0,
								value: meta.value
							}),	new EntityValue({
								value_id: 0,
								entity_id: version.modelid
							})
						));
					}
				});				
			}
		}
		return dataToStore;
	}

	async saveMetadataText(dataToStore) {
		const transaction = await this.dbInstance.sequelize.transaction();
		try {
			const saved = [];
			for (const store of dataToStore.create) {
				const dataValue = await this.dbInstance.Value.create(store.Value, {transaction});				
				store.ValueText.value_id = store.EntityValue.value_id = dataValue.id;
				await this.dbInstance.ValueText.create(store.ValueText, {transaction});
				await this.dbInstance.EntityValue.create(store.EntityValue, {transaction});
				saved.push({[dataValue.id]: {
					definitionId: store.Value.definition_id,
					position: store.Value.position,
					value: store.ValueText.value,
					valueId: store.EntityValue.value_id,
					entityId: store.EntityValue.entity_id,
					tempKey: store.TempValue && store.TempValue.key,
					version: store.TempValue && store.TempValue.version
				}});
				if (store.TempValue && store.TempValue.key < 0
					&& store.Value.definition_id == MetadataDefinition.LearningObjective)
				{
					await this.dbInstance.LearningObjective.create(new TempObjective({
						version: store.TempValue.version,
						valueId: store.EntityValue.value_id,
						versionId: store.TempValue.version_id,
						valueRefId: store.TempValue.key
					}), {transaction});
				}
			}
			if (dataToStore.hasOwnProperty("remove")) {
				for (const store of dataToStore.remove) {
					await this.dbInstance.LearningObjective.destroy({
						where: {
							valueId: store.valueId,
							version: store.version,
							versionId: store.versionId
						}
					})
				}
			}
			
			await transaction.commit();
			return saved;
		} catch (err) {
			await transaction.rollback();
			throw err;
		}
	}

	async setModelMetadata(modelVersions, objectives = [], jsonModelSaved) {
		if (objectives.length == 0) return;
		if (jsonModelSaved) {		
			const listUpdatesMetadata = [];
			objectives.forEach(row => {
				const mainKey = Object.keys(row)[0];
				const version = row[mainKey].version;			
				const lookupKey = `${mainKey}/${version}`;
				const modelEntry = jsonModelSaved[lookupKey];			
				if (modelEntry && modelEntry.id) {
					listUpdatesMetadata.push({
						valueId: row[mainKey].valueId,
						entityId: modelEntry.id,
						version: modelEntry.currentVersion
					});
				}
			});
			if (listUpdatesMetadata.length) {
				let promiseAll = listUpdatesMetadata.map(meta =>
					this.dbInstance.EntityValue.update(
						{ entity_id: meta.entityId },
						{ where: { value_id: meta.valueId } }
					)
				);
				promiseAll = promiseAll.concat(
					listUpdatesMetadata.map(meta =>
						this.dbInstance.LearningObjective.update(
							{ versionId: meta.entityId, version: meta.version },
							{ where: { valueId: meta.valueId } }
					))
				);
				await Promise.all(promiseAll);
			}
		}
		const modelIds = modelVersions.map(v => v.modelid);
		return this.dbInstance.BaseModel.update({	metadata: true }, {
			where: { id: { [this.dbInstance.Sequelize.Op.in]: modelIds }
		}});
	}
}
