'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('cached_scores', 'objective', {
			type: Sequelize.DataTypes.BIGINT,
			allowNull: true
		});
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('cached_scores', 'objective');
  }
};
