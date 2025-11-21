'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
          queryInterface.addColumn(
              'learning_activity',
              'groupid',
              {
                type: Sequelize.INTEGER,
                allowNull: true,
              }
          ),
          queryInterface.createTable('learning_activity_groups', {
            id: {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: Sequelize.INTEGER
            },
            name: {
              type: Sequelize.STRING
            },
            position: {
              type: Sequelize.INTEGER
            },
            masterid: {
              type: Sequelize.BIGINT
            }
          })
    ])
  },
  down: (queryInterface) => {
    return Promise.all([
      queryInterface.removeColumn('learning_activity','groupid'),
      queryInterface.dropTable('learning_activity_groups')
    ]);
  }
};
