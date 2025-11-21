'use strict';

module.exports = {
  up: (queryInterface) => {
   return queryInterface.bulkInsert('AccountPlans', [{
     name: 'PremiumPlan1',
     length: '365',
     cost: 59,
		 permissions : '1'
   },
	 {
		name: 'PremiumPlan2',
		length: '365',
		cost: 59,
		permissions : '2'
	},

	 {
		name: 'CustomerSupportPlan1',
		length: '365',
		cost: 50,
		studentRange: 9,
		permissions : '1'
	},
	{
		name: 'CustomerSupportPlan2',
		length: '365',
		cost: 75,
		studentRange: 39,
		permissions : '1'
	},

	{
		name: 'CustomerSupportPlan3',
		length: '365',
		cost: 150,
		studentRange: 79,
		permissions : '1'
	},

	{
		name: 'CustomerSupportPlan4',
		length: '365',
		cost: 300,
		studentRange: 80,
		permissions : '1'
	},

	{
		name: 'ProfessionalDevelopmentPlan',
		length: '',
		cost: 499,
		permissions : '1'
	},

	{
		name: 'UpgradeStudentAccountPlan',
		length: '180',
		cost: 59,
		permissions : '1',
		noOfStudentAccount: 1
	},


  ], {
     individualHooks: true
   });
  },

  down: (queryInterface) => {
   return queryInterface.bulkDelete('AccountPlans', null, {});
  }
};
