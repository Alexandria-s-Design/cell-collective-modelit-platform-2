'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('KineticReactants', 'stoichiometry', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
		await queryInterface.addColumn('KineticProducts', 'stoichiometry', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('KineticProducts', 'stoichiometry');
    await queryInterface.removeColumn('KineticReactants', 'stoichiometry');
  }
};
