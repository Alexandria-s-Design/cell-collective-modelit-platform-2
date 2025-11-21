import { connectToCCApp, updatingUserToCCApp } from '../auth/login';
import CCAppService from "../../../service/ccapp";

const FLAGGED_PASSWORD = '$CCAPP_PASSWORD';
export const USER_ROLES = {
	STUDENT: 2,
	SCIENTIST: 3,
	INSTRUCTOR: 1
}

export const UserCCAppAccountEnitity = {
	email: '',
	password: '',
	firstName: '',
	lastName: '',
	role_id: '',
	ccappUserId: ''	
}

export const getNewModelId = async (model) => {
	const lastModel = await model.findOne({
		order: [ ["id", "DESC"] ]
	});		
	return parseInt(lastModel.id) + 1;
}

export default class RegisterCCAppAccount {

	constructor (modelInstance = null, transaction = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
		this.transaction = transaction;
	}


	/**
	 * @param {UserCCAppAccountEnitity} jsonData 
	 */
	async createAccount(jsonData = {}, accessToken) {

		const transaction = await this.dbInstance.sequelize.transaction();

		try {		
			const user = await this.dbInstance.User.create({
				id: await getNewModelId(this.dbInstance.User),
				enabled: true,
				password: FLAGGED_PASSWORD
			}, { transaction });

			const findInstitution = await this.dbInstance.Institution.findOne({
				where: {
					name: jsonData.institution
				}
			});
			let institutionId = findInstitution ? findInstitution.id : null;

			let profile = await this.dbInstance.Profile.create({
				id: await getNewModelId(this.dbInstance.Profile),
				user_id: user.id,
				email: jsonData.email,
				firstname: jsonData.firstName,
				lastname: jsonData.lastName,
				institution_id: institutionId
			}, { transaction });

			await this.dbInstance.Authority.create({
				user_id: user.id,
				role_id: jsonData.role_id || USER_ROLES.STUDENT
			}, { transaction });

			let userCCApp = await this.dbInstance.UserCCApp.create({
				user_id: user.id,
				user_ccapp_id: jsonData.ccappUserId
			}, { transaction });

			let _accessToken = accessToken;
			if (!accessToken && jsonData.password) {
					const ccappData = await connectToCCApp({
						email: jsonData.email,
						password: jsonData.password
					});
					_accessToken = ccappData.access_token;
			}
			if (_accessToken) {
				await updatingUserToCCApp(
					CCAppService.requestWithToken(_accessToken),
					jsonData.ccappUserId,
					{ app_user_id:  user.id }
				);
			}

			await transaction.commit();

			return {
				user_id: user.id,
				profile_id: profile.id,
				ccapp_user_id: userCCApp.id
			}

		} catch (e) {
			await transaction.rollback();
			console.error(e)
			throw new Error("It was unable to create a new user.")
		}
	}

	async updateAccount(userId, jsonData = {}, profileId) {

		const transaction = await this.dbInstance.sequelize.transaction();

		try {
			let profile = await this.dbInstance.Profile.update({
				email: jsonData.email,
				firstname: jsonData.firstName,
				lastname: jsonData.lastName
			}, {
				where: {
					user_id: userId
				}
			}, { transaction });

			let userCCApp;
			const userMigrated = await this.dbInstance.UserCCApp.findOne({
				where: {
					user_id: userId
				}
			});

			if (userMigrated) {
				userCCApp = await this.dbInstance.UserCCApp.update({
					user_ccapp_id: jsonData.ccappUserId,
					_updatedAt: this.dbInstance.Sequelize.literal('CURRENT_TIMESTAMP'),
					_updatedBy: userId
				}, {
					where: {
						user_id: userId
					}
				}, { transaction });
				userCCApp = { id: userMigrated.id };
			} else {
				userCCApp = await this.dbInstance.UserCCApp.create({
					user_id: userId,
					user_ccapp_id: jsonData.ccappUserId
				}, { transaction });
			}

			await transaction.commit();

			return {
				user_id: userId,
				profile_id: profileId,
				ccapp_user_id: userCCApp.id
			}

		} catch (e) {
			await transaction.rollback();
			console.error(e)
			throw new Error(`It was unable to update user ${userId}.`)
		}
	}

}