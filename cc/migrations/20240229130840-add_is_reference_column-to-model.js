'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('model', 'is_reference', {
      type: Sequelize.BOOLEAN,
      defaultValue: false, // You can change the default value as needed
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('model', 'is_reference');
  },
};
