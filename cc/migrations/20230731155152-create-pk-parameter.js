'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
		await queryInterface.createTable('PKParameters', {
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
			type: {
				type: Sequelize.ENUM("fraction", "K", "volume", "dosing") // internal or external
			},
			value: {
				type: Sequelize.FLOAT
			},
			value_type: {
				type: Sequelize.ENUM("inst", "zero", "first", "mm")
			},
      PKCompartmentId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'PKCompartments',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
			PKRateId: {
				type: Sequelize.BIGINT,
				references: {
					model: 'PKRates',
					key: 'id'
				},
				onDelete: 'CASCADE'
			}
		})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
		await queryInterface.dropTable('PKParameters');
  }
};
