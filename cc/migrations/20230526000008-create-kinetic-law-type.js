'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('KineticLawTypes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
    });

    await queryInterface.addConstraint('KineticLawTypes', {
      fields: ['type'],
      type: 'unique',
      name: 'unique_KineticLawTypes_type'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('KineticLawTypes', 'unique_KineticLawTypes_type');
    await queryInterface.dropTable('KineticLawTypes');
  }
};
