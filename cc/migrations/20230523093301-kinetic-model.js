'use strict';

/**
 * This function should be used to retrieve the ID
 * of the original lesson created by a teacher
 * that a student has started.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {

		const script = `
		ALTER TABLE public."Annotations" ADD "KineticModelId" _int8 NULL;`;
		// ALTER TABLE Annotations ADD CONSTRAINT fk_KneticModelId
		// FOREIGN KEY (KineticModelId)
		// REFERENCES KneticModel (id);
		// `;

    return await queryInterface.sequelize.query(script);
		
  },
  down: async (queryInterface) => {
    return await queryInterface.sequelize.query(`
			ALTER TABLE public."Annotations" DROP COLUMN "KineticModelId";
		`);
  }
};