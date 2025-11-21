import { createAttributes } from "../db/mixins/attributes";

'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('UserCoursesUnenroll', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.BIGINT
			},
			userId: {
				allowNull: false,
        type: Sequelize.BIGINT,
        references: {
          model: 'user',
          key: 'id'
        }
      },
      courseId: {
				allowNull: false,
        type: Sequelize.BIGINT,
        references: {
          model: 'Courses',
          key: 'id'
        }
      },
			...createAttributes(Sequelize)
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('UserCoursesUnenroll');
  }
};