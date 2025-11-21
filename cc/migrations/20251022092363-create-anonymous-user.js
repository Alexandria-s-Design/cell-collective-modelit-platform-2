'use strict';
import { encodeMd5Password } from "../server/api/manageUser/Account";
import { getNewModelId } from "../server/api/manageUser/RegisterCCAppAccount";
import { AnonymousUserModelIt } from "../server/api/manageUser/TemporaryCredentials";
import models from "../models";

module.exports = {
	async up(queryInterface, Sequelize) {

		const transaction = await models.sequelize.transaction();

		let jsonData = new AnonymousUserModelIt();
		jsonData = { ...jsonData }

		const { User, Institution, Profile, Authority } = models;

		try {
			const user = await User.create({
				id: await getNewModelId(User),
				enabled: true,
				password: encodeMd5Password(jsonData.password)
			}, { transaction });

			const findInstitution = await Institution.findOne({
				where: {
					name: jsonData.institution
				}
			});
			let institutionId = findInstitution ? findInstitution.id : null;

			await Profile.create({
				id: await getNewModelId(Profile),
				user_id: user.id,
				email: jsonData.email,
				firstname: jsonData.firstName,
				lastname: jsonData.lastName,
				institution_id: institutionId
			}, { transaction });

			await Authority.create({
				user_id: user.id,
				role_id: jsonData.role_id || USER_ROLES.STUDENT
			}, { transaction });

			await transaction.commit();

		} catch (e) {
			await transaction.rollback();
			throw new Error("It was unable to create a new user. ", e.message)
		}

		
	},
	async down(queryInterface, Sequelize) {
		
		const transaction = await models.sequelize.transaction();

		let jsonData = new AnonymousUserModelIt();

		try {
			const { User, Profile, Authority } = models;

			const anonymousEmail = jsonData.email;

			const profile = await Profile.findOne({
				where: { email: anonymousEmail },
				transaction,
				lock: transaction.LOCK.UPDATE,
			});

			if (!profile) {
				await transaction.commit();
				return;
			}

			const userId = profile.user_id;
			await Authority.destroy({ where: { user_id: userId }, transaction });
			await Profile.destroy({ where: { user_id: userId }, transaction });
			await User.destroy({ where: { id: userId }, transaction });

			await transaction.commit();
		} catch (err) {
			await transaction.rollback();
			throw err;
		}
	}
};
