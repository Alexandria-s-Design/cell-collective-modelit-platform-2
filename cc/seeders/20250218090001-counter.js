'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = ['user', 'model'];
    for (const table of tables) {
      const count = await queryInterface.sequelize.query(
        `SELECT COUNT(*) as count FROM "${table}";`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      console.log(`CI/CD Table: ${table}, Count: ${count[0].count}`);
    }
  },

  async down(queryInterface, Sequelize) {
    console.log("Seeder does not modify the database.");
  }
};