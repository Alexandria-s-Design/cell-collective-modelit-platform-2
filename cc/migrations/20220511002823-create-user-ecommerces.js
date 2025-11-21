import { createAttributes } from "../db/mixins/attributes";

'use strict';
module.exports = {
  up: async(queryInterface, Sequelize) => {
    return queryInterface.createTable('UserEcommerces', {
		id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
    },
		userId: {
			type: Sequelize.INTEGER,
			references: {
				model: 'user',
				key: 'id'
			}
		},			
		masterSubId: {
			type: Sequelize.INTEGER,
			allowNull: true
		},
		// subscriptionId: {
		// 	type: Sequelize.INTEGER,
		// 	references: {
		// 		model: 'UserSubscriptions',
		// 		key: 'id'
		// 	}
		// },

		customerId: {
      type: Sequelize.STRING,
			allowNull: true
    },
		cardHolderName: {
      type: Sequelize.STRING,
			allowNull: true
    },
		expirationMonth: {
      type: Sequelize.INTEGER,
			allowNull: true
    },
		expirationYear: {
      type: Sequelize.INTEGER,
			allowNull: true
    },
		country: {
      type: Sequelize.STRING,
			allowNull: true
    },
		state: {
      type: Sequelize.STRING,
			allowNull: true
    },
		city: {
      type: Sequelize.STRING,
			allowNull: true
    },
		pincode: {
      type: Sequelize.INTEGER,
			allowNull: true
    },
		...createAttributes(Sequelize)
    });
    },
		down: async(queryInterface) => {
			return queryInterface.dropTable('UserEcommerces');
		}
}
