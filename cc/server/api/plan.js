import { Router } from 'express';

import ResourceFactory from "./factory/rest/resource";
import models from '../../models';
import { AuthRequired } from "../middlewares/auth";
import { createDefaultAttributes } from '../../db/mixins/attributes';
import DbLogger from '../dblogger';

import Response from "../response";
import stripe from "../../integrations/stripe";
import logger from '../../logger';
import { resourceLimits } from 'worker_threads';
import sequelize, { INTEGER, Op } from "sequelize";


async function userSubscriptionEnrty(planId,CURRENTDATE, FUTUREDATE, INITIAL_STATUS,masterSubId, userId, termOrder,logger, req){
	const planToSave = {
		...createDefaultAttributes(models, req.user),
		AccountPlanId: planId,
		startDateTime: CURRENTDATE,
		endDateTime: FUTUREDATE,
		status:INITIAL_STATUS,
		prevSubscriptionId:null,
		masterSubId: masterSubId,
		userId: userId,
		termOrder: termOrder
};

	try{
		return await models.UserSubscription.create(planToSave).then(result => {
			dbloggerSaveAction(planToSave, logger);
		return result;
	});
	
	}catch(e){
		console.log("Error whle saving user Subscription= " + e);
		await logger.log({
			action: DbLogger.ACTIONS.PAYMENTS.SAVE_ERROR, 
			data: {
					data: planToSave,
					msg: e+""
			}
	});
	}
	}

	async function dbloggerSaveAction(planToSave, logger){
		try{
			await logger.log({
				action: DbLogger.ACTIONS.PAYMENTS.SAVE_SUCCESS, 
				data: planToSave
		});
	
		}
		catch(e){
			console.log("Error = " + e);
		}
	}
	

	async function renewalItemEntry(userSubscriptionId,planId, RENEWALDATE, INITIAL_STATUS, retryCount, isError, errorDesc, masterSubId, req){
		try{
				const planRenewalItemToSave = {
					...createDefaultAttributes(models, req.user),
					subscriptionId: userSubscriptionId,
					accountPlanId: planId,
					renewalDateTime: RENEWALDATE,								
					status: INITIAL_STATUS,
					retryCount: retryCount,
					isError: isError,
					errorDesc: errorDesc,
					masterSubId: masterSubId
			};
			
			return await models.RenewalItem.create(planRenewalItemToSave).then(result =>{
				return result;
			});	
	
		}catch(e){
			console.log("Error = " + e);
		}
	
	}


async function userEcommerceDataEntry(userId, customerId, masterSubId, req){
	try{
		const planUserEcommerceToSave = {
			...createDefaultAttributes(models, req.user),
			userId: userId,
			customerId: customerId,								
			cardHolderName:'',
			expirationMonth:0,
			expirationYear:0,
			country:'',
			state:'',
			city:'',
			pincode:0,
			masterSubId: masterSubId,
	};
	const muserEcommerce = await models.UserEcommerce.create(planUserEcommerceToSave);	

	}catch(e){
		console.log("Error = " + e);
	}
}


async function checkIfUserAlreadyExists(userId){
	try{
return await models.UserSubscription.findAll({
	where: {
		userId : {
			[Op.eq]: userId
		},
	},
}).then(result => {
	return result;
})
	}catch(e){
console.log("Error = " + e);
	}
	
}

async function findUserOnMasterSubId(uniqueNumber){
	try{
		await models.UserSubscription.findAll({
			where: {
				masterSubId : {
					[Op.eq]: uniqueNumber
				},
			},
		}).then(result => {
			 if(result){
				 return true;
			 }
			 else{
				 return false;
			 }
		})
	}catch(e){
		console.log("Error = " + e);
			}

}

async function stripeCharges (amount, currency, customerId){
	try{
		// Charge the Customer instead of the card:
		return await stripe.charges.create({
			amount: amount,
			currency: currency,
			customer: customerId,
		}).then(result =>{
			return result;
		});

}catch(e){
	console.log("Error in stripeCharges = " + e);

	throw e;
}
}


async function entryInLog(charge, logger){
	try{
		await logger.log({
			action: DbLogger.ACTIONS.PAYMENTS.STRIPE_SUCCESS, 
			data: charge
	});
	}catch(e){
		console.log("Error in entryInLog = " + e);
		await logger.log({
			action: DbLogger.ACTIONS.PAYMENTS.STRIPE_ERROR, 
			data: e+""
	});
	throw e;
	}

}





