import { createAttributes } from "../db/mixins/attributes";
import { Seq } from "immutable";

'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.createTable('Courses', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
				title: {
					type: Sequelize.STRING(60),
					allowNull: false,
				},
				description: {
					type: Sequelize.STRING,
				},
				startDate: {
					type: Sequelize.DATE,
				},
				endDate: {
					type: Sequelize.DATE,
				},
				published: {
					type: Sequelize.BOOLEAN,
					default: false,
				},
        ...createAttributes(Sequelize)	
      })
    ])
  },
  down: (queryInterface) => {
    return Promise.all([
      queryInterface.dropTable('Courses')
    ]);
  }
};
