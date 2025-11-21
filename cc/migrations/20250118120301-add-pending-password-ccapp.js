'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
		await queryInterface.addColumn('users_ccapp', 'password_pending_update', {
			type: Sequelize.DataTypes.BOOLEAN,
			allowNull: true
		});

		await queryInterface.sequelize.query(
			`CREATE INDEX passpendingupdate_btree_idx
			ON public.users_ccapp	USING btree("password_pending_update")`
		);
  },

  down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('users_ccapp', 'password_pending_update');
  }
};
