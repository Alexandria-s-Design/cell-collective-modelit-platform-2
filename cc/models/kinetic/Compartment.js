import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
	const Compartment = db.define("KineticCompartment", {
		...defaultAttributes,
		name: {
      type: DataTypes.TEXT
    },
		size: {
			type: DataTypes.FLOAT
		},
		volume: {
			type: DataTypes.FLOAT
		}
	});

	Compartment.associate = models => {
		Compartment.hasMany(models.KineticSpecies, { as: 'KineticSpecies' });

		Compartment.belongsTo(models.KineticModel);

		Compartment.belongsTo(models.VolumeUnit);
	};
	return Compartment;
};