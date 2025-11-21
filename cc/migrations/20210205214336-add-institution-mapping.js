'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
		await queryInterface.addColumn('profile', 'institution_id',
			{
				type: Sequelize.INTEGER,
				references: {
					model: 'Institutions',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'SET NULL',
				defaultValue: null//, after: 'can_maintain_system'
		});
		await queryInterface.addColumn('Institutions', 'state', {
			type: Sequelize.STRING(60)
		});
		await queryInterface.addColumn('Institutions', 'city', {
			type: Sequelize.STRING(60)
		});
		await queryInterface.addColumn('Institutions', 'country', {
			type: Sequelize.STRING(60)
		});
		await queryInterface.addColumn('Institutions', 'category', {
			type: Sequelize.STRING(25),
			allowNull: true
		});
		await queryInterface.changeColumn('Institutions', 'domains', {
			type: Sequelize.ARRAY(Sequelize.STRING),
			allowNull: true
		});
		await queryInterface.changeColumn('Institutions', 'websites', {
			type: Sequelize.ARRAY(Sequelize.STRING),
			allowNull: true
		});
	/*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
  },

  down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('profile', 'institution_id');
		await queryInterface.removeColumn('Institutions', 'state');
		await queryInterface.removeColumn('Institutions', 'city');
		await queryInterface.removeColumn('Institutions', 'country');
		await queryInterface.removeColumn('Institutions', 'category');
		await queryInterface.changeColumn('Institutions', 'domains', {
			type: Sequelize.ARRAY(Sequelize.STRING),
			allowNull: false
		});
		await queryInterface.changeColumn('Institutions', 'websites', {
			type: Sequelize.ARRAY(Sequelize.STRING),
			allowNull: false
		});
  }
};
