'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('PKCovariates', {
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
				type: Sequelize.ENUM("body-weight", "age", "creatine", "custom"),
			},
			function_id: {
				type: Sequelize.BIGINT,
				references: {
					model: "Functions",
					key: "id"
				}
			},
			parameter_id: {
				type: Sequelize.BIGINT,
				references: {
					model: "PKParameters",
					key: "id"
				}
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('PKCovariates');
	}
};

