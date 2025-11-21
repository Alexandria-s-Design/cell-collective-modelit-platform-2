'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('KineticLocalParams', {
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
      value: {
        type: Sequelize.FLOAT
      },
      KineticLawId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'KineticLaws',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    });

    await queryInterface.addConstraint('KineticLocalParams', {
      fields: ['KineticLawId'],
      type: 'foreign key',
      name: 'KineticLocalParams_KineticLawId_fk',
      references: {
        table: 'KineticLaws',
        field: 'id'
      },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('KineticLocalParams', 'KineticLocalParams_KineticLawId_fk');
    await queryInterface.dropTable('KineticLocalParams');
  }
};
