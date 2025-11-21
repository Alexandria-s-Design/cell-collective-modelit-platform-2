'use strict';

const teachId = '767';
const lessonsId = ['241824','241825','241826','241827'];

module.exports = {
	up: async (queryInterface) => {
		const { sequelize } = queryInterface;		
		await sequelize.query(`update public.model set userid=${teachId} where id in(${lessonsId.join(',')}) and userid is null`);
		return true;
	},

	down: async (queryInterface, { Op }) => {
		const { sequelize } = queryInterface;
		await sequelize.query(`update public.model set userid=null where id in(${lessonsId.join(',')}) and userid is not null`);
		return true;
	}
};

