'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('PKPopulations', {
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
				type: Sequelize.ENUM("body-weight", "age", "albumin", "creatinine", "custom")
			},
			distribution_id: {
				type: Sequelize.BIGINT,
				references: {
					model: "Distributions",
					key: "id"
				}
			},
      PharmacokineticModelId: {
        type: Sequelize.BIGINT,
        references: {
          model: 'PharmacokineticModels',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('PKPopulations');
	}
};
