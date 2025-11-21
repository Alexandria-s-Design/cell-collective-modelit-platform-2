'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
		await queryInterface.bulkInsert('UnitDefinitions', [{
			id: 1,
			name: 'molar'
		}])

		await queryInterface.bulkInsert('Units', [{
			id: 1,
			name: 'L^-1',
			type: 'litre',
			multiplier: 1,
			exponent: -1,
			scale: 0
		}, {
			id: 2,
			name: 'mole',
			type: 'mole',
			multiplier: 1,
			exponent: 1,
			scale: 0
		}])

		await queryInterface.bulkInsert('UnitDefinition_Units', [{
			id: 1,
			UnitDefinitionId: 1,
			UnitId: 2
		}, {
			id: 2,
			UnitDefinitionId: 1,
			UnitId: 1
		}])

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
		await queryInterface.bulkDelete('UnitDefinitions', null, {});
		await queryInterface.bulkDelete('Units', null, {});
  }
};
