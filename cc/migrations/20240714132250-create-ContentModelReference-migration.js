'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
		await queryInterface.createTable('ContentModelReference', {
			id: {
				type: Sequelize.BIGINT,
				allowNull: false,
				primaryKey: true
			},
			creationdate: {
				type: Sequelize.DATE,
				allowNull: false
			},
			creationuser: {
				type: Sequelize.BIGINT,
				allowNull: true
			},
			position: {
				type: Sequelize.INTEGER,
				allowNull: false
			},
			content_id: {
				type: Sequelize.BIGINT,
				allowNull: false,
				references: {
					model: 'ContentModel',
					key: 'id'
				}
			},
			reference_id: {
				type: Sequelize.BIGINT,
				allowNull: false,
				references: {
					model: 'reference',
					key: 'id'
				}
			},
			datatype: {
				type: Sequelize.STRING,
				allowNull: true
			},
			citationtype: {
				type: Sequelize.STRING,
				allowNull: true
			}
		 });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
		await queryInterface.dropTable('ContentModelReference');
  }
};
