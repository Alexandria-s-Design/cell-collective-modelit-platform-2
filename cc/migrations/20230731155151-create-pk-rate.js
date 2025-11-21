'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
		await queryInterface.createTable('PKRates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      _createdBy: {
        type: Sequelize.INTEGER
      },
      _createdAt: {
        type: Sequelize.DATE
      },
      _updatedBy: {
        type: Sequelize.INTEGER
      },
      _updatedAt: {
        type: Sequelize.DATE
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
      },
			name: {
				type: Sequelize.TEXT
			},
      from_compartment_id: {
        allowNull: false,
        type: Sequelize.BIGINT,
        references: {
          model: 'PKCompartments',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
			to_compartment_id: {
				allowNull: false,
				type: Sequelize.BIGINT,
				references: {
					model: 'PKCompartments',
					key: 'id'
				},
				onDelete: 'CASCADE'
			},
      PharmacokineticModelId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'PharmacokineticModels',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
		})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
		await queryInterface.dropTable('PKRates');
  }
};

