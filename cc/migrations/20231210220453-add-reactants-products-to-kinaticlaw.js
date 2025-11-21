'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up (queryInterface, Sequelize) {
		await queryInterface.addColumn('KineticLaws', 'numSubstrates', {
			type: Sequelize.BOOLEAN,
			allowNull: true,
		});

		await queryInterface.addColumn('KineticLaws', 'numProducts', {
			type: Sequelize.BOOLEAN,
			allowNull: true,
		});
	},
	
		async down (queryInterface, Sequelize) {
			await queryInterface.removeColumn('KineticLaws', 'numSubstrates');
			await queryInterface.removeColumn('KineticLaws', 'numProducts');
		}
	};
