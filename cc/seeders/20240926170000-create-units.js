'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {

		const defatulValues = {
			_createdBy: 5850,
			_createdAt: new Date(),
			_updatedAt: new Date(),
			_deleted: false,
		}

		await queryInterface.bulkInsert('UnitDefinitions', [{
			id: 19,
			name: 'substance',
			...defatulValues
		},
		{
			id: 20,
			name: 'mmol/L',
			...defatulValues
		},
		{
			id: 21,
			name: 'millimolar per minute',
			...defatulValues
		},
		{
			id: 22,
			name: 'per minute',
			...defatulValues
		},
		{
			id: 23,
			name: 'millimoles per minute',
			...defatulValues
		}
	])

  },

  async down (queryInterface, Sequelize) {
		await queryInterface.bulkDelete('UnitDefinitions', {
				name: {
						[Sequelize.Op.in]: [
							'substance',
							'mmol/L',
							'millimolar per minute',
							'per minute',
							'millimoles per minute',
						]
				}
		}, {});
  }
};
