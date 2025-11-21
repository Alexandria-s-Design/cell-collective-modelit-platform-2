import { Router } from 'express';
import { Op } from 'sequelize';

import Response from '../response';
import { AuthRequired } from '../middlewares/auth';
import { excludeAttributes } from './factory/rest/util';
import qs from 'querystring';
import models from '../../models';
import AppService from '../../service/app';
import { validateEmail } from '../../util/validate/email';
import Subscription from './manageSubscription/Subscription';
import Account from './manageUser/Account';
import RegisterCCAppAccount from './manageUser/RegisterCCAppAccount';
import CCAppService from "../../service/ccapp";
import CCAppAccount from './manageUser/CCAppAccount';
import logger from "../../logger";

const router = Router();


//TODO: merge with /me
router.get('/me/profile', AuthRequired, async (req, res) => {
  const response = new Response();
	try{
		const data = (await AppService.requestWithToken(req).get('/user/getProfile', {
			// headers: {
			// 	'X-AUTH-TOKEN': auth_token,
			// },
		})).data;

		const userEntity = await models.Profile.findOne({
			where: {
				user_id: req.user.id
			}
		});
		if(!userEntity){
			throw new Error("User entity not found");
		}
		//get associated institution
		const institutionEntity = await userEntity.getInstitution();
		if(institutionEntity){
			data.institution = institutionEntity.name;
		}

		response.data = await patchUser(data);

	}catch(e){
    console.error(e);
    response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
  }

  res.status(response.code).json(response.json);
});

const patchUser = async (user) => {
	const profile = await models.Profile.findOne({ where: { user_id: user.id } });
	return { ...user, avatarUri: profile.avatarUri };
}

router.get("/me/session", AuthRequired, async (req, res) => {
	const response = new Response();

	if ( req.session ) {
		if ( req.session.passport && req.session.passport.user ) {
			response.data = await patchUser(req.session.passport.user);
		}
	} else {
		response.setError(Response.Error.UNPROCESSABLE_ENTITY, `Session not found.`);
	}

	res.status(response.code)
		 .json(response.json);
});	

const EXCLUDE_ATTRIBUTES = ['password', 'enabled', '_createdAt', '_updatedBy', '_updatedAt', '_deletedBy', '_deletedAt', '_deleted'];

router.get('/me/', AuthRequired, async (req, res) => {
  const response = new Response();

  try {
    const user = req.user;
    const data = excludeAttributes(user, attr => !EXCLUDE_ATTRIBUTES.includes(attr));

    data.subscription =
      (await models.UserSubscription.findAll({
        attributes: ['AccountPlanId', [models.Sequelize.fn('max', models.Sequelize.col('_updatedAt')), 'updatedAt']],
        group: ['UserSubscription.AccountPlanId'],
        where: {
          _createdBy: {
            [Op.eq]: user.id,
          },
        },
      })) || [];

    //
    /* To be added when commercialization features are ready
    const aclRules = {
            "rules": [
          {permission:"deny", feature:"model_view_ModelsView"},
          {permission:"deny", feature:"model_view_AccountUpgradeView"}
        ]
        }
    */

    // ToDo: add aclRules to data

    data.rules = {};
    response.data = data;
  } catch (e) {
    console.error(e);
    response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
  }

  res.status(response.code).json(response.json);
});


router.get('/subscribed', AuthRequired, async (req, res) => {
  const response = new Response();
  try {
    const subscriptions = await (new Subscription(models)).getSubscriptionByUser(req.user.id);
		response.data = { subscriptions, user: req.user.id };
  } catch (e) {
    response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
  }
  res.status(response.code).json(response.json);
});

router.post('/create', async (req, res) => {
  const response = new Response();

	let userId;
  try {
		const registerCCAppAccount =  new RegisterCCAppAccount(models);
		try{
			const {user_id} = await registerCCAppAccount.createAccount(req.body);
			userId = user_id;
		}catch(e){
			res.status(e.response.status).json(e.response.data);
			return;
		}

		if(req.body.institution){
			//find associated instution
			const userEntity = await models.Profile.findOne({
				where: {
					user_id: userId
				}
			});
			if(!userEntity){
				throw new Error("User entity not found");
			}
			//get associated institution
			const institutionEntity = await models.Institution.findOne({
				where: {
					name: req.body.institution
				}
			});
			if(institutionEntity){
				await userEntity.setInstitution(institutionEntity);
				userEntity.institution = "";
				await userEntity.save();
			}
		}

    response.data = userId;
  } catch (e) {
    response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
  }

  res.status(response.code).json(response.json);
});

router.post('/validate', async (req, res) => {
	const response = new Response();
	try {
		if (!req.body.email) {
			throw new Error("Email needs to be provided!")
		}
		const userProfile = await models.Profile.findOne({
			where: {
				email: req.body.email
			}
		});
		if (!userProfile) {
			response.data = {message: 'Validated'};
		} else {
			throw new Error("This email is already registered.");
		}
	} catch(error) {
		console.error(error);
    response.setError(Response.Error.BAD_REQUEST, error.message);
	}
	res.status(response.code).json(response.json);
})

router.post('/register', async (req, res) => {

	const response = new Response();

	try {
		let dataResp = {}
		if (!req.body.ccappUserId) {
			throw new Error("CCAPP UUID needs to be provided!")
		}
		if (!req.body.email) {
			throw new Error("Email needs to be provided!")
		}
		if (!req.body.firstName) {
			throw new Error("First name needs to be provided!")
		}
		const userProfile = await models.Profile.findOne({
			where: {
				email: req.body.email
			}
		});

		const registerCCAppAccount =  new RegisterCCAppAccount(models);
		if (userProfile) {
			logger.info(`The user ${req.body.email} already has an existing account.`);
			// dataResp = await registerCCAppAccount.updateAccount(userProfile.user_id, req.body, userProfile.id);
		} else {
			dataResp = await registerCCAppAccount.createAccount(req.body);
		}

		response.data = dataResp;
	} catch (e) {
		console.error(e);
    response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
	}

	res.status(response.code).json(response.json);
})

router.get('/', AuthRequired, async (req, res) => {
  const response = new Response();

  try {
    const {
      user,
      query: { belongToCourseId },
    } = req;
    const resource = await models.Course.findByPk(belongToCourseId, {
      include: {
        model: models.User,
        as: 'users',
        attributes: ['id'],
        through: { attributes: [] },
        include: {
          model: models.Profile,
          attributes: ['email', 'firstname', 'lastname', 'institution'],
        },
      },
    });
    if (!resource) {
      throw new Error(`course(${belongToCourseId}) does not exist`);
    }
    if (resource.get()._createdBy != user.id) {
      throw new Error(`Permission denied`);
    }
    response.data = resource.get().users.map(u => ({ id: u.get().id, ...u.get().profile.get() }));
  } catch (e) {
    console.error(e);
    response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
  }

  res.status(response.code).json(response.json);
});

router.post('/me', AuthRequired, async (req, res) => {
  const response = new Response();

  const missingParams = [];
	const invalidParams = [];

	if (!req.body.email) {
		missingParams.push("Email");
	}

	if (!req.body.firstName) {
		missingParams.push("First name");
	}

	if (!req.body.lastName) {
		missingParams.push("Last name");
	}

	if (!req.body.institution) {
		missingParams.push("Institution");
	}

	if (missingParams.length) {
		return res
			.status(Response.Error.PRECONDITION_FAILED.code)
			.json( 'Missing required parameters: '+missingParams.join(', ') );
	}

	if (!validateEmail(req.body.email)) {
		invalidParams.push("Email");
	}

	if (invalidParams.length) {
		return res
			.status(Response.Error.BAD_REQUEST.code)
			.json( 'Invalid parameters: '+invalidParams.join(', ') );
	}

  try {
		//find associated instution
		const userEntity = await models.Profile.findOne({
			where: {
				user_id: req.user.id
			}
		});
		if (!userEntity) {
			throw new Error("User entity not found");
		}
		//get associated institution
		const institutionEntity = await models.Institution.findOne({
			where: {
				name: req.body.institution
			}
		});

		if (institutionEntity) {
			userEntity.setInstitution(institutionEntity);
			req.body.institution = "";
			await userEntity.save();
		}

		await AppService.requestWithToken(req).post("/user/saveProfile", req.body);

    response.data = {success: true};
  } catch (e) {
    response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
  }

  res.status(response.code).json(response.json);
});

router.post('/reset', async (req, res) => {
  const response = new Response();
  try {
    if (!req.body.hasOwnProperty("email")) {
			throw "Email address not informed";
		}
		const profile = await (new Account(models)).getUserProfileByEmail(req.body.email);
		if (!profile) {
			throw `User with the email address "${req.body.email}" was not found.`;
		}
		if (!profile.enabled) {
			throw `User with the email address "${req.body.email}" is not enabled to this action.`;
		}
		const appResponse = await AppService.request.get(`/user/reset?email=${req.body.email}`);

		let newPassword = new String(appResponse.data);
		newPassword = newPassword.replace(" ", "");
		
		let resetResponse = {data:[]}
		const CCAppInstance = new CCAppAccount(models);
		if (CCAppInstance.getCCAppMigrationByUserId(profile.Profile.user_id)) {
			resetResponse = await CCAppService.request.post("/users/reset-password", {
				"secret": "IUr2WAaaFugM5yFn",
				"password": newPassword,
				"vpassword": newPassword,
				"email": req.body.email
			});
		}

		response.data = resetResponse.data
  } catch (e) {
		response.setError(Response.getErrorResponse(e));
  }
  res.status(response.code).json(response.json);
});

router.post('/me/updateInstitution', AuthRequired, async (req, res) => {
	const response = new Response();
	try {
		await AppService.requestWithToken(req).post("/user/saveProfile", {
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			institution: req.body.institution
		},  { headers: { "X-AUTH-TOKEN": req.user.token}});

		response.data = { success: true };
		
	} catch (e) {
		response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
	}

	res.status(response.code).json(response.json);
});


export default router;
