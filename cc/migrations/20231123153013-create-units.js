'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('Units', {
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
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.ENUM(
          'ampere',
					'candela',
					'dimentionless',
					'kilogram',
					'kelvin',
					'litre',
					'metre',
					'mole',
					'second',
        ),
      },
      multiplier: {
        type: Sequelize.INTEGER,
      },
      exponent: {
        type: Sequelize.INTEGER,
      },
      scale: {
        type: Sequelize.INTEGER,
      },
		});
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('Units');
	}
};


