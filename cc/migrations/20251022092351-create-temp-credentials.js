'use strict';

import { createAttributes } from "../db/mixins/attributes";

module.exports = {
	async up(queryInterface, Sequelize) {

		await queryInterface.createTable('TemporaryCredentials', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.DataTypes.BIGINT
			},
			targetEmail: {
				allowNull: false,
				type: Sequelize.DataTypes.STRING
			},
			tempEmail: {
				allowNull: false,
				type: Sequelize.DataTypes.STRING(40)
			},
			tempSecretKey: {
				allowNull: false,
				type: Sequelize.DataTypes.STRING(60)
			},
			accessType: {
				allowNull: false,
				type: Sequelize.DataTypes.STRING(10)
			},
			accessCode: {
				allowNull: false,
				type: Sequelize.DataTypes.STRING(60)
			},
			usedAt: {
				allowNull: true,
				type: Sequelize.DATE
			},
			userTimezone: {
				allowNull: true,
				type: Sequelize.DataTypes.STRING(50),
				defaultValue: 'UTC',
			},
			userIp: {
				allowNull: true,
				type: Sequelize.DataTypes.STRING(45),
				validate: {	isIP: true	},
			},
			...createAttributes(Sequelize)
		});

		await queryInterface.sequelize.query(`
			CREATE INDEX tempcredentials_targetemail_btree
			ON public."TemporaryCredentials"
			USING btree("targetEmail");
		`);
		await queryInterface.sequelize.query(`
			CREATE INDEX tempcredentials_tempemail_btree
			ON public."TemporaryCredentials"
			USING btree("tempEmail");
		`);
		await queryInterface.sequelize.query(`
			CREATE INDEX tempcredentials_type_btree
			ON public."TemporaryCredentials"
			USING btree("accessType");
		`);
		await queryInterface.sequelize.query(`
			CREATE INDEX tempcredentials_code_btree
			ON public."TemporaryCredentials"
			USING btree("accessCode");
		`);	
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('TemporaryCredentials');
	}
};
