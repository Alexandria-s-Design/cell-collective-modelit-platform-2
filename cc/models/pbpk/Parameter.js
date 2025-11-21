import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
	const Parameter = db.define("PKParameter", {
		...defaultAttributes,
		name: {
			type: DataTypes.TEXT
		},
		type: {
			type: DataTypes.ENUM("fraction", "K", "volume", "dosing") 
		},
		value: {
			type: DataTypes.FLOAT
		},
		value_type: {
			type: DataTypes.ENUM("inst", "zero", "first", "mm"), // instantaneous, zero-order, first-order, Michaelis-Menten
			defaultValue: null
		},
	});

	Parameter.associate = models => {
		Parameter.belongsTo(models.PKRate);
		Parameter.belongsTo(models.PKCompartment);

		Parameter.hasOne(models.PKVariability, {
			// as: "variability",
			foreignKey: "parameter_id"
		});

		Parameter.hasOne(models.PKDosing, {
			// as: "dosing",
			foreignKey: "parameter_id"
		});

		Parameter.hasMany(models.PKCovariate, {
			foreignKey: "parameter_id"
		});
	}

	return Parameter;
};