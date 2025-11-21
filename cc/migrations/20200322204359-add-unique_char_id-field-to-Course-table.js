'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async transaction => {
			await queryInterface.addColumn('Courses', 'codeKey', {
				type: Sequelize.STRING(60),
				unique: true,
			});
      await queryInterface.addIndex('Courses', ['codeKey'], {
				indexName: 'Courses_codekey_idx',
				indicesType: 'UNIQUE',
			});
		});
  },
  down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction(async transaction => {
			await queryInterface.removeIndex('Courses', ['codeKey']);
			await queryInterface.removeColumn('Courses', 'codeKey');
		});
  },
};

