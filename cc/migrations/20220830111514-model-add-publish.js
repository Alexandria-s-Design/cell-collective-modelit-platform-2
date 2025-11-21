'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('model', 'publishedAt', {
			type: Sequelize.DataTypes.DATE,
			allowNull: true
		});
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('model', 'publishedAt');
  }
};
