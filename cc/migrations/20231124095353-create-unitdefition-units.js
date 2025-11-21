'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UnitDefinition_Units', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      UnitId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Units',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
    });

    await queryInterface.addConstraint('UnitDefinition_Units', {
      fields: ['UnitDefinitionId'],
      type: 'foreign key',
      name: 'UnitDefinition_Units_UnitDefinitionId_fk',
      references: {
        table: 'UnitDefinitions',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
	
    await queryInterface.addConstraint('UnitDefinition_Units', {
      fields: ['UnitId'],
      type: 'foreign key',
      name: 'UnitDefinition_Units_UnitId_fk',
      references: {
        table: 'Units',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('UnitDefinition_Units', 'UnitDefinition_Units_UnitDefinitionId_fk');
    await queryInterface.removeConstraint('UnitDefinition_Units', 'UnitDefinition_Units_UnitId_fk');
    await queryInterface.dropTable('UnitDefinition_Units');
  }
};
