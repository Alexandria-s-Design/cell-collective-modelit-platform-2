import { createAttributes } from "../db/mixins/attributes";

'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable('AccountPlans', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING
        },
        length: {
          type: Sequelize.STRING
        },
        cost: {
          type: Sequelize.INTEGER
        },
        permissions: {
          type: Sequelize.JSON
        },
        ...createAttributes(Sequelize)
      }),

      queryInterface.createTable('logs', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        type: {
          type: Sequelize.STRING
        },
        action: {
          type: Sequelize.STRING
        },
        transaction_uuid: {
          type: Sequelize.STRING
        },
        message: {
          type: Sequelize.JSON
        },
        ...createAttributes(Sequelize)
      }),

    ])
  },
  down: (queryInterface) => {
    return Promise.all([
      queryInterface.dropTable('AccountPlans', {
				cascade: true
			}),
      queryInterface.dropTable('logs'),
      queryInterface.dropTable('rulesarray')
    ]);
  }
};
