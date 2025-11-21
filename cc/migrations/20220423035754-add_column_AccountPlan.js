'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('AccountPlans', 'studentRange', {
			type: Sequelize.DataTypes.INTEGER,
			allowNull: true
		});

		await queryInterface.addColumn('AccountPlans', 'noOfStudentAccount', {
			type: Sequelize.DataTypes.INTEGER,
			allowNull: true
		});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('AccountPlans', 'studentRange');
		await queryInterface.removeColumn('AccountPlans', 'noOfStudentAccount');


  }
};
