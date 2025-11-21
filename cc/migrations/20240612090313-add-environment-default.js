'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
		await queryInterface.addColumn('analysis_environment', 'isDefault', {
			type: Sequelize.DataTypes.BOOLEAN,
			allowNull: true
		});
		await queryInterface.addColumn('analysis_environment', 'position', {
			type: Sequelize.DataTypes.INTEGER,
			allowNull: true
		});

		await queryInterface.sequelize.query(
			`CREATE INDEX environment_default_btree_idx
			ON public.analysis_environment	USING btree("isDefault")`
		);
  },

  down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('analysis_environment', 'isDefault');
		await queryInterface.removeColumn('analysis_environment', 'position');
  }
};
