'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
		await queryInterface.sequelize.query(`UPDATE "model" SET userid = CASE WHEN "userid" IS NOT NULL THEN userid ELSE "model"."_createdBy" END, published = CASE WHEN "published" IS NOT NULL THEN "model"."published" ELSE false END WHERE modeltype='metabolic'`);
  },
  down: async (queryInterface) => {
  }
};
