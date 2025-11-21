'use strict';

module.exports = {
	up: async (queryInterface) => {
		const { sequelize } = queryInterface;
		await sequelize.query(`SET search_path TO metadata`);
		await queryInterface.bulkInsert('value', [{
			id: 19864935,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 19864936,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 19864937,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 19864938,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 19864939,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 19864940,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 19864941,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 19864942,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 19864943,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 19864944,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 19864945,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 19864946,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		},


		], {
			individualHooks: true
		});

		// await queryInterface.query(`SET search_path TO metadata`);
		await queryInterface.bulkInsert('value_text', [{
			value_id: 19864935,
			value: 'Kindergarten'
		}, {
			value_id: 19864936,
			value: '1st Grade'
		}, {
			value_id: 19864937,
			value: '2nd Grade'
		}, {
			value_id: 19864938,
			value: '3rd Grade'
		}, {
			value_id: 19864939,
			value: '4th Grade'
		}, {
			value_id: 19864940,
			value: '5th Grade'
		}, {
			value_id: 19864941,
			value: '6th Grade'
		}, {
			value_id: 19864942,
			value: '7th Grade'
		}, {
			value_id: 19864943,
			value: '8th Grade'
		}, {
			value_id: 19864944,
			value: '9th-12th Grade'
		}, {
			value_id: 19864945,
			value: 'Undergraduate'
		}, {
			value_id: 19864946,
			value: 'Advanced'
		},


		], {
			individualHooks: true
		});

		return await true;
	},

	down: async (queryInterface, { Op }) => {
		const { sequelize } = queryInterface;
		await sequelize.query(`SET search_path TO metadata`);

		queryInterface.bulkDelete('value', {
			id: {
				[Op.gte]: 19864935
			},
		});

		queryInterface.bulkDelete('value_text', {
			value_id: {
				[Op.gte]: 19864935
			},
		});
		return await true;
	}
};
