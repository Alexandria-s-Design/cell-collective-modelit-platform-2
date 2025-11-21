'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('KineticProducts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      KineticReactionId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'KineticReactions',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      KineticSpeciesId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'KineticSpecies',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
    });

    await queryInterface.addConstraint('KineticProducts', {
      fields: ['KineticReactionId'],
      type: 'foreign key',
      name: 'KineticProducts_KineticReactionId_fk',
      references: {
        table: 'KineticReactions',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('KineticProducts', {
      fields: ['KineticSpeciesId'],
      type: 'foreign key',
      name: 'KineticProducts_KineticSpeciesId_fk',
      references: {
        table: 'KineticSpecies',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('KineticProducts', 'KineticProducts_KineticReactionId_fk');
    await queryInterface.removeConstraint('KineticProducts', 'KineticProducts_KineticSpeciesId_fk');
    await queryInterface.dropTable('KineticProducts');
  }
};
