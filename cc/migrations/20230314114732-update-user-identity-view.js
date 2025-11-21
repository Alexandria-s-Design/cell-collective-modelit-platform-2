'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    const script = `
			DROP VIEW IF EXISTS user_identity_view;
			CREATE VIEW user_identity_view AS
				SELECT u.id,
						p.email,
						p.firstname,
						p.lastname,
						p.institution
					FROM ("user" u
						JOIN profile p ON ((u.id = p.user_id)))
					ORDER BY u.id;
		`

    return await queryInterface.sequelize.query(script);
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
