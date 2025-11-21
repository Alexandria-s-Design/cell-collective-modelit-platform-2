'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
		await queryInterface.addColumn('Genes', 'position', {
			type: Sequelize.DataTypes.INTEGER,
			allowNull: true
		});
		await queryInterface.addColumn('species', 'position', {
			type: Sequelize.DataTypes.INTEGER,
			allowNull: true
		});
		await queryInterface.addColumn('regulator', 'position', {
			type: Sequelize.DataTypes.INTEGER,
			allowNull: true
		});		
  },

  down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('Genes', 'position');
		await queryInterface.removeColumn('species', 'position');
		await queryInterface.removeColumn('regulator', 'position');
  }
};
