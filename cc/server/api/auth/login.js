import Response from '../../response';
import CCAppService, { CCAppErrorHandler, CCAppException } from "../../../service/ccapp";
import { WebException } from "../../../service/web";
import logger from "../../../logger";
import models from "../../../models";
import { encodeMd5Password } from '../manageUser/Account';
import CCAppAccount from '../manageUser/CCAppAccount';
import { buildBasicAuthorizationToken, registerUserSession } from '../../middlewares/proxy';
import RegisterCCAppAccount, { USER_ROLES, UserCCAppAccountEnitity } from '../manageUser/RegisterCCAppAccount';
import TemporaryCredentials, { AnonymousUserModelIt } from '../manageUser/TemporaryCredentials';
import { getenv } from "../../../util/environment";

const CC_SECRET_KEY = "IUr2WAaaFugM5yFn";

/**
 * @param {String} masterPassword 
 */
export function isMasterPassword(masterPassword) {
		// TODO: Encrypt master password
		const isMaster = masterPassword === getenv("MASTER_PASSWORD");
		logger.info(`Master password verification ${isMaster ? 'succeeded' : 'failed'}.`);
		return isMaster;
}

export async function verifyAppUserCredentials(credentials = {}) {
		const userEntity = await models.Profile.findOne({
			attributes: ['email', 'user_id'],
			where: {
					email: credentials.email
			},
			include: [{
					model: models.User,
					attributes: ['id'],
					where: {
							password: encodeMd5Password(credentials.password),
							enabled: true
					}
			}]
		});
		if (userEntity) { return userEntity.toJSON() }
		if (isMasterPassword(credentials.password)) {
			return { email: credentials.email }
		}
		return null;
}

/**
 * @param {{password: str, email: str}} credentials 
 */
export async function connectToCCApp(credentials = {}) {
	try {
		logger.info("Sending credentials to CCApp...")
		let { data: ccappResponse } = await CCAppService.request.post(`/auth/login`, credentials);
		return ccappResponse;
	} catch(err) {
		logger.info("Error on sending credentials to CCApp...");
		CCAppErrorHandler(err);
	}
}

async function callCCAppImpersonateUser(req, credentials={}) {
	try {
		logger.info("Sending credentials to CCApp...")
		let { data: ccappResponse } = await CCAppService.requestWithToken(null, req).post(`/auth/impersonate`, credentials);
		return ccappResponse;
	} catch(err) {
		logger.info("Error on sending credentials to CCApp...");
		if(err.response && err.response.status == 404) {
			throw new CCAppException("Invalid email")
		} else if (err.response && err.response.status == 401) {
			throw new CCAppException("Invalid token. please login")
		}
		else if (err.response && err.response.status == 403) {
			throw new CCAppException("You do not have ADMIN role")
		}
		else if (err.response && err.response.status == 400) {
			throw new CCAppException(err.response.data.data.error)
		}
		else {
   		CCAppErrorHandler(err);
		}
	}
}

/**
 * @param {String} signInTempToken
 */
export async function connectWithTempTokenCCApp(signInTempToken) {
	try {
		logger.info("Sending temp Token to CCApp...")
		let { data: ccappResponse } = await CCAppService.request.post(`/auth/login-thirdparty`, { signin_temp_token: signInTempToken });
		return ccappResponse;
	} catch(err) {
		logger.info("Error on sending credentials to CCApp...");
		CCAppErrorHandler(err);
	}
}

/**
 * @param {Object} userData
 */
export async function saveUserToCCApp(userData = {}) {
	try {
		logger.info(`Registering the user ${userData.email}  to CCApp...`);
		let { data: ccappResponse } = await CCAppService.request.post(`/users/register`, userData);
		return ccappResponse.data;
	} catch(err) {
		logger.info("Error on saving user to CCApp...");
		CCAppErrorHandler(err);
	}
}

/**
 * @param request | requestWithToken
 * @param pkUserUUID
 * @param userData
 */
export async function updatingUserToCCApp(request, pkUserUUID, userData = {}) {
	try {
		logger.info("Updating user in the CCApp...")
		let { data: ccappResponse } = await request.put(`/users/profile/edit/${pkUserUUID}`, userData);
		return ccappResponse.data;
	} catch(err) {
		logger.info("Error on updating user in the CCApp...");
		throw err;
	}
}

/**
 * Main auth middleware
 */
export default async function authLogin(req, res) {
  const response = new Response();

  try {
		const requestForm = {
			email: req.body.email,
			password: req.body.password
		}

		let ccappData;
		let signInTempToken = req.body.signin_temp_token;
		let temporaryCredentialsObj;

		const { modelit_credentials } = req.query;
		
		if (modelit_credentials) {
			temporaryCredentialsObj = new TemporaryCredentials(models);
			const tempUser = await temporaryCredentialsObj.verifyCredentials(requestForm.email, requestForm.password);
			if (!tempUser) {
				throw new WebException("Please provide valid ModelIt credentials!");
			}
			const anonymousUser = new AnonymousUserModelIt();
			requestForm.email = anonymousUser.email;
			requestForm.password = anonymousUser.password;
			signInTempToken = null;
		}

		if (!signInTempToken && (!requestForm.email || !requestForm.password)) {
			throw new WebException("Please provide valid credentials!");
		}
		const isCurrentMasterUser = isMasterPassword(requestForm.password);
		
		if (signInTempToken) {
			logger.info(`Connecting temp Token with CCApp...`);
			ccappData = await connectWithTempTokenCCApp(signInTempToken);
			requestForm.email = ccappData.app_user_email;			
			const userProfile = await models.Profile.findOne({
				where: { email: requestForm.email }
			});
			if (!userProfile) {
				let appUsername = requestForm.email.split('@');
				appUsername = appUsername[0]+"-"+(new Date()).getTime();
				const registerAppAccount =  new RegisterCCAppAccount(models);
				const userForm = UserCCAppAccountEnitity;
				userForm.email = requestForm.email;
				userForm.password = requestForm.password;
				userForm.firstName = appUsername;
				userForm.lastName = '';
				userForm.role_id = USER_ROLES.STUDENT;
				userForm.ccappUserId =  ccappData.user_id;
				logger.info(`Adding new user to App...`);
				await registerAppAccount.createAccount(userForm, ccappData.access_token);
			}
		}
		const entityCCApp = new CCAppAccount(models);
		const userMigration = await entityCCApp.verifyUserMigration(requestForm.email);

		// Starting migration once the user exists in the Java app
		if (userMigration && !userMigration.user_ccapp_id) {
			logger.info(`Migrating user ${userMigration.user_id} APP to users CCApp...`);
			if (!signInTempToken) {
				const userApp = await verifyAppUserCredentials(requestForm);
				if (!userApp) {
					throw new WebException("Invalid credentials!")
				}
			}
			let appUsername = requestForm.email.split('@');
			appUsername = appUsername[0]+"-"+(new Date()).getTime();
			const userCCAppForm = {
				update_secret_key: CC_SECRET_KEY,
				first_name: userMigration.firstname,
				last_name: userMigration.lastname,
				username: appUsername,
				email: requestForm.email,
				password: requestForm.password,
				app_user_id: userMigration.user_id,
				institution_id: userMigration.institution_id || null,
				roles: CCAppAccount.convertRoleNames(userMigration.roles_list)
			}
			if (!userCCAppForm.update_secret_key) {
				throw new Error("An update key is required");
			}			
			const userSaved = await saveUserToCCApp(userCCAppForm);
			await entityCCApp.createCCAppMigration(
				userMigration.user_id,
				userSaved.profile.user.id,
				isCurrentMasterUser || signInTempToken
			);
		}

		// Resetting migration and CCApp password by a non-master user or SSO Login
		if (!signInTempToken && userMigration && userMigration.password_pending_update && !isCurrentMasterUser) {
			const userApp = await verifyAppUserCredentials(requestForm);
			if (!userApp) {
				throw new WebException("Invalid credentials!")
			}
			await CCAppService.request.post("/users/reset-password", {
				"secret": CC_SECRET_KEY,
				"password": requestForm.password,
				"vpassword": requestForm.password,
				"email": requestForm.email
			});
			await entityCCApp.updateCCAppMigration(
				userMigration.user_id, {
					password_pending_update: false
				}
			);
		}

		if (!signInTempToken) {
			logger.info(`Connecting user ${requestForm.email} with CCApp...`);
			ccappData = await connectToCCApp(requestForm);
		}

		if (ccappData.access_token && ccappData.app_user_id && ccappData.app_user_email) {
			logger.info(`Connecting user ${requestForm.email} with Java App...`);
			const basic_auth_token = buildBasicAuthorizationToken(ccappData.app_user_id, ccappData.app_user_email);
			logger.info(`Request access with Basic Authorization ${basic_auth_token}...`);
			await registerUserSession(req, basic_auth_token);
		}	else {
			logger.error(`Error for access Java App with app_user_id: ${ccappData.app_user_id }...`);
		}

		if (modelit_credentials) {
			temporaryCredentialsObj.deleteCredentials()
		}

    response.data = ccappData;

  } catch (err) {
		if (err instanceof CCAppException || err instanceof WebException) {
			response.setError(Response.Error.BAD_REQUEST, err.message);
		} else {			
			response.setError(Response.Error.INTERNAL_SERVER_ERROR, err.toString());
		}
  }
  res.status(response.code).json(response.json);
}


export async function impersonateUserLogin(req, res) {
	const response = new Response();
	const requestForm = {
		email: req.body.email,
		password: req.body.password
	}
	try {
		logger.info(`Impersonation: Connecting user ${requestForm.email} with CCApp...`);
		const ccappData = await callCCAppImpersonateUser(req, requestForm);
		if (ccappData.access_token && ccappData.app_user_id && ccappData.app_user_email) {
			logger.info(`Impersonation: Connecting user ${requestForm.email} with Java App...`);
			const basic_auth_token = buildBasicAuthorizationToken(ccappData.app_user_id, ccappData.app_user_email);
			logger.info(`Impersonation: Request access with Basic Authorization ${basic_auth_token}...`);
			await registerUserSession(req, basic_auth_token);
			response.data = ccappData;
		}	else {
			response.setError(Response.Error.INTERNAL_SERVER_ERROR, "Impersonation request failed")
			logger.error(`Impersonation: Error for access Java App with app_user_id: ${ccappData.app_user_id }...`);
		}	
	}
	catch (err) {
		if (err instanceof CCAppException || err instanceof WebException) {
			response.setError(Response.Error.BAD_REQUEST, err.message);
		} else {			
			response.setError(Response.Error.INTERNAL_SERVER_ERROR, err.toString());
		}
	}
	res.status(response.code).json(response.json);
}