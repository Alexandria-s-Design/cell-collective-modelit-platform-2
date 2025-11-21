'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('KineticReactants', {
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

    await queryInterface.addConstraint('KineticReactants', {
      fields: ['KineticReactionId'],
      type: 'foreign key',
      name: 'KineticReactants_KineticReactionId_fk',
      references: {
        table: 'KineticReactions',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('KineticReactants', {
      fields: ['KineticSpeciesId'],
      type: 'foreign key',
      name: 'KineticReactants_KineticSpeciesId_fk',
      references: {
        table: 'KineticSpecies',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('KineticReactants', 'KineticReactants_KineticReactionId_fk');
    await queryInterface.removeConstraint('KineticReactants', 'KineticReactants_KineticSpeciesId_fk');
    await queryInterface.dropTable('KineticReactants');
  }
};
