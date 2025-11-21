'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('model', 'prevOrigin', {
			type: Sequelize.DataTypes.BIGINT,
			allowNull: true,
			references: {
				model: 'model',
				key: 'id'
			}
		});
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('model', 'prevOrigin');
  }
};
