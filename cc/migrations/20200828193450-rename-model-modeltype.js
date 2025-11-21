'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.query("ALTER TABLE Model RENAME COLUMN \"modelType\" TO \"modeltype\"");
		await queryInterface.sequelize.query("UPDATE Model SET \"modeltype\"='boolean' WHERE \"modeltype\" IS NULL");
  },
  down: async (queryInterface) => {
		await queryInterface.sequelize.query("ALTER TABLE Model RENAME COLUMN \"modeltype\" TO \"modelType\"");
  }
};
