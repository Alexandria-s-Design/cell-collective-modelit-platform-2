import { generateHash, generateKeyTime } from "../../../util/crypto";
import { USER_ROLES } from "./RegisterCCAppAccount";

export const APP_EMAIL_HOST = 'cellcollective.org';

export const TEMP_ACCESS_TYPE = { lesson: 'LESSON' };

export class AnonymousUserModelIt {
	constructor() {
		this.email = 'modelitlearn.noreply@gmail.com';
		this.password = 'IUr2WAaaFugM5yFn';
		this.firstName = 'Anonymous';
		this.lastName = 'Learning';
		this.role_id = USER_ROLES.STUDENT;
		this.institution = 'University of Nebraska-Lincoln';
	}
}

export default class TemporaryCredentials {

	constructor (modelInstance = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
		this.tempEmail = null;
		this.tempSecretKey = null;
	}

	async verifyCredentials(email, secretKey) {
		const credentials = await this.dbInstance.TemporaryCredentials.findOne({
			attributes: ['tempEmail','targetEmail','userTimezone','_createdAt'],
			where: {
				tempEmail: email,
				tempSecretKey: secretKey,
				_deleted: { [this.dbInstance.Sequelize.Op.ne]: true },
			}
		});
		this.tempEmail = email;
		this.tempSecretKey = secretKey;
		return credentials ? credentials.toJSON() : null;
	}

	async generateCredentials(secretsUser, accessCode, accessType, userIp, userTimezone) {

		const tempEmail = `${generateKeyTime()}@${APP_EMAIL_HOST}`;
		const tempSecretKey = generateHash();

		await this.dbInstance.TemporaryCredentials.create({
			targetEmail: secretsUser.email,
			tempEmail,
			tempSecretKey,
			accessType,
			accessCode,
			userIp,
			userTimezone
		});

		return {
			email: tempEmail,
			password: tempSecretKey
		}
	}

	async deleteCredentials() {
		this.dbInstance.TemporaryCredentials.update({
				_deleted: true,
				_deletedAt: this.dbInstance.Sequelize.fn('NOW'),
				usedAt: this.dbInstance.Sequelize.fn('NOW'),
			},{	where: {
				tempEmail: this.tempEmail,
			}
		});
	}

}