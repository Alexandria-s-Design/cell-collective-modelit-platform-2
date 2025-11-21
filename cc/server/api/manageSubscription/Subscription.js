
export default class Subscription {

	constructor (modelInstance = null, transaction = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
		this.transaction = transaction;
	}

	async getSubscriptionByUser(userId = 0) {
		return this.dbInstance.UserSubscription.findAll({
			attributes: ['AccountPlanId', [this.dbInstance.Sequelize.fn('max', this.dbInstance.Sequelize.col('_updatedAt')), 'updatedAt']],
			group: ['UserSubscription.AccountPlanId'],
			where: { _createdBy: {[this.dbInstance.Sequelize.Op.eq]: parseInt(userId)} }
		});
	}
}
