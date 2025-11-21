import { createAttributes } from "../db/mixins/attributes";
'use strict';

/**
 * This table represents all started lesson
 */
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ModelStartedLesson', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.BIGINT
			},
			modelId: {
				allowNull: true,
        type: Sequelize.BIGINT,
        references: {
          model: 'model',
          key: 'id'
        }
      },
      courseId: {
				allowNull: true,
        type: Sequelize.BIGINT,
        references: {
          model: 'Courses',
          key: 'id'
        }
      },
			canceled: {
				allowNull: true,
        type: Sequelize.SMALLINT,
				defaultValue: 0
      },
			canceledMsg: {
				allowNull: true,
        type: Sequelize.STRING(200)
      },
			submitted: {
				allowNull: true,
        type: Sequelize.BOOLEAN,
				defaultValue: false
      },
			submittedAt: {
				allowNull: true,
        type: Sequelize.DATE
      },
			...createAttributes(Sequelize)
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('ModelStartedLesson');
  }
};