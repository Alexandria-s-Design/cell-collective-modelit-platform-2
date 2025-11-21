'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Reactions','boundary', {
			type: Sequelize.ENUM('sinks','demands','exchanges'),
			allowNull: true
		})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Reactions','boundary')
  }
};
