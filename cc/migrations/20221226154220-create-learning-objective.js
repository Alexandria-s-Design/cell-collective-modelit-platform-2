'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('LearningObjective', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.BIGINT
			},
			versionId: {
				allowNull: false,
        type: Sequelize.BIGINT,
      },
			version: {
				allowNull: false,
        type: Sequelize.INTEGER
      },
			valueRefId: {
				allowNull: true,
        type: Sequelize.BIGINT,
				defaultValue: 0
      },
      valueId: {
				allowNull: true,
        type: Sequelize.BIGINT
      },
			_createdBy: {
				allowNull: true,
				type: Sequelize.BIGINT,
				references: {
          model: 'user',
          key: 'id'
        }
			},
			_createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: queryInterface.sequelize.fn('NOW')
			}
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('LearningObjective');
  }
};