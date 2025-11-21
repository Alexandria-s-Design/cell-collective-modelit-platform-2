'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('LearningObjectiveAssocs', 'modelid', { type: Sequelize.DataTypes.BIGINT });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('LearningObjectiveAssocs', 'modelid');
  }
};
