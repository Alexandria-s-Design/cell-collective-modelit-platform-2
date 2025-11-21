'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('KineticSpecies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      species_id: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      _createdBy: {
        type: Sequelize.INTEGER
      },
      _createdAt: {
        type: Sequelize.DATE
      },
      _updatedBy: {
        type: Sequelize.INTEGER
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
      initial_concentration: {
        type: Sequelize.FLOAT
      },
      KineticCompartmentId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'KineticCompartments',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      KineticModelId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'KineticModels',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
    });

    await queryInterface.addConstraint('KineticSpecies', {
      fields: ['KineticCompartmentId'],
      type: 'foreign key',
      name: 'KineticSpecies_KineticCompartmentId_fk',
      references: {
        table: 'KineticCompartments',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('KineticSpecies', {
      fields: ['KineticModelId'],
      type: 'foreign key',
      name: 'KineticSpecies_KineticModelId_fk',
      references: {
        table: 'KineticModels',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('KineticSpecies', 'KineticSpecies_KineticCompartmentId_fk');
    await queryInterface.removeConstraint('KineticSpecies', 'KineticSpecies_KineticModelId_fk');
    await queryInterface.dropTable('KineticSpecies');
  }
};
