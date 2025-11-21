import { QueryTypes } from "sequelize";

export default class CCAppAccount {

	constructor (modelInstance = null, transaction = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
		this.transaction = transaction;
	}

	getCCAppMigrationByUserId(user_id) {
		return this.dbInstance.UserCCApp.findOne({
			where: { user_id }
		});
	}

	async createCCAppMigration(user_id, user_ccapp_id = '', password_pending_update = false) {
		// TODO: Check method upsert
		const existingRecord = await this.dbInstance.UserCCApp.findOne({
				where: { user_id }
		});
		if (existingRecord) {
				return existingRecord.update({ user_ccapp_id });
		} else {
				return this.dbInstance.UserCCApp.create({ user_id, user_ccapp_id, password_pending_update });
		}
	}

	/**
	 * 
	 * @param {Number} user_id 
	 * @param {{user_ccapp_id:,password_pending_update:false}} fields 
	 * @returns 
	 */
	updateCCAppMigration(user_id, fields) {
		return this.dbInstance.UserCCApp.update(fields, {
				where: { user_id }
		});
	}

	async verifyUserMigration(email) {
		let userData = await this.dbInstance.sequelize.query(`
			select
				p.user_id,
				uc.user_ccapp_id,
				uc.password_pending_update,
				p.firstname,
				p.lastname,
				p.institution_id,
				roles.roles_list
			from "user" u
			inner join profile p on p.user_id = u.id 
			left join users_ccapp uc on uc.user_id = p.user_id
			left join(
					select 
							a.user_id,
							ARRAY_AGG(r."name") as roles_list
					from authority a
					inner join "role" r on r.id = a.role_id
					group by a.user_id
			) roles ON roles.user_id = p.user_id
			where p.email = :email and u.enabled = true`,
		{
			type: QueryTypes.SELECT,
			replacements: { email }
		});

		if (userData.length) {
			return userData[0]
		}
		return null;
	}


	static convertRoleNames(roles = []) {
		let _roles =  Array.isArray(roles) ? roles : ['STUDENT'];
		return _roles.map(role => {
			if (role == 'STUDENT') return 'STUDENTS';
			if (role == 'INSTRUCTOR') return 'TEACHERS';
			if (role == 'SCIENTIST') return 'RESEARCHERS';
			if (role == 'ADMINISTRATOR') return 'ADMINS';
		});
	}
}