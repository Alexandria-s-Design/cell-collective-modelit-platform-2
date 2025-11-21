import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
	const Function = db.define("Function", {
		...defaultAttributes,
		name: {
			type: DataTypes.TEXT
		},
		type: {
			type: DataTypes.ENUM("custom", "allometry", "power", "linear", "exponential", "emax", "sigmoid")
		},
		formula: {
			type: DataTypes.TEXT
		},
		parameters: {
			type: DataTypes.JSONB
		},
	});

	Function.associate = models => {
		Function.hasMany(models.PKCovariate, {
			foreignKey: "function_id"
		});
		// Population.belongsTo(models.Distribution, {
		// 	as: "distribution",
		// 	foreignKey: "distribution_id"
		// });
	}

	return Function;
}
