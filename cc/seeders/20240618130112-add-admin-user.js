'use strict';

let cellcollectiveteach_id = 5780;

module.exports = {
	up: async (queryInterface) => {
		const { sequelize } = queryInterface;
		await sequelize.query(`SET search_path TO public`);

		const existingRecords = await sequelize.query(
			`SELECT 1 FROM authority WHERE user_id = ${cellcollectiveteach_id} AND role_id = 4`,
			{ type: sequelize.QueryTypes.SELECT }
		);

		if (existingRecords.length === 0) {
			await queryInterface.bulkInsert('authority', [{
				user_id: cellcollectiveteach_id,
				role_id: 4
			}], {
				individualHooks: true
			});
		}

		return true;
	},

	down: async (queryInterface, { Op }) => {
		await queryInterface.bulkDelete('authority', {
			user_id: cellcollectiveteach_id,
			role_id: 4
		}, {});

		return true;
	}
};