'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('PKDosings', {
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
			type: {
				type: Sequelize.ENUM("single", "multiple", "custom"),
			},
			route: {
				type: Sequelize.ENUM("iv", "od"),
			},
			amount: {
				type: Sequelize.FLOAT
			},
			duration: {
				type: Sequelize.FLOAT
			},
			interval: {
				type: Sequelize.FLOAT
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
		await queryInterface.dropTable('PKDosings');
	}
};


