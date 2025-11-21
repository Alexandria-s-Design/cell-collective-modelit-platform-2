import logger from '../../logger';
import models from '../../models'
import { Op } from "sequelize";
const schedule = require('node-schedule');
import stripe from "../../integrations/stripe";

async function getRenewableSubscription(STATUS){
	try{
	let CURRENTDATE1 = new Date();
	let CURRENTDATE2 = new Date();
	CURRENTDATE1.setHours(0,0,0);
//get list from RenewalItem table whose previous subcription is about to end
	return await models.RenewalItem.findAll({
		where: {
			status: [STATUS],
			renewalDateTime: {
				[Op.lte]: CURRENTDATE2,
			},
			retryCount: {
				[Op.lt]: 5
			},
			isError:{
				[Op.or]:{
					[Op.eq]: false,
					[Op.eq]: null,
					[Op.eq]: 'f'
				}
			}
		},
	}).then(result => {
		return result;
	});
	}catch(e){
		logger.info("Error in getRenewableSubscription() = " + e);
	}
}

async function getUserSubscriptionToBeRenewed(currentSubscriptId,STATUS){
	try{
			return await models.UserSubscription.findAll({
				where: {
					id: {
						[Op.eq]: currentSubscriptId
					},
					status: {
						[Op.eq]: STATUS
					},
				},
			}).then(result => {
				return result;
			});
	}catch(e){
		logger.info("Error in getUserSubscriptionToBeRenewed() = " + e);
	}
}

async function insertNewSubscription(userPlanRenewal){
	try{
		return await models.UserSubscription.create(userPlanRenewal).then(result => {
			return result;
		});	
	
	}
	catch(err){
		logger.info("Error in insertNewSubscription() ==== " + err);
	}
}
async function updateRenewalItem(currentSubscriptId, newUid,FUTURERENEWALDATETIME, RCount){
	try{
		return await models.RenewalItem.update({ subscriptionId: newUid, 
			renewalDateTime: FUTURERENEWALDATETIME,
			retryCount: RCount
		},
		{
			where: {
			subscriptionId: currentSubscriptId,
			}
		}).then(result =>{
			return result;
		});
		
	}catch(e){
		logger.info("Error in updateRenewalItem() = " + e);
	}
	}
	async function updateCurrentUserSubcription(oldSubId, EXPIRED_STATUS){
		try{
			return await models.UserSubscription.update({ status: EXPIRED_STATUS},
				{
					where: {
						id: oldSubId
					}
				}).then( result =>{
					return result;
				}
				);
		}catch(e){
			logger.info("Error in updateCurrentUserSubcription()= " + e);
		}
	}

	async function updateRenewalItemStatus(renewalItemId, STATUS){
		try{
			return await models.RenewalItem.update({ status: STATUS, 
			},
			{
				where: {
				id: renewalItemId,
				}
			}).then(result =>{
				return result;
			});
		}catch(e){
			logger.info("Error in updateRenewalItemStatus()= " + e);
		}
		}

	async function cancellationOfSubcription(userId, AccountPlanId, ACTIVE_STATUS, PRECANCELLED_STATUS){
		try{
			await models.RenewalItem.update({ status: PRECANCELLED_STATUS, 
			},	
			{
				where: {
				_createdBy: userId,
				accountPlanId : AccountPlanId,
				status: ACTIVE_STATUS,
				}
			}).then(result =>{
				return result;
			});
		}catch(e){
			logger.info("Error in cancellationOfSubcription()= " + e);
		}
		}

	async function chargeCustomer(customerId, amount, currency){
		try{
			return await stripe.charges.create({
				amount: amount, 
				currency: currency,
				customer: customerId, // Previously stored, then retrieved
				}).then(result =>{
					return result;
				});
		}catch(e){
			logger.info("Error in chargeCustomer() = " + e);
		}	
	}	


	async function getUserEcommerce(masterSubId){
		try{
			return await models.UserEcommerce.findOne({
				where: {
					masterSubId: {
						[Op.eq]: masterSubId
					},
				},
			}).then(result => {
				return result;
			});
		}catch(e){
			logger.info("Error in getUserEcommerce() = " + e);
		}
	}



