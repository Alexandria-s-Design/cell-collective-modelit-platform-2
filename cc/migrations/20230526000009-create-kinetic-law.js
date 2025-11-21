'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('KineticLaws', {
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
      formula: {
        type: Sequelize.STRING
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
      KineticLawTypeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'KineticLawTypes',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    });

    await queryInterface.addConstraint('KineticLaws', {
      fields: ['KineticReactionId'],
      type: 'foreign key',
      name: 'KineticLaws_KineticReactionId_fk',
      references: {
        table: 'KineticReactions',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('KineticLaws', {
      fields: ['KineticLawTypeId'],
      type: 'foreign key',
      name: 'KineticLaws_KineticLawTypeId_fk',
      references: {
        table: 'KineticLawTypes',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('KineticLaws', 'KineticLaws_KineticReactionId_fk');
    await queryInterface.removeConstraint('KineticLaws', 'KineticLaws_KineticLawTypeId_fk');
    await queryInterface.dropTable('KineticLaws');
  }
};
