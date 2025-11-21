'use strict';

import { createAttributes } from "../db/mixins/attributes";

module.exports = {
	async up(queryInterface, Sequelize) {

		await queryInterface.createTable('users_ccapp', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.DataTypes.BIGINT
			},
			user_id: {
				type: Sequelize.DataTypes.BIGINT,
			},
			user_ccapp_id: {
				type: Sequelize.DataTypes.UUID,
			},
			...createAttributes(Sequelize)
		});

		await queryInterface.sequelize.query(`
			CREATE INDEX usersccapp_userid_btree_idx
			ON public."users_ccapp"
			USING btree("user_id");
		`);
		await queryInterface.sequelize.query(`
			CREATE INDEX usersccapp_ccappid_btree_idx
			ON public."users_ccapp"
			USING btree("user_ccapp_id");
		`);

	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('users_ccapp');
	}
};