async function renewSubscription(){
	try{
		let ACTIVE_STATUS = 'Active';
		let EXPIRED_STATUS = "Expired";
		let PRECANCELLED_STATUS = "PreCancelled";
		let CANCELLED_STATUS = "Cancelled"
		let currency= 'usd';
		const mAccountPlanList	= await models.AccountPlans.findAll();
		// get list of all renewable items from RenewalItems Table whose renewaldate is less than currentdate 
		getRenewableSubscription(ACTIVE_STATUS).then(data => {
			let mRenewalItemList = data;
			for ( let i= 0; i < mRenewalItemList.length; i++ ) {
				if((mRenewalItemList[i].dataValues != '') || (mRenewalItemList[i].dataValues != 'undefined')){
					const renewalItem = mRenewalItemList[i].dataValues;
							try{
								let renewalPlanLength = 0;
								let createdBy = '';
								let updatedBy = '';
								let oldSubId='';
								let planAmount = 0;
	
								for(let j= 0; j < mAccountPlanList.length; j++){
									if((mAccountPlanList[j].dataValues != '') || (mAccountPlanList[j].dataValues != 'undefined')){
										const accountPlan = mAccountPlanList[j].dataValues;
										if(renewalItem.accountPlanId === accountPlan.id){
											renewalPlanLength = Number(accountPlan.length);
											planAmount = accountPlan.cost;
											break;			
										}
									}
								}

								let renewalAccountPlanId = renewalItem.accountPlanId;
								let FUTURESTARTDATE = renewalItem.renewalDateTime;
								let currentSubscriptId = renewalItem.subscriptionId;
								let masterSubId = renewalItem.masterSubId;		
								if(currentSubscriptId != '' || currentSubscriptId != 'undefined'){
									getUserEcommerce(masterSubId).then(data => {
										let userEcommerce = data;
										if(userEcommerce != 'undefined'){
											let userEcommerceId = userEcommerce.id;
											let customerId = userEcommerce.customerId;
	
											// When it's time to charge the customer again, retrieve the customer ID.
											chargeCustomer(customerId, planAmount, currency).then(data => {
													let charge = data;

											// If the user is charged successfully, then process the following
											if(charge != 'undefined'){

											 	//gets UserSubscription's table list whose id eq renewalItems table's subscriptionId
													getUserSubscriptionToBeRenewed(currentSubscriptId,ACTIVE_STATUS).then(data => {
														let oldSubcriptionList = data;
															if(oldSubcriptionList && oldSubcriptionList[0] != '' && oldSubcriptionList[0] != 'undefined'){
																const userSubcriptionDetail = oldSubcriptionList[0].dataValues;
																createdBy = userSubcriptionDetail._createdBy;
																updatedBy = userSubcriptionDetail._updatedBy;
																oldSubId = userSubcriptionDetail.id;
																let userId = userSubcriptionDetail.userId;
																let masterSubId = userSubcriptionDetail.masterSubId;
																let termOrder = Number(userSubcriptionDetail.termOrder);
																termOrder = termOrder + 1; 
					
																	if(renewalPlanLength != 0 && renewalPlanLength != 'undefined'){
																			let	FUTUREENDDATE = new Date(FUTURESTARTDATE);
																			FUTUREENDDATE.setDate(FUTURESTARTDATE.getDate() + renewalPlanLength); 
																			FUTUREENDDATE.setHours(23,59,59,999);
									
																			const userPlanRenewal = {
																				AccountPlanId: renewalAccountPlanId,
																				startDateTime: FUTURESTARTDATE,
																				endDateTime: FUTUREENDDATE,
																				status: ACTIVE_STATUS,
																				prevSubscriptionId: currentSubscriptId,
																				masterSubId: masterSubId,
																				termOrder: termOrder,
																				userId: userId,
																				_createdBy: createdBy,
																				_updatedBy: updatedBy
																		};
					
																		//Insert new row in userSubcription with endDatetime = adding renewalDateTime(RenewalItem Table) and length(AccountPlan Table) i.e no of subscriptionPlan days
																		insertNewSubscription(userPlanRenewal).then(data => {
																			let newUserSubcription = data;
																			if(data != 'undefined'){
																				let newUid = data.id;
																				if(newUid != '' || newUid!= null){
																					let FUTURERENEWALDATETIME = new Date(FUTUREENDDATE);
																					FUTURERENEWALDATETIME.setDate(FUTURERENEWALDATETIME.getDate() + 1);
																					let retryCount = 0;
																					// updates renewalItem Table with new SubscriptionId, renewalDateTime = adding 1 day to the newly inserted UserSubcription's endDateTime
																					updateRenewalItem(currentSubscriptId, newUid,FUTURERENEWALDATETIME, retryCount).then(data =>{
																						
																						// update current(old) UserSubcription with status as Expired
																						updateCurrentUserSubcription(oldSubId, EXPIRED_STATUS).then(data =>{
																							logger.info("updated Current UserSubcription with status as Expired");
																						});
																					})
																				}
																			}
																		})
																	}
															}
													});
											}
							});
						}
					});
				}
				}
				catch(e){
					logger.info("Error in renewSubscription()  for loop = " + e);
				}
				}
				}
			});
	
			// gets list from RenewalItems Table whose status is precancelled and renewalItemDate is before currentDate
			getRenewableSubscription(PRECANCELLED_STATUS).then(data => {
			let mpreCancelledItemList = data;
			for (let i= 0; i < mpreCancelledItemList.length; i++ ) {
				if((mpreCancelledItemList[i].dataValues != '') || (mpreCancelledItemList[i].dataValues != 'undefined')){
					const preCancelledItem = mpreCancelledItemList[i].dataValues;		
							try{
								let preCancelledSubscriptId = preCancelledItem.subscriptionId;
								let renewalItemId = preCancelledItem.id;
								if(preCancelledSubscriptId != '' || preCancelledSubscriptId != 'undefined'){
									//gets list from UserSubscription's table whose id eq preCancelledItem from RenewalItems table's subscriptionId
	
									//update UserSubcription status as Expired
									updateCurrentUserSubcription(preCancelledSubscriptId, EXPIRED_STATUS).then(data =>{
										logger.info("Updated User Subscription Item status as Expired data = " + data);
	
										//update RenewalItems status as Cancelled
										updateRenewalItemStatus(renewalItemId, CANCELLED_STATUS).then(data =>{
											logger.info("Updated Renewal Item status as Cancelled data == " + data);
										})
									})
								}
							}
							catch(e){
								logger.info("Error in getRenewableSubscription(PRE CANCELLED) = " + e);
							}	
				}
			}
		});
	}catch(e){
		logger.info("Error in renewSubscription() = " + e);
	}
}


export default async (job, done) => {
	// renewal job will run at every 5 minutes
schedule.scheduleJob('5 * * * * *', ()=>{
	const d = new Date();
	let minutes = d.getMinutes(); 
	  renewSubscription();
		done()
	});
}
