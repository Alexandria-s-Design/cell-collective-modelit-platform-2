'use strict';

/**
 * This column helps identify the strategy mode for a record type.
 * We can use it to restore data after large inserts.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('ModelCourse', 'prevId', {
			type: Sequelize.DataTypes.BIGINT,
			allowNull: true,
		});
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('ModelCourse', 'prevId');
  }
};
