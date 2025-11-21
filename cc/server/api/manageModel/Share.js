import { Seq } from "immutable";

export class ShareDataPrepared {
	key;
	email;
	version;
	versionId;
	modelType;
	constructor (data) {
		this.key = data.key;
		this.email = data.email;
		this.version = data.version;
		this.versionId = data.versionId;
		this.modelType = data.modelType;
	}
}

export default class Share {

	constructor (modelInstance = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
	}

	preparingToSave(root, index, versionId, version) {
		if (!root || !root[index] || !root[index].hasOwnProperty('shareMap')) {
			return;
		}
		const shareData = [];
		Seq(root[index].shareMap).forEach((v, k) => {
			if (v !== null && k > -1 && v.hasOwnProperty("email")) {
				shareData.push(new ShareDataPrepared({
					key: k,
					email: v.email,
					version: version,
					versionId: versionId,
					modelType: root[index].modelType
				}));
			}
		});
		return shareData.length ? shareData : null;	
	}

	async saveSharedVersion(shareMapArr = [new ShareDataPrepared]) {
		for (const shareData of shareMapArr) {
			const notAddedShared = await this.dbInstance.sequelize.query(
				`select mv.modelid, ms.userid, ms.email, ms.access
				from model_version mv
				inner join model_share ms on ms.model_id = mv.id
				where mv.id = :versionId and ms.id = :shareId and mv."version" = :version
				limit 1`,
				{
					replacements: {
						shareId: shareData.key,
						version: shareData.version,
						versionId: shareData.versionId
					},
					type: this.dbInstance.sequelize.QueryTypes.SELECT
				}
			);

			if (notAddedShared.length == 0) {
				continue;
			}

			const findShared = await this.dbInstance.model_share.findOne({where: {
				model_id: notAddedShared[0].modelid,
				userid: notAddedShared[0].userid,
				email: notAddedShared[0].email
			}});

			if (!findShared) {
				await this.dbInstance.model_share.create({
					id: this.dbInstance.sequelize.fn('nextval', this.dbInstance.sequelize.literal("'model_share_id_seq'")),
					email: notAddedShared[0].email,
					userid: notAddedShared[0].userid,
					access: notAddedShared[0].access,
					model_id: notAddedShared[0].modelid,
					updatedate: this.dbInstance.sequelize.fn('NOW'),
					creationdate: this.dbInstance.sequelize.fn('NOW')
				});
			} else {
				await this.dbInstance.model_share.update({
					email: notAddedShared[0].email,
					access: notAddedShared[0].access,
					updatedate: this.dbInstance.sequelize.fn('NOW')
				}, {
					where: {id: findShared.id}
				});
			}
		}		
	}
}
