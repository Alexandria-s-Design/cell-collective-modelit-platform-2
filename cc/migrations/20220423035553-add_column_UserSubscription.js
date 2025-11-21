'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('UserSubscriptions', 'startDateTime', {
			type: Sequelize.DATE,
			allowNull: true
		});

		await queryInterface.addColumn('UserSubscriptions', 'endDateTime', {
			type: Sequelize.DATE,
			allowNull: true
		});

    await queryInterface.addColumn('UserSubscriptions', 'noOfStudentAccountPurchased', {
			type: Sequelize.INTEGER,
			allowNull: true
		});

		await queryInterface.addColumn('UserSubscriptions', 'status', {
			type: Sequelize.STRING,
			allowNull: true
		});

		await queryInterface.addColumn('UserSubscriptions', 'prevSubscriptionId', {
			type: Sequelize.INTEGER,
			allowNull: true
		});

		await queryInterface.addColumn('UserSubscriptions', 'masterSubId', {
			type: Sequelize.INTEGER,
			allowNull: true
		});

		await queryInterface.addColumn('UserSubscriptions', 'userId', {
			type: Sequelize.INTEGER,
			allowNull: true
		});

		await queryInterface.addColumn('UserSubscriptions', 'termOrder', {
			type: Sequelize.INTEGER,
			allowNull: true
		});


  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('UserSubscriptions', 'startDateTime');
		await queryInterface.removeColumn('UserSubscriptions', 'endDateTime');
		await queryInterface.removeColumn('UserSubscriptions', 'noOfStudentAccountPurchased');
		await queryInterface.removeColumn('UserSubscriptions', 'status');
		await queryInterface.removeColumn('UserSubscriptions', 'prevSubscriptionId');
		await queryInterface.removeColumn('UserSubscriptions', 'masterSubId');
		await queryInterface.removeColumn('UserSubscriptions', 'userId');
		await queryInterface.removeColumn('UserSubscriptions', 'termOrder');
  }
};
