'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('KineticCompartments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.TEXT
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
      size: {
        type: Sequelize.FLOAT
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

    await queryInterface.addConstraint('KineticCompartments', {
      fields: ['KineticModelId'],
      type: 'foreign key',
      name: 'KineticCompartments_KineticModelId_fk',
      references: {
        table: 'KineticModels',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('KineticCompartments', 'KineticCompartments_KineticModelId_fk');
    await queryInterface.dropTable('KineticCompartments');
  }
};
