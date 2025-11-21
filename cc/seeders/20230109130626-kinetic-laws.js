'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
		await queryInterface.bulkInsert('KineticLawTypes', [{
			type: 'Unknown'
		}, {
			type: 'Constant Rate'
		}, {
			type: 'Linearized Rate Law'
		}, {
			type: 'Irreversible Mass-Action'
		}, {
			type: 'Reversible Mass-Action'
		}, {
			type: 'Modified Reversible Mass-Action'
		}, {
			type: 'Irreversible Michaelis-Menten'
		}, {
			type: 'Simple Enzyme Product Inhibition'
		}, {
			type: 'Competitive Inhibitor'
		}, {
			type: 'Non-Competitive Inhibition'
		}, {
			type: 'Uncompetitive Inhibition'
		}, {
			type: 'Uni-Uni Reversible Michaelis-Menten'
		}, {
			type: 'Reversible Haldane Michaelis-Menten'
		}, {
			type: 'Hill Equation'
		}, {
			type: 'Hill Equation using Half-Maximal Activity'
		}, {
			type: 'Simplified Irreversible MWC Model'
		}, {
			type: 'Irreversible MWC Model'
		}, {
			type: 'Irreversible MWC Model with Inhibition'
		}, {
			type: 'Irreversible MWC Model with Activation'
		}, {
			type: 'Reversible Hill Model'
		}, {
			type: 'Reversible Hill Model with Modifier'
		}, {
			type: 'Lin-Log Approximation'
		}])
  },

  async down (queryInterface, Sequelize) {
		await queryInterface.bulkDelete('KineticLawTypes', null, {});
  }
};
