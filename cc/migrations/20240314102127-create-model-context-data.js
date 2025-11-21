'use strict';

import { createAttributes } from "../db/mixins/attributes";

module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable('ModelContextData', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.BIGINT
			},
			modelContextId: {
				type: Sequelize.BIGINT,
				references: {
          model: 'ModelContext',
          key: 'id'
        }
			},
			dataType: {
				// EXCLUDE_REACTIONS, BOUNDARY_REACTIONS, CORE_REACTIONS and etc...
				type: Sequelize.STRING(35)
			},
			data: {
				type: Sequelize.JSONB
			},
			...createAttributes(Sequelize)
		});

		await queryInterface.sequelize.query(`
			CREATE INDEX context_data_btree_idx
			ON public."ModelContextData"
			USING btree("dataType");
		`);

	},
	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable('ModelContextData');
	}
};
