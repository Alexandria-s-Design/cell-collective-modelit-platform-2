'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
async up (queryInterface, Sequelize) {
	await queryInterface.addColumn('KineticReactions', 'reversible', {
		type: Sequelize.BOOLEAN,
		allowNull: true,
	});
},

  async down (queryInterface, Sequelize) {
		await queryInterface.removeColumn('KineticReactions', 'reversible');
  }
};
