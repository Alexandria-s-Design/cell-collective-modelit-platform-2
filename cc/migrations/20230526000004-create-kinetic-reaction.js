'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('KineticReactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reaction_id: {
        type: Sequelize.TEXT
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
      KineticModelId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'KineticModels',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
    });

    await queryInterface.addConstraint('KineticReactions', {
      fields: ['KineticModelId'],
      type: 'foreign key',
      name: 'KineticReactions_KineticModelId_fk',
      references: {
        table: 'KineticModels',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('KineticReactions', 'KineticReactions_KineticModelId_fk');
    await queryInterface.dropTable('KineticReactions');
  }
};
