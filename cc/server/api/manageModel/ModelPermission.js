export default class ModelPermission {

	constructor (modelInstance = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
	}

	/**
	 * This function will filter models and let only models with valid permission.
	 * Note: this is a mutating method.
	 */
	async preparingAllowedModels(reqBody, userId, ignoreKeys = []) {
		const modelKeys = Object.keys(reqBody);
		if (modelKeys.length == 0) {
			return;
		}
		const modelIds = modelKeys.map(idVal => {
			const arrId = `${idVal}`.split('/');
			return arrId[0] > 0 && reqBody[idVal] ? arrId[0] : null;
		}).filter(idVal => idVal);
		
		if (modelIds.length == 0) {
			return;
		}

		const modelsAllawed = await this.getAllowedModels(modelIds, userId);
		for (const idVal of modelKeys) {
			const modelType = reqBody[idVal] && reqBody[idVal].modelType;
			if (modelType !== "boolean" || ignoreKeys.includes(idVal)) {
				continue;
			}
			const arrId = `${idVal}`.split('/');
			if (arrId.length <= 1 || arrId[0] < 0) {
				continue;
			}
			if (modelsAllawed.findIndex(v => v.id == arrId[0]) < 0) {
				delete reqBody[idVal];
			}
		}
		
		if (Object.keys(reqBody).length == 0) {
			throw new Error('No valid model data found.');
		}
	}

	/**
	 * @param {Array<number>} versionIds 
	 * @param {number} userId 
	 * @returns 
	 */
	getAllowedModels(versionIds, userId) {
		return this.dbInstance.sequelize.query(
			`select mv.id from model m
			inner join model_version mv on mv.modelid = m.id
			left join model_share_owner mso on mso.model_id = m.id
			left join model_share ms on ms.model_id = m.id and ms."access" = 'EDIT'
			where mv.id in(:versionIds) and ( m.userid = :user or ms.userid = :user or mso.share_user_id = :user)
			group by mv.id`,
		 {
			replacements: {user: parseInt(userId), versionIds},
			type: this.dbInstance.sequelize.QueryTypes.SELECT
		});
	}

	async isSharedModel(modelId=0, userId=0) {
		const result = await this.dbInstance.sequelize.query(
			`select	count(1) as t	from model_share_owner mso where mso."model_id" = :modelId and mso."share_user_id" = :userId`,
		 {
			replacements: {modelId, userId},
			type: this.dbInstance.sequelize.QueryTypes.SELECT,
		});
		return result.length ? true : false;
	}
}
