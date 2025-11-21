'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

		//COMPLETED, RUNNING
		//Column: state

		//DRUG
		await queryInterface.addColumn('experiment', 'exper_type', {
			type: Sequelize.STRING(10),
			allowNull: true
		});

		await queryInterface.addColumn('experiment', 'err_msg', {
			type: Sequelize.STRING(200),
			allowNull: true
		});

		await queryInterface.addColumn('experiment', '_updatedBy', {
			type: Sequelize.BIGINT
		});

		await queryInterface.addColumn('experiment', '_updatedAt', {
			type: Sequelize.DATE
		});

		await queryInterface.addColumn('experiment', '_deletedAt', {
			type: Sequelize.DATE
		});

		await queryInterface.addColumn('experiment', '_deleted', {
			type: Sequelize.BOOLEAN
		});


		await queryInterface.sequelize.query(`
			CREATE INDEX experiment_state_btree_idx
			ON "experiment"
			USING btree("state");

			CREATE INDEX experiment_expertype_btree_idx
			ON "experiment"
			USING btree("exper_type");
		`);
  },

  down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('experiment', 'exper_type');
		await queryInterface.removeColumn('experiment', 'err_msg');
		await queryInterface.removeColumn('experiment', '_updatedBy');
		await queryInterface.removeColumn('experiment', '_updatedAt');
		await queryInterface.removeColumn('experiment', '_deletedAt');		
		await queryInterface.removeColumn('experiment', '_deleted');
	
		await queryInterface.sequelize.query(`
			DROP INDEX experiment_state_btree_idx;
			DROP INDEX experiment_expertype_btree_idx;
		`);
  }
};
