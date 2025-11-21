import { createAttributes } from "../db/mixins/attributes";

'use strict';
module.exports = {
  up: async(queryInterface, Sequelize) => {
    return queryInterface.createTable('RenewalItems', {
			id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      subscriptionId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'UserSubscriptions',
          key: 'id'
        }
      },
      accountPlanId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'AccountPlans',
          key: 'id'
        }
      },
			renewalDateTime:{
				type:Sequelize.DATE,
				allowNull:true
			},
			masterSubId: {
				type: Sequelize.INTEGER,
				allowNull: true
			},
			status:{
				type:Sequelize.STRING,
				allowNull:true
			},
			retryCount:{
				type:Sequelize.INTEGER,
				allowNull:true
			},
			isError:{
				type:Sequelize.BOOLEAN,
				allowNull:true
			},
			errorDesc:{
				type:Sequelize.TEXT,
				allowNull:true
			},
			...createAttributes(Sequelize)
    });
  },
  down: async(queryInterface) => {
    return queryInterface.dropTable('RenewalItems');
  }
};