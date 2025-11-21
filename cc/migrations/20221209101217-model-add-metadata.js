'use strict';
/**
 * Adding a column to identify a new rule for the model,
 * setting metadata to all versions from a single module.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('model', 'metadata', {
			type: Sequelize.BOOLEAN,
			allowNull: true,
			defaultValue: false
		});
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('model', 'metadata');
  }
};