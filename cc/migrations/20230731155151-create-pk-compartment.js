'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
		await queryInterface.createTable('PKCompartments', {
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
				type: Sequelize.ENUM("int", "ext") // internal or external
			},
			cmp: {
				type: Sequelize.ENUM("drug", "metabolite") // drug or metabolite
			},
			ext_type: {
				type: Sequelize.ENUM("in", "out") // input or output
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
		await queryInterface.dropTable('PKCompartments');
  }
};
