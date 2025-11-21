'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('KineticLaws', 'formula', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('KineticLaws', 'formula', {
      type: Sequelize.STRING,
      allowNull: true, 
    });
  }
};
