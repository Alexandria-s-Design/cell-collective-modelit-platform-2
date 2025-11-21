import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
	const KineticModel = db.define("KineticModel", {
		...defaultAttributes,
		name: {
      type: DataTypes.TEXT
    },
	});

	KineticModel.associate = models => {
		KineticModel.hasMany(models.KineticCompartment);
		KineticModel.hasMany(models.KineticReaction);
		KineticModel.hasMany(models.KineticSpecies);
		KineticModel.hasMany(models.KineticGlobalParams);
		KineticModel.hasMany(models.Annotation);
		KineticModel.belongsTo(models.ModelVersion);
		KineticModel.belongsToMany(models.UnitDefinitions, { through: 'KineticUnits' })
	};

	

	return KineticModel;
};