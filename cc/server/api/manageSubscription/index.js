import { Router } from 'express';
import Response from '../../response';
import { AuthRequired } from '../../middlewares/auth';
import models from '../../../models';

const router = Router();

let PRECANCELLED_STATUS = "PreCancelled";
router.get('/info', AuthRequired, async (req, res) => {
  const response = new Response();
	const customerSubscribedPlan = [];
	let hasUserSubscription = false;

	try{
		const { user_id: userId } = req.query;
		if (!userId) {
			throw new Error("Sorry, user was not defined!")
		}

		try{
			const userSubscriptonPlan = await models.UserSubscription.findAll({
				where: {
					userId: userId,
					status: "Active"
				}
			});

			if(userSubscriptonPlan && userSubscriptonPlan.length != 0){
				hasUserSubscription = true;
				for(let i = 0; i < userSubscriptonPlan.length; i++){
					let userSubscriptionId = userSubscriptonPlan[i].dataValues.id;
					let accountPlanId = userSubscriptonPlan[i].dataValues.AccountPlanId;
					let accountPlanLastDate = userSubscriptonPlan[i].dataValues.endDateTime;
					if(accountPlanLastDate !== "null" && accountPlanLastDate !== null){
						accountPlanLastDate = new Date(accountPlanLastDate).toISOString().split('T')[0];
					}
					try{
						const accountPlan		= await models.AccountPlans.findByPk(accountPlanId);
						if(accountPlan){
							let accountPlanName = accountPlan.dataValues.name;
								let obj={};
								obj["accountPlanId"] = accountPlanId;
								obj["userSubscriptionId"] = userSubscriptionId;

								obj["userSubscription"] = accountPlanName;
								obj["expireOn"] = accountPlanLastDate;
								customerSubscribedPlan.push(obj);
						}
						else{
							console.log("accountPlanName does not exists ");
						}
					}catch(e){
						throw new Error("Problem in fetching AccountPlan" + e);
					}
				}

			}else{
				console.log("userSubscriptonPlan does not exist" );
			}
		}
		catch(e){
			throw new Error("Error while fetching UserSubscription data")
		}

		const data = {
			hasUserSubscription: hasUserSubscription,
			customerSubscribedPlan: customerSubscribedPlan,
			userId
		}	
		response.data = data;
	} catch (e) {
    response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
  }

  res.status(response.code).json(response.json);
});

router.post('/cancel', AuthRequired, async (req, res) => {
  const response = new Response();
	try{
		const { userId, customerSubscribedPlan } = req.body;
		if (!userId) {
			throw new Error("Sorry, user was not defined!")
		}
		for(let i = 0; i < customerSubscribedPlan.length; i++){
			let subscriptionId = customerSubscribedPlan[i].userSubscriptionId;
			let accountPlanId = customerSubscribedPlan[i].accountPlanId;
			try{
					const userSubscriptonPlan  = await models.RenewalItem.update({
						status: PRECANCELLED_STATUS,
					}, {
						where: {
							subscriptionId: subscriptionId,
							accountPlanId: accountPlanId,
						}
					})
			}
			catch(e){
				console.log(e);
				response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
			}
			
		}	

		const data = {
			message: "Unsubscription done!"
		}	
		response.data = data;
	} catch (e) {
    response.setError(Response.Error.BAD_REQUEST, e.toString());
  }

  res.status(response.code).json(response.json);
});

export default router;
