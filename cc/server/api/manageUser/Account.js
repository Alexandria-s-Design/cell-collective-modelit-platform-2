import * as Md5PasswordEncoder from "crypto";

export function encodeMd5Password(password) {
		return Md5PasswordEncoder.createHash('md5').update(password).digest('hex');
}

export default class Account {

	constructor (modelInstance = null, transaction = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
		this.transaction = transaction;
	}

	async getUserProfileByEmail(email) {		
		return this.dbInstance.User.findOne({
			attributes: ["enabled"],
			include: [{
				attributes: ["user_id", "email", "firstname"],
				model: this.dbInstance.Profile,
				where: { email }
			}]
		});
	}

	async isStudent(userId = 0) {
		const user_id = parseInt(userId, 10);
		if (!user_id) return false;
		return (await this.dbInstance.authority.findOne({
			where: {
				user_id,
				role_id: {[this.dbInstance.Sequelize.Op.or]: [2,3]}
			}
		})) != null;
	}

	async isAdmin(userId = 0) {
		const user_id = parseInt(userId, 10);
		if (!user_id) return false;
		return (await this.dbInstance.authority.findOne({
			where: {
				user_id,
				role_id: 4 /* ADMIN */
			}
		})) !== null;
	}
}
