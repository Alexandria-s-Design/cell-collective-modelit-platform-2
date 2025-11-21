'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('KineticUnits', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      KineticModelId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'KineticModels',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      UnitDefinitionId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'UnitDefinitions',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
    });

    await queryInterface.addConstraint('KineticUnits', {
      fields: ['KineticModelId'],
      type: 'foreign key',
      name: 'KineticUnits_KineticModelId_fk',
      references: {
        table: 'KineticModels',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('KineticUnits', {
      fields: ['UnitDefinitionId'],
      type: 'foreign key',
      name: 'KineticUnits_UnitDefinitionId_fk',
      references: {
        table: 'UnitDefinitions',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('KineticUnits', 'KineticUnits_KineticModelId_fk');
    await queryInterface.removeConstraint('KineticUnits', 'KineticUnits_UnitDefinitionId_fk');
    await queryInterface.dropTable('KineticUnits');
  }
};
