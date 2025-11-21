import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
	const Distribution = db.define("Distribution", {
		...defaultAttributes,
		name: {
			type: DataTypes.TEXT
		},
		type: {
			type: DataTypes.ENUM("normal", "lognormal", "uniform", "logit", "box_cox", "heavy_tail", "custom") 
		},
		parameters: {
			type: DataTypes.JSONB
		},
	});

	Distribution.associate = models => {
		Distribution.hasMany(models.PKVariability, {
			foreignKey: "distribution_id"
		});
		Distribution.hasMany(models.PKPopulation, {
			foreignKey: "distribution_id"
		});
	}

	return Distribution;
};