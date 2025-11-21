const TYPE_METABOLIC = 'metabolic';

export default class Publish {

	constructor (modelInstance = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
	}

	async setPublishment(id, userId, value, mType = null, isAdmin=false) {
		const params = {value, versionId: id}
		let queryUpdate = `UPDATE "model"
		SET "published"=:value, "publishedAt"=CURRENT_TIMESTAMP,
		"updatedate"=CURRENT_TIMESTAMP, "biologicupdatedate"=CURRENT_TIMESTAMP, "_updatedAt"=CURRENT_TIMESTAMP
		WHERE 1=1`;

		if (!isAdmin) {
			queryUpdate += ` AND userid=:userId`;
			params.userId = userId;
		}

		if (mType === TYPE_METABOLIC) {
			queryUpdate += ` AND id IN (SELECT modelid FROM model_version WHERE modelid=:versionId)`;
		} else {
			queryUpdate += ` AND id IN (SELECT modelid FROM model_version WHERE id=:versionId)`
		}
		await this.dbInstance.sequelize.query(queryUpdate, {
			replacements: params,
			type: this.dbInstance.sequelize.QueryTypes.UPDATE
		});
	}

	/**
	 * Check if model is published across any of its versions
	 * @param {Number} modelId 
	 * @param {Boolean} inverted
	 * @returns {Promise<Boolean>}
	 */
	async isModelPublished(modelId, inverted = false) {
		const result = await this.dbInstance.sequelize.query(
			`select count(1) from model m inner join model_version mv on mv.modelid = m.id where mv.id = :modelId and m.published = :publish`,
		 {
			replacements: {modelId, publish: inverted ? "False" : "True"},
			type: this.dbInstance.sequelize.QueryTypes.SELECT,
		});
		return result.length ? true : false;
	}
}
