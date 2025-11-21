'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('KineticModifiers', {
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
			type: {
        type: Sequelize.ENUM('activator', 'inhibitor'),
      },
    });

    await queryInterface.addConstraint('KineticModifiers', {
      fields: ['KineticReactionId'],
      type: 'foreign key',
      name: 'KineticModifiers_KineticReactionId_fk',
      references: {
        table: 'KineticReactions',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('KineticModifiers', {
      fields: ['KineticSpeciesId'],
      type: 'foreign key',
      name: 'KineticModifiers_KineticSpeciesId_fk',
      references: {
        table: 'KineticSpecies',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('KineticModifiers', 'KineticModifiers_KineticReactionId_fk');
    await queryInterface.removeConstraint('KineticModifiers', 'KineticModifiers_KineticSpeciesId_fk');
    await queryInterface.dropTable('KineticModifiers');
  }
};
