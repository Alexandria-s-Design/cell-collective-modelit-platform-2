'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('SubSystems', 'ConstraintBasedModelId', {
			type: Sequelize.DataTypes.BIGINT,
			allowNull: true,
			references: {
				model: 'ConstraintBasedModels',
				key: 'id'
			}
		});
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('SubSystems', 'ConstraintBasedModelId');
  }
};
