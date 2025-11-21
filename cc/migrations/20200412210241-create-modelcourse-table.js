import { createAttributes } from "../db/mixins/attributes";
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ModelCourse', {
      CourseId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Courses',
          key: 'id'
        }
      },
      ModelId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'model',
          key: 'id'
        }
      },
			...createAttributes(Sequelize)
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('ModelCourse');
  }
};