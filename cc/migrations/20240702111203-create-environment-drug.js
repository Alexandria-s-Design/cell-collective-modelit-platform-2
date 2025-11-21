'use strict';

import { createAttributes } from "../db/mixins/attributes";

module.exports = {
	async up(queryInterface, Sequelize) {
		//New Drug Environment
		await queryInterface.createTable('DrugEnvironments', {
			id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: Sequelize.DataTypes.BIGINT
			},
			name: {
				type: Sequelize.STRING(60)
			},
			isDefault: {
				type: Sequelize.DataTypes.BOOLEAN,
			},
			position: {
				type: Sequelize.DataTypes.INTEGER,
			},
			ConstraintBasedModelId: {
				type: Sequelize.DataTypes.BIGINT,
				references: {
          model: 'ConstraintBasedModels',
          key: 'id'
        }
			},
			...createAttributes(Sequelize)
		});

		await queryInterface.sequelize.query(`
			CREATE INDEX drugenvs_default_btree_idx
			ON public."DrugEnvironments"
			USING btree("isDefault");
		`);
		await queryInterface.sequelize.query(`
			CREATE INDEX drugenvs_pos_btree_idx
			ON public."DrugEnvironments"
			USING btree("position");
		`);
	
		// Add new Experiment
		await queryInterface.addColumn('experiment', 'drugEnvironmentId', {
			type: Sequelize.DataTypes.BIGINT,
			allowNull: true,
			references: {
				model: 'DrugEnvironments',
				key: 'id'
			}
		});

		await queryInterface.addColumn('experiment', 'lastRunDrugEnvironmentId', {
			type: Sequelize.DataTypes.BIGINT,
			allowNull: true,
			references: {
				model: 'DrugEnvironments',
				key: 'id'
			}
		});

	},
	async down(queryInterface, Sequelize) {
		await queryInterface.removeColumn('experiment', 'drugEnvironmentId');
		await queryInterface.removeColumn('experiment', 'lastRunDrugEnvironmentId');
		await queryInterface.dropTable('DrugEnvironments');
	}
};
