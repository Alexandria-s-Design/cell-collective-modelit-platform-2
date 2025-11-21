import defaultAttributes from "../db/mixins/attributes";


export default (db, DataTypes) => {
    const RenewalItem = db.define("RenewalItem", {
			id: {
				allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
			},
		masterSubId: {
      type: DataTypes.INTEGER,
			allowNull: true
    },
		renewalDateTime: {
      type: DataTypes.DATE,
			allowNull: true
    },
		status: {
      type: DataTypes.STRING,
			allowNull: true
    },
		retryCount: {
      type: DataTypes.INTEGER,
			allowNull: true
    },
		isError: {
      type: DataTypes.BOOLEAN,
			allowNull: true
    },
		errorDesc: {
      type: DataTypes.TEXT,
			allowNull: true
    },
		...defaultAttributes,
    });

    RenewalItem.associate = models => {
			RenewalItem.belongsTo(models.UserSubscription, {foreignKey:'subscriptionId'});
			RenewalItem.belongsTo(models.AccountPlans, {foreignKey:'accountPlanId'});
    }

    return RenewalItem;
}
