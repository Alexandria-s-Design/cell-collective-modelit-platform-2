'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('cached_scores', 'courseid', {
			type: Sequelize.DataTypes.BIGINT,
			allowNull: true
		});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('cached_scores', 'courseid');
  }
};
