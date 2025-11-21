'use strict';

import { createAttributes } from "../db/mixins/attributes";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('ModelContext', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.BIGINT
			},
			contextType: {
				allowNull: false,
				// iMAT, GIMME, FAST and etc...
				type: Sequelize.STRING(10)
			},
			modelId: {
				type: Sequelize.BIGINT,
				references: {
          model: 'model',
          key: 'id'
        }
			},
			modelOriginId: {
				type: Sequelize.BIGINT,
				references: {
          model: 'model',
          key: 'id'
        }
			},
			uploads: {
				type: Sequelize.JSONB
			},
			downloads: {
				type: Sequelize.JSONB
			},
			settings: {
				allowNull: false,
				type: Sequelize.JSONB
			},
			...createAttributes(Sequelize)
		});

		await queryInterface.sequelize.query(`
			CREATE INDEX context_btree_idx
			ON public."ModelContext"
			USING btree("contextType");
		`);
	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('ModelContext');
	}
};
