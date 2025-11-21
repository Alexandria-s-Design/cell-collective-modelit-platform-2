'use strict';

let FUTUREDATE = new Date();
FUTUREDATE.setDate(FUTUREDATE.getDate() + 365); 
FUTUREDATE.setHours(23,59,59,999);

module.exports = {
	up: async (queryInterface) => {
		const { sequelize } = queryInterface;		
		await sequelize.query(`SET search_path TO public`);
		await queryInterface.bulkInsert('UserSubscriptions', [
			{
				id: 11,
				AccountPlanId: 1,
				startDateTime: new Date(),
				endDateTime: FUTUREDATE,
				status: 'Active',
				masterSubId: 124053,
				userId: 7463,
				termOrder: 1,
				_createdBy: 7463,
				_updatedBy: 7463
			},

		], {
			individualHooks: true
		});

		await queryInterface.bulkInsert('UserEcommerces', [{
			id: 10,
			userId: 7463,
			masterSubId: 124053,
			customerId: 'cus_DShXo2Wf217QaX',
			cardHolderName: '',
			expirationMonth: 0,
			expirationYear:0,
			country: '',
			state: '',
			city: '',
			pincode: 0,
			_createdBy: 7463,
			_updatedBy: 7463
		},

		], {
			individualHooks: true
		});


		await queryInterface.bulkInsert('RenewalItems', [{
				id: 10,
				subscriptionId: 11,
				accountPlanId: 1,
				renewalDateTime: FUTUREDATE,
				masterSubId: 124053,
				status: 'Active',
				retryCount: 0,
				isError: false,
				errorDesc: '',
				_createdBy: 7463,
				_updatedBy: 7463,
			},

		], {
			individualHooks: true
		});

		return await true;
	},

	down: async (queryInterface, { Op }) => {
		const { sequelize } = queryInterface;
		await sequelize.query(`SET search_path TO public`);

		queryInterface.bulkDelete('UserSubscriptions', {
			id: {
				[Op.eq]: 11
			},
		});

		queryInterface.bulkDelete('UserEcommerces', {
			value_id: {
				[Op.eq]: 10
			},
		});


		queryInterface.bulkDelete('RenewalItems', {
			id: {
				[Op.eq]: 10
			},
		});

		return await true;
	}
};