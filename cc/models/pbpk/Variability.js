import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
	const Variability = db.define("PKVariability", {
		...defaultAttributes,
		type: {
			type: DataTypes.ENUM("ind", "occ"),
		},
		distribution_id: {
			type: DataTypes.BIGINT,
			references: {
				model: "Distribution",
				key: "id"
			}
		},
		parameter_id: {
			type: DataTypes.BIGINT,
			references: {
				model: "PKParameter",
				key: "id"
			}
		},
	});

	Variability.associate = models => {
		Variability.belongsTo(models.Distribution, {
			// as: "distribution",
			foreignKey: "distribution_id"
		});

		Variability.belongsTo(models.PKParameter, {
			as: "parameter",
			foreignKey: "parameter_id"
		});
	}

	return Variability;
}