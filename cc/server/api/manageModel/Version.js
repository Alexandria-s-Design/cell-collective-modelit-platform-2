import Response from "../../response";
import ModelConstants from "./ModelConstants";
import { Seq } from "immutable";

export default class Version {

	constructor (modelInstance = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined');
		}
		this.dbInstance = modelInstance;
	}

	async getVersionByNumberRow(id, numRow = 1) {
		let modelVersionNum = await this.dbInstance.sequelize.query(`
		select mv."version" from model_version mv where mv.id=? limit 1 offset ?
		`,{
				type: this.dbInstance.sequelize.QueryTypes.SELECT,
				replacements: [id, numRow-1],
			});


		if (!modelVersionNum.length) {
			throw new Error("Not version row number");
		}
		return modelVersionNum[0].version;
	}
	
	async removeVersions(versions = [], userId = 0) {		
		for (const version of versions) {
			await this.dbInstance.ModelVersion.update({
				_deletedAt: this.dbInstance.sequelize.literal("NOW()"),
				_deletedBy: userId,
				_deleted: true
			}, {
				where: {
					id: version.id,
					name: version.name,
					userid: userId,
					_deleted: {[this.dbInstance.Sequelize.Op.ne]: true }
				}
			});
		}
	}

	async disableAllVersions(modelId, userId, reqBody) {
		const modelKeys = Object.keys(reqBody);
		if (modelKeys.length == 0) {
			throw {code: Response.Error.BAD_REQUEST, message: `No informed Model.`};
		}

		if (! 'modelType' in reqBody[modelKeys[0]]) {
			throw {code: Response.Error.BAD_REQUEST, message: `No informed model type.`};
		}

		const mBaseModel = await this.dbInstance.BaseModel.findOne({where: {id: modelId}})

		if (!mBaseModel) {
			throw {code: Response.Error.NOT_FOUND, message: `Model with ID ${modelId} not found.`};
		}

		if ( parseInt(mBaseModel.userid || mBaseModel._createdBy) !== userId ) {
			throw {code: Response.Error.UNAUTHORIZED, message: `User with ID ${userId} is not authorized to delete Model.`};
		} 

		let where = {
			userid: userId
		};

		if (reqBody[modelKeys[0]].modelType === ModelConstants.TYPE_METABOLIC) {
			where.modelid = modelId;
		} else {
			where.id = modelId;
		}

		const versions = await this.dbInstance.ModelVersion.findAll({attributes: ['modelid'], where });
		const versionsModel = versions.map(vers => vers.modelid).concat([modelId]);
		const transaction = await this.dbInstance.sequelize.transaction();

		try {
			let queryUpdate = `UPDATE "model"	SET "_deletedAt"=CURRENT_TIMESTAMP,
			"_deletedBy"=:userId, "_deleted"=true	WHERE id IN (:versionsModel)`;
			await this.dbInstance.sequelize.query(queryUpdate, {
				replacements: {versionsModel, userId},
				type: this.dbInstance.sequelize.QueryTypes.UPDATE
			});
			
			await this.dbInstance.ModelVersion.update({
				_deletedAt: this.dbInstance.sequelize.literal("NOW()"),
				_deletedBy: userId,
				_deleted: true
			}, { where, transaction });

			await transaction.commit();
			
		} catch(err) {
			await transaction.rollback();
			throw err;
		}

	}

	async getBooleanVersions(modelIds = []) {
		return this.dbInstance.ModelVersion.findAll({
			attributes: ['id', 'version', 'selected', 'modelid'],
			where: {
				id: { [this.dbInstance.Sequelize.Op.in]: modelIds },
				_deleted: { [this.dbInstance.Sequelize.Op.ne]: true }
			}
		})
	}

	async updateVersions(versions, selected = [], userId = 0) {
		let selectVersion = selected.filter(v => v.selected);
		const t = await this.dbInstance.sequelize.transaction();
		try {
			const modelIds = [0];
			for (const v of versions) {
				if (selected.findIndex(s => s.id == v.id && s.version == v.version) < 0) continue;
				const fields = {
					_updatedAt: this.dbInstance.sequelize.literal("NOW()"),
					_updatedBy: userId
				}
				if (selectVersion.length == 0) {
					fields.selected = v.selected;
				}
				await this.dbInstance.ModelVersion.update(fields, { where: {
					id: v.id, version: v.version
				}, transaction: t });

				modelIds.push(v.modelid);
			}

			await this.dbInstance.sequelize.query(`UPDATE "model"	SET "_updatedAt"=CURRENT_TIMESTAMP,
			"updatedate"=CURRENT_TIMESTAMP, biologicupdatedate=CURRENT_TIMESTAMP,
			"_updatedBy"=:userId	WHERE id IN (:modelIds)`, {
				replacements: {modelIds, userId},
				type: this.dbInstance.sequelize.QueryTypes.UPDATE,
				transaction: t
			});

			await t.commit();

		} catch(err) {
			await t.rollback();
			throw err;
		}
	}

	async getMainBaseModelByVersionId(versionId) {
		return this.dbInstance.BaseModel.findOne({
			where: {
				id: {[this.dbInstance.Sequelize.Op.eq]:
					this.dbInstance.sequelize.literal(`(SELECT modelid FROM model_version m WHERE m.id = ${parseInt(versionId)} ORDER BY modelid ASC LIMIT 1)`)
				}
			}
		});
	}

	async defineSpecies(root, index) {
		if (!root || !root[index].hasOwnProperty('regulatorMap')) {
			return;
		}
		for (const regulatorId in root[index].regulatorMap) {
			const regulator = root[index].regulatorMap[regulatorId];
			const regulatorSpeciesId = regulator.regulatorSpeciesId;
			root[index].speciesMap[regulatorSpeciesId].external = true;
		}
	}

	async getBasicModelVersion(id = 0, attrs = []) {
		attrs = ['id', 'name', 'modeltype', 'type', ...attrs];
		try {
			const modelData = await this.dbInstance.sequelize.query(
				`SELECT ${attrs.map(c => `model."${c}"`).join(', ')} FROM model WHERE model.id = :id`,
			{
				replacements: {id},
				type: this.dbInstance.sequelize.QueryTypes.SELECT
			});
			return modelData[0];
		} catch(err) {
			throw err;
		}
	}

	/**
	 * The purpose of this function is to recreate props
	 * on the response from the request object.
	 */
	async relocateProps(root, target, props = [], propsCondition = []) {
		Seq(root).forEach((_, k) => {
			propsCondition.forEach(prop => {
				if (!(prop in target[k]) && prop in _) {
					target[k][prop] = root[k][prop];
				}
			});
			props.forEach(prop => {
				target[k][prop] = root[k][prop];
			});
		});
	}

	async getModelVersionByModelId(modelId, userId, attrs = []) {
		attrs = ['id', ...attrs];
		try {
			const modelData = await this.dbInstance.sequelize.query(
				`SELECT
					${attrs.map(c => `mv."${c}"`).join(', ')}
				FROM model_version mv
				LEFT JOIN model m on m.id = mv.modelid
				WHERE mv.modelid = :modelId	and m.userid = :userId
				LIMIT 1`,
			{
				replacements: {modelId, userId},
				type: this.dbInstance.sequelize.QueryTypes.SELECT
			});
			return modelData[0];
		} catch(err) {
			throw err;
		}
	}

	/**
	 * This function retrieves the original versions of a model version
	 * @param {number} versionId
	 * @returns {Promise<Array>}
	 */
	async getOriginalVersions(versionId) {
		try {
			return this.dbInstance.sequelize.query(
				`with orig_versions as (
					select distinct mv_orig.id, mv_list.modelid, mv_list."version"
					from model_version mv
					inner join model m on m.id = mv.modelid
					inner join model_version mv_orig on mv_orig.modelid = m.originid
					inner join model_version mv_list on mv_list.id = mv_orig.id
					where mv.id = :versionId and mv_list."_deleted" != true
				)
				select orig_versions.id as version_id, orig_versions."version"
				from orig_versions
				inner join model m_orig on m_orig.id = orig_versions.modelid
				where m_orig."_deleted" != true`,
			{
				replacements: {versionId},
				type: this.dbInstance.sequelize.QueryTypes.SELECT
			});
		} catch(err) {
			err.message = `Error getting original versions: ${err.message}`;
			throw err;
		}		
	}

	/**
	 * 
	 * @param {*} sortedEntries 
	 * @param {*} versionList 
	 * @returns {Array<{modelId: number, prev: number, next: number, key: string}>}
	 */
	getRelocatedVersion(sortedEntries, versionList) {
		const listNextVersion = [0], listReplaced = [];
		sortedEntries.forEach((entry, key) => {
			if (key.includes('/')) {
					let keyVersion = key.split('/')[1];
					if (parseInt(keyVersion) < 0 && entry.id) {
						let currVersion = Number(entry.currentVersion);
						let maxVersion = Math.max(...listNextVersion);
						if (maxVersion >= currVersion ) {
							currVersion = Number(maxVersion)+1;
						}
						let versionExists = versionList.some(v => v.version && v.version == currVersion);
						let i = versionList.length;
						while (!versionExists && i > 0) {
							currVersion = Number(currVersion)+ 1;
							versionExists = versionList.some(v => v.version && v.version == currVersion);
							i = i-1;
						}
						listNextVersion.push(currVersion);
						listReplaced.push({modelId: entry.id, prev: entry.currentVersion, next: currVersion, key});
					}
			}
		});
		// sorting in descending order by next
		return listReplaced.sort((a, b) => b.next - a.next);
	}

	/**
	 * 
	 * @param {object} jsonData
	 * @returns {Promise<void>}
	 */
	async syncVersionNumbers(jsonData) {		

		let sortedEntries = Seq(jsonData);

		sortedEntries = sortedEntries.filter((_, key) => key.includes('/'))
			.sortBy(entry => entry.currentVersion);
	
		const minorId = sortedEntries.first()?.id;
		if (!minorId) { return }

		const versionList = await this.getOriginalVersions(minorId);

		let relocatedVersions = this.getRelocatedVersion(sortedEntries, versionList);
		try {
			for (const replaced of relocatedVersions) {
				await this.dbInstance.ModelVersion.update({
					version: replaced.next
				}, {
					where: {
						modelid: replaced.modelId
					}
				});
				await this.dbInstance.LearningActivity.update({
					version: replaced.next
				}, {
					where: {
						masterid: minorId,
						version: replaced.prev
					}
				});
				jsonData[replaced.key].currentVersion = replaced.next;
			}
		} catch(err) {
			throw err;
		}		
	}

}
