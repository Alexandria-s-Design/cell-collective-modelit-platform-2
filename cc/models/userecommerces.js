import defaultAttributes from "../db/mixins/attributes";


export default (db, DataTypes) => {
    const UserEcommerce = db.define("UserEcommerce", {
		// 	userId: {
    //   type: DataTypes.INTEGER,
		// 	allowNull: true
    // },
		// subscriptionId: {
    //   type: DataTypes.INTEGER,
		// 	allowNull: true
    // },
		masterSubId: {
      type: DataTypes.INTEGER,
			allowNull: true
    },
		customerId: {
      type: DataTypes.STRING,
			allowNull: true
    },
		cardHolderName: {
			type: DataTypes.STRING,
			allowNull: true
		},
		expirationMonth: {
			type: DataTypes.INTEGER,
			allowNull: true
			},
		expirationYear: {
			type: DataTypes.INTEGER,
			allowNull: true
			},
		country: {
			type: DataTypes.STRING,
			allowNull: true
			},
		state: {
			type: DataTypes.STRING,
			allowNull: true
			},
		city: {
			type: DataTypes.STRING,
			allowNull: true
			},
		pincode: {
			type: DataTypes.INTEGER,
			allowNull: true
			},
		...defaultAttributes,
    });

    UserEcommerce.associate = models => {
			// UserEcommerce.belongsTo(models.UserSubscription, {foreignKey:'subscriptionId'});
			UserEcommerce.belongsTo(models.User, {foreignKey:'userId'});
    }

    return UserEcommerce;
}
