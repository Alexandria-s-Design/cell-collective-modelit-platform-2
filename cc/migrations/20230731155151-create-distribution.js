'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Distributions', {
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
				type: Sequelize.ENUM("normal", "lognormal", "uniform", "logit", "box_cox", "heavy_tail", "custom"),
			},
			parameters: {
				type: Sequelize.JSONB
			},
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('Distributions');
	}
};