const router = new Router();
	router.post("/subscribe", AuthRequired, async (req, res) => {

    const response = new Response();

		const { token, bpPlanName, csPlanName , pdPlanName, usaPlanName, studentCount, sum } = req.body;

		const domain = req;

		let bpPlanId = ''
		let csPlanId = ''
		let pdPlanId = ''
		let usaPlanId = ''
		let bpPlanLength=''
		let csPlanLength=''
		let usaPlanLength='';
		let pdPlanLength='';
		let masterSubId = '';

		let INITIAL_STATUS = 'Active';

		let termOrder = 1; 

		let CURRENTDATE = new Date();

		const bpCondition 			= { name: bpPlanName };
		const bpPlan 	= await models.AccountPlans.findAll({ where: bpCondition });
		if(bpPlan != '' && bpPlan != 'undefined'){
			bpPlanId = bpPlan[0].dataValues.id;
			if(bpPlan[0].dataValues.length != ''){
				bpPlanLength = Number(bpPlan[0].dataValues.length);
			}
		}

		const csCondition 			= { name: csPlanName };
		const csPlan 	= await models.AccountPlans.findAll({ where: csCondition });
		if(csPlan != '' && csPlan != 'undefined'){
			csPlanId = csPlan[0].dataValues.id;
			if(csPlan[0].dataValues.length != ''){
				csPlanLength = Number(csPlan[0].dataValues.length);
			}
		}
	
		const pdCondition 			= { name: pdPlanName };
		const pdPlan 	= await models.AccountPlans.findAll({ where: pdCondition });
		if(pdPlan != '' && pdPlan != 'undefined'){
			pdPlanId = pdPlan[0].dataValues.id;

			if(pdPlan[0].dataValues.length != ''){
				pdPlanLength = Number(pdPlan[0].dataValues.length);
			}
		}

		const usaCondition 			= { name: usaPlanName };
		const usaPlan 	= await models.AccountPlans.findAll({ where: usaCondition });
		if(usaPlan != '' && usaPlan != 'undefined'){
			usaPlanId = usaPlan[0].dataValues.id;			
			if(usaPlan[0].dataValues.length != ''){
				usaPlanLength = Number(usaPlan[0].dataValues.length);
			}
		}

    if(bpPlan || csPlan ||pdPlan || usaPlan){		
        const logger = DbLogger.getTransaction(
            {
                type: DbLogger.TYPES.PAYMENTS,
                user: req.user
            }
        );
        const amount = sum;

        // Ideally, currency should be retrieved by the user...
        const body = { source: token.id, amount, currency: "usd"};
        try {
            await logger.log({action: DbLogger.ACTIONS.PAYMENTS.SEND, data: body});
						// Create a Customer:
						const customer = await stripe.customers.create({
							source:  token.id,
							email: token.email,
						});

						let userId = Number(req.user.id);
						let customerId = customer.id;

						// checking if there exist a masterSubId for a user in UserSubscription Table
						//if exists use that mastersubId for further transactions else create new masterSubId

						checkIfUserAlreadyExists(userId).then(data =>{
							let uSubscription =data;
							if((uSubscription != '') && (uSubscription != 'undefined')){
								if(uSubscription != ''){
									try{
										let oneUserSubscription = uSubscription[0].dataValues;
										masterSubId = oneUserSubscription.masterSubId;
									}catch(e){
										console.log("Error inside if condition e =" + e);
									}
							
								}

							}
							else{
								let uniqueNumber = '';
								let  uSubscript = 0;
								//checking if random Id is duplicate
								while(uSubscript == 0){
									uniqueNumber = Math.floor(100000 + Math.random() * 900000);
									findUserOnMasterSubId(uniqueNumber).then(data => {
										uSubscript = data;
									})
									if(uSubscript == false){
										break;
									}
								}
								masterSubId = uniqueNumber;
							}
							userEcommerceDataEntry(userId, customerId, masterSubId, req);	
							stripeCharges(amount, 'usd', customer.id).then(data => {
								let charge = data;
								entryInLog(charge, logger)
							})

// Inserting basic premium plan in UserSupbscription table
try{
	if(bpPlanId != '' && bpPlanId != 'undefined'){
		let FUTUREDATE = null;
		if(bpPlanLength != '' && bpPlanLength != 'undefined'){
			FUTUREDATE = new Date();
			FUTUREDATE.setDate(CURRENTDATE.getDate() + bpPlanLength); 
			FUTUREDATE.setHours(23,59,59,999);
		}

		userSubscriptionEnrty(bpPlanId,CURRENTDATE, FUTUREDATE, INITIAL_STATUS, masterSubId, userId, termOrder,logger,  req).then(data => {
			
			let mUserSubscription = data;
			// if(mUserSubscription != 'undefined' || mUserSubscription != ''){
			let userSubscriptionId = mUserSubscription.id;
			// }
			let RENEWALDATE=FUTUREDATE;
			RENEWALDATE.setDate(FUTUREDATE.getDate() + 1);
			RENEWALDATE.setHours(0,0,0,1);
			renewalItemEntry(userSubscriptionId,bpPlanId, RENEWALDATE, INITIAL_STATUS, 0, false, '', masterSubId, req).then(data => {
			let mRenewalItem = data;
			// userEcommerceDataEntry(userId, userSubscriptionId, customerId, masterSubId, req);			
			});
		})
	}				

}
catch(e){                
	console.log("Error e = "+ e);
	throw e;
}
						// Inserting Customer Support plan in UserSupbscription table
						try{
							if(csPlanId != '' && csPlanId != 'undefined'){
								
								let FUTUREDATE = null;
								if(csPlanLength != '' && csPlanLength != 'undefined'){
								  FUTUREDATE = new Date();
									FUTUREDATE.setDate(CURRENTDATE.getDate() + csPlanLength); 
									FUTUREDATE.setHours(23,59,59,999);
								}

								userSubscriptionEnrty(csPlanId,CURRENTDATE, FUTUREDATE, INITIAL_STATUS, masterSubId, userId, termOrder,logger,  req).then(data => {
									let mUserSubscription = data;
									let userSubscriptionId = mUserSubscription.id;

									let RENEWALDATE=FUTUREDATE;
									RENEWALDATE.setDate(FUTUREDATE.getDate() + 1);
									RENEWALDATE.setHours(0,0,0,1);
									renewalItemEntry(userSubscriptionId,csPlanId, RENEWALDATE, INITIAL_STATUS, 0, false, '', masterSubId, req).then(data => {
									let mRenewalItem = data;
									// userEcommerceDataEntry(userId, userSubscriptionId, customerId, masterSubId. req);			
									});
								})
							}
						}
						catch(e){                
							console.log("Error e = "+ e);
							throw e;
							}


					// Inserting professional development plan in UserSupbscription table
					try{
						if(pdPlanId != '' && pdPlanId != 'undefined'){

						userSubscriptionEnrty(pdPlanId,CURRENTDATE, null, INITIAL_STATUS, masterSubId, userId, termOrder,logger, req).then(data => {
							let mUserSubscription = data;
							let userSubscriptionId = mUserSubscription.id;		
							renewalItemEntry(userSubscriptionId,pdPlanId, null, INITIAL_STATUS, 0, false, '', masterSubId, req).then(data => {
							let mRenewalItem = data;
							// userEcommerceDataEntry(userId, userSubscriptionId, customerId, masterSubId, req);			
							});
						})

						}
					}
					catch(e){                
						console.log("Error e = "+ e);
						throw e;
						}
	// Inserting upgrade Student Account plan in UserSupbscription table
	try{
		if(usaPlanId != '' && usaPlanId != 'undefined'){

			let FUTUREDATE = null;
			if(usaPlanLength != '' && usaPlanLength != 'undefined'){
				FUTUREDATE = new Date();
				FUTUREDATE.setDate(CURRENTDATE.getDate() + usaPlanLength); 
				FUTUREDATE.setHours(23,59,59,999);
			}

			userSubscriptionEnrty(usaPlanId,CURRENTDATE, FUTUREDATE, INITIAL_STATUS, masterSubId, userId, termOrder,logger, req).then(data => {
				let mUserSubscription = data;
				let userSubscriptionId = mUserSubscription.id;		
				let RENEWALDATE=FUTUREDATE;
				RENEWALDATE.setDate(FUTUREDATE.getDate() + 1);
				RENEWALDATE.setHours(0,0,0,1);
				renewalItemEntry(userSubscriptionId,usaPlanId, RENEWALDATE, INITIAL_STATUS, 0, false, '', masterSubId, req).then(data => {
				let mRenewalItem = data;
				// userEcommerceDataEntry(userId, userSubscriptionId, customerId, masterSubId, req);			
				});
			})
		}
	}
	catch(e){                
		console.log("Error e = "+ e);
		throw e;
		}

						})

        } catch (e) {
            console.error(e);
            response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
        }

    }else{
        response.setError(Response.Error.INTERNAL_SERVER_ERROR, "plan does not exists");
    }

    res.status(response.code)
        .json(response.json);
});

export default ResourceFactory("AccountPlan", {
    middlewares: router,
    as: "plan"
});