import { createAttributes } from "../db/mixins/attributes";

'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
	 return queryInterface.createTable('Institutions', {
		 ...createAttributes(Sequelize),
		 name:{
			type: Sequelize.STRING ,
			allowNull: false
		 },
		 domains:{
			 type: Sequelize.ARRAY(Sequelize.STRING)
		 },
		 websites: {
			 type: Sequelize.ARRAY(Sequelize.STRING)
		 }
	 })
  },

  down: (queryInterface) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
	 return queryInterface.dropTable("Institutions");
  }
};
