import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
	const Rate = db.define("PKRate", {
		...defaultAttributes,
		name: {
			type: DataTypes.TEXT
		},
		from_compartment_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			references: {
				model: "PKCompartment",
				key: "id"
			}
		},
		to_compartment_id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			references: {
				model: "PKCompartment",
				key: "id"
			}
		},
	});

	Rate.associate = models => {
		Rate.belongsTo(models.PharmacokineticModel);

		Rate.belongsTo(models.PKCompartment, {
			as: "fromCompartment",
			foreignKey: "from_compartment_id"
		});

		Rate.belongsTo(models.PKCompartment, {
			as: "toCompartment",
			foreignKey: "to_compartment_id"
		});

		Rate.hasMany(models.PKParameter, {
			// as: "parameters",
		});
	}

	return Rate;
}