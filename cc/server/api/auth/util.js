import { Router } from "express"
import { isEmpty } from "lodash";
import passport from "passport";
import querystring from "querystring";

import models from "../../../models"
import logger from "../../../logger";

import WebService from "../../../service/web"
import AppService from "../../../service/app";
import { getenv } from "../../../util/environment";


const SOCIAL_PASSWORD = getenv("SOCIAL_PASSWORD");

const getNewModelId = async model => {
	const lastModel = await model.findOne({
		limit: 1,
		order: [
			["id", "DESC"]
		]
	});

	return parseInt(lastModel.id) + 1;
}

export const createOrUpdateSocialUser = async ({ email, tpId, tpType, avatarUri, firstname, lastname }) => {
	const transaction = await models.sequelize.transaction();
	
	let created = false;
	let updated = false;

	const password = SOCIAL_PASSWORD;

	const emails = Array.isArray(email) ? email : [email];

	const primaryEmail = emails[0];
	// get the email from the json file
	const alternateEmails = emails.slice(1);

	try {
		let profile = await models.Profile.findOne({
			where: {
				email: primaryEmail
			}
		});
	 
		if ( !profile ) {
			logger.info("No profile found. Creating user...")
	
			// create the user and its profile.
			const user = await models.User.create({
				id: await getNewModelId(models.User),
				enabled: true, // TODO: alter constraint in table to defaultVal?
				password: password
			}, { transaction });
	
			profile = await models.Profile.create({
				id: await getNewModelId(models.Profile),
				user_id: user.id,
	
				email: primaryEmail,
				firstname: firstname,
				lastname: lastname,
				alternateEmails: alternateEmails,
				avatarUri: avatarUri,
	
				thirdPartyId: tpId,
				thirdPartyType: tpType
			}, { transaction });
	
			created = true;
			updated = true;
		} else {
			logger.info("Profile found.")
			// user exists.
			if ( !profile.thirdPartyId ) {
				logger.info("Updating SSO credentials...")
				// update user details.
				profile.thirdPartyId = tpId;
				profile.thirdPartyType = tpType;
				profile.avatarUri = avatarUri;
	
				await profile.save({ transaction });
	
				updated = true;

			} else {
				logger.info("SSO already verified.");
	
				// todo: update credentials;
				profile.avatarUri = avatarUri;

				await profile.save({ transaction });
	
				updated = true;
			}
		}
	 
		// cases where email(s) do not exist
		// put in whatever the username is provided in the json file as alternateUserName column in the db
	
		// cases where username does not exist - username: undefined
		// create a dummy username - id is important! 
		// if signing up/logging in with the existing id, might want to check if that id exists in the db 
		// check for thirdPartyId (such as for Facebook)
		// - If not exists, put in the firstname, lastname provided by the social json, thirdPartyId, thirdPartyType. 
		// email and username column in the db are allowed to be null?
		await transaction.commit()
	} catch (e) {
		await transaction.rollback();
		throw new Error(`Unable to create or save user.`);
	}

	return { created, updated, user: { username: primaryEmail, password } };
}

export const loginSocialUser = async user => {
	if ( user ) {
		user.password  = getenv("MASTER_PASSWORD");
		const params   = querystring.stringify(user);
		let   response = await WebService.request.post('/_api/login', params, { headers: { "content-type": "application/x-www-form-urlencoded" }});

		let token = response.headers['x-auth-token'];
		let userO = null

		if ( !token ) {
			throw new Error(`Internal Error: Unable to login user`);
		} else {
			logger.info(`Logged in user successfully. Fetching profile...`);

			response = await AppService.request.get('/user/getProfile', {
				headers: { "X-AUTH-TOKEN": token }
			})

			const { data } = response;

			if ( data.id ) {
				logger.info(`Logging in social user ${JSON.stringify(data)}...`);
				userO = data;
			} else {
				throw new Error(`Unable to fetch user data from server.`);
			}
		}
		
		return { token, user: userO };
	} else {
		throw new Error(`User not found to login.`)
	}
}

export const loginSocialUserDone = async (user, done) => {
	let token = "";
	let userO = null

	try {
		const result = await loginSocialUser(user);

		if ( !result.token || !result.user ) {
			return done(new Error(`Unable to login user`));
		} else {
			token = result.token;
			userO = result.user;
		}
	} catch (e) {
		return done(e);
	}

	return done(null, { ...userO, token: token })
}

export const buildSocialLogin = (name, { Strategy, strategyArgs, authenticateArgs }) => {
	const router = new Router();

	passport.initialize();
	passport.session();

	passport.serializeUser((user, done) => {
		done(null, user);
	});
	
	passport.deserializeUser((id, done) => {
		models.User.findById(id, (err, user) => {
			done(err, user);
		});
	});

	passport.use(new Strategy(
		{ ...strategyArgs,
			callbackURL: `/api/auth/${name}/callback`
		},
		async (accessToken, refreshToken, profile, done) => {
			const emails  = profile.emails;
			const photos  = profile.photos;
			const firstname = profile.name.givenName;
			const lastname = profile.name.familyName;
			let   avatar  = null;
		
			// cases
			// is empty?
			if ( isEmpty(emails) ) {
				// TODO: elaborate error.
				throw new Error(`No Google email found.`);
			}
			
			if ( emails.length == 1 ) {
				// there is just one email.
				const email = emails[0];

				// if ( name == "google" ) {
				// 	if ( !email.verified ) {
				// 		throw new Error(`Google Email is not a verified email.`);
				// 	}
				// }
			}

			//check is given name is present and replace with given name which is more accurate
			// if (profile.name.givenName !== null ) {
			// 	firstname = profile.name.givenName;
			// }

			if ( !isEmpty(photos) ) {
				const photo = photos[0].value;

				avatar = photo;
			}

		
			const validEmails = emails
				// .filter(email => email.verified)
				.map(email => email.value)
		
			const { created, updated, user } = await createOrUpdateSocialUser({
				email: validEmails,
				avatarUri: avatar,
				tpId: profile.id,
				tpType: name,
				firstname: firstname,
				lastname: lastname
			})
		
			console.log(`created: ${created}, updated: ${updated}`);
		
			logger.info(`Logging in user socially...`);
		
			return await loginSocialUserDone(user, done);
		}
	))
	
	router.get("/",
		passport.authenticate(name, authenticateArgs)
	);
	
	router.get("/callback",
		passport.authenticate(name, {
			failureRedirect: "/",
			 failureMessage: true
		}),
		(req, res, next) => {
			logger.info(`Logged in with ${name} successfully.`);
			
			req.session.user = req.session.passport.user
			req.session.save(() => {
				logger.info(`Session Saved: ${JSON.stringify(req.session)}`);
				logger.info(`User Session has been stored for user ${JSON.stringify(req.session.user)}`);

				if (!req.session.user.institution) {
					res.redirect("/institutional-onboarding");
				} else {
				res.redirect("/?dashboard=true&sl=success");
				}

			})
		}
	)

	return router;
}