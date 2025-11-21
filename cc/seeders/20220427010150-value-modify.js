'use strict';

const { NOW } = require("sequelize");

module.exports = {
	up: async (queryInterface) => {
		const { sequelize } = queryInterface;
		await sequelize.query(`SET search_path TO metadata`);
		await queryInterface.bulkInsert('value', [{
			id: 30287,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 30288,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 30289,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 30290,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 30291,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 30292,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 30293,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 30294,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 30295,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 30296,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 30297,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		}, {
			id: 30298,
			definition_id: 1,
			updatedate: new Date(),
			// position: ''
		},


		], {
			individualHooks: true
		});

		// await queryInterface.query(`SET search_path TO metadata`);
		await queryInterface.bulkInsert('value_text', [{
			value_id: 30287,
			value: 'Kindergarten'
		}, {
			value_id: 30288,
			value: '1st Grade'
		}, {
			value_id: 30289,
			value: '2nd Grade'
		}, {
			value_id: 30290,
			value: '3rd Grade'
		}, {
			value_id: 30291,
			value: '4th Grade'
		}, {
			value_id: 30292,
			value: '5th Grade'
		}, {
			value_id: 30293,
			value: '6th Grade'
		}, {
			value_id: 30294,
			value: '7th Grade'
		}, {
			value_id: 30295,
			value: '8th Grade'
		}, {
			value_id: 30296,
			value: '9th-12th Grade'
		}, {
			value_id: 30297,
			value: 'Undergraduate'
		}, {
			value_id: 30298,
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
				[Op.gte]: 30287
			},
		});

		queryInterface.bulkDelete('value_text', {
			value_id: {
				[Op.gte]: 30287
			},
		});
		return await true;
	}
};

