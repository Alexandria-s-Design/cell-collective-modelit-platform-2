/**
 * This seed file updates specific entries in the `model_version` table to correct 
 * version inconsistencies. Some model versions were saved but do not correctly 
 * reflect the expected origin version numbering. This update ensures that the 
 * affected records are aligned with the intended version sequence based on 
 * their `name` and `originid`.
 * 
 * The updates specifically target models with `originid = 295797` and adjust 
 * their version numbers accordingly.
 * 
 * Note: This seed only updates existing records; it does not create new entries.
 */

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const updates = [
      {
        newVersion: 12,
        oldVersion: 9,
        name: 'Reference '
      },
      {
        newVersion: 11,
        oldVersion: 8,
        name: 'Effector Cytokines'
      },
      {
        newVersion: 8,
        oldVersion: 7,
        name: 'Pathogen Response'
      }
    ];

    for (const update of updates) {
      const [result] = await queryInterface.sequelize.query(
        `
        UPDATE model_version mv
        SET "version" = :newVersion
        FROM model m
        WHERE m.id = mv.modelid
          AND m.originid = 295797
          AND mv."version" = :oldVersion
          AND mv."name" = :name;
        `,
        {
          replacements: {
            newVersion: update.newVersion,
            oldVersion: update.oldVersion,
            name: update.name
          },
          type: Sequelize.QueryTypes.UPDATE
        }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    console.log("Seeder does not revert version updates.");
  }
};