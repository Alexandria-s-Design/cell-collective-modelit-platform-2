'use strict';

const ACCESS_TYPE_APPROVAL = 3;
const USER_ID = 24696;

module.exports = {
	up: async (queryInterface) => {		

		await queryInterface.sequelize.query(
			`UPDATE profile SET "accessType" = ${ACCESS_TYPE_APPROVAL} WHERE "user_id" = ${USER_ID}`,
		{ type: "UPDATE" })

	},

	down: async (queryInterface, { Op }) => {
		await queryInterface.sequelize.query(
			`UPDATE profile SET "accessType" = NULL WHERE "user_id" = ${USER_ID}`,
		{ type: "UPDATE" })
	}
};