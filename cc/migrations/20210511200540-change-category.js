'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Institutions', 'category', {
			type: Sequelize.DataTypes.STRING(25),
			allowNull: true
		});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Institutions', 'category', {
			type: Sequelize.DataTypes.BIGINT
		});
  }
};
