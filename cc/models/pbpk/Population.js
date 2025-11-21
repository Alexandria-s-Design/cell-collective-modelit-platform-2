import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
	const Population = db.define("PKPopulation", {
		...defaultAttributes,
		name: {
			type: DataTypes.TEXT
		},
		type: {
			type: DataTypes.ENUM("body-weight", "age", "creatine", "custom")
		},
		distribution_id: {
			type: DataTypes.BIGINT,
			references: {
				model: "Distribution",
				key: "id"
			}
		},
		// covariate_id: {
		// 	type: DataTypes.BIGINT,
		// 	references: {
		// 		model: "PKCovariate",
		// 		key: "id"
		// 	}
		// },
	});

	Population.associate = models => {
		Population.belongsTo(models.PharmacokineticModel);
		Population.belongsTo(models.Distribution, {
			// as: "distribution",
			foreignKey: "distribution_id"
		});

		// Population.belongsTo(models.PKCovariate, {
		// 	as: "covariate",
		// 	foreignKey: "covariate_id"
		// });
	}

	return Population;
}