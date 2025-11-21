import defaultAttributes from "../db/mixins/attributes";


export default (db, DataTypes) => {
    const UserSubscription = db.define("UserSubscription", {
			...defaultAttributes,
			noOfStudentAccountPurchased: {
      type: DataTypes.INTEGER,
			allowNull: true
    },
		startDateTime: {
      type: DataTypes.DATE,
			allowNull: true
    },
		endDateTime: {
      type: DataTypes.DATE,
			allowNull: true
    },
		status: {
      type: DataTypes.STRING,
			allowNull: true
    },
		prevSubscriptionId: {
      type: DataTypes.INTEGER,
			allowNull: true
    },
		masterSubId: {
      type: DataTypes.INTEGER,
			allowNull: true
    },
		userId: {
      type: DataTypes.INTEGER,
			allowNull: true
    },
		termOrder: {
      type: DataTypes.INTEGER,
			allowNull: true
    },

    });

    UserSubscription.associate = models => {
			UserSubscription.belongsTo(models.AccountPlans, { foreignKey: 'AccountPlanId' });
        // UserSubscription.belongsTo(models.AccountPlans);
    }

    return UserSubscription;
}