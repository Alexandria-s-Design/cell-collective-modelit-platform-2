'use strict';

/**
 * This makes it clear that you are categorizing different types of access for users,
 * such as "superadmin" and "approval".
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('profile', 'accessType', {
			type: Sequelize.DataTypes.INTEGER,
			allowNull: true,
		});

		await queryInterface.sequelize.query(`
		CREATE INDEX profile_accessType_btree
			ON public."profile"
			USING btree("user_id","accessType");
		`)
	},

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('profile', 'accessType');
  }
};
