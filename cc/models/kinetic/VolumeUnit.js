import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
	const VolumeUnit = db.define("VolumeUnit", {
		...defaultAttributes,
		name: {
			type: DataTypes.TEXT
		},
	});

	VolumeUnit.associate = models => {
		VolumeUnit.hasMany(models.KineticCompartment);
	};
	return VolumeUnit;
};