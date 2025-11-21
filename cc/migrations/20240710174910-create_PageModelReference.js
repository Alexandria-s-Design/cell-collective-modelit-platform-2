'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
		const defaultAttrs = {
			creationdate: {
				type: Sequelize.DATE
			},
			creationuser: {
				type: Sequelize.BIGINT,
				allowNull: true
			},
			_deletedBy: {
        type: Sequelize.INTEGER
      },
      _deletedAt: {
        type: Sequelize.DATE
      },
			_deleted: {
				type: Sequelize.BOOLEAN,
				defaultValue: false
			}
		};

		await queryInterface.createTable('PageModelReference', {
			id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
			pageModelId: {
        allowNull: false,
        type: Sequelize.BIGINT,
				references: {
					model: 'PageModel',
					key: 'id'
				}
      },
			referenceId: {
        allowNull: false,
        type: Sequelize.BIGINT,
				references: {
					model: 'reference',
					key: 'id'
				}
      },
			...defaultAttrs
		});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
		await queryInterface.dropTable('PageModelReference');
  }
};
