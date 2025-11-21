'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('KineticGlobalParams', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      _createdBy: {
        type: Sequelize.INTEGER,
      },
      _createdAt: {
        type: Sequelize.DATE
      },
      _updatedBy: {
        type: Sequelize.INTEGER,
      },
      _updatedAt: {
        type: Sequelize.DATE
      },
      _deletedBy: {
        type: Sequelize.INTEGER
      },
      _deletedAt: {
        type: Sequelize.DATE
      },
      _deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      name: {
        type: Sequelize.STRING
      },
      parameter_id: {
        type: Sequelize.STRING,
      },
      value: {
        type: Sequelize.FLOAT
      },
      unit_definition_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'UnitDefinitions',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      KineticModelId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'KineticModels',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    });

    // Add foreign key constraint to KineticModelId
    await queryInterface.addConstraint('KineticGlobalParams', {
      fields: ['KineticModelId'],
      type: 'foreign key',
      name: 'KineticGlobalParams_KineticModelId_fk',
      references: {
        table: 'KineticModels',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });

    // Add foreign key constraint to unit_definition_id
    await queryInterface.addConstraint('KineticGlobalParams', {
      fields: ['unit_definition_id'],
      type: 'foreign key',
      name: 'KineticGlobalParams_unit_definition_id_fk',
      references: {
        table: 'UnitDefinitions',
        field: 'id'
      },
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('KineticGlobalParams', 'KineticGlobalParams_unit_definition_id_fk');
    await queryInterface.removeConstraint('KineticGlobalParams', 'KineticGlobalParams_KineticModelId_fk');
    await queryInterface.dropTable('KineticGlobalParams');
  }
};
