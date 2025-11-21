import defaultAttributes from "../../db/mixins/attributes"

export default (db, DataTypes) => {
	const PharmacokineticModel = db.define("PharmacokineticModel", {
		...defaultAttributes
	});

	PharmacokineticModel.associate = models => {
		PharmacokineticModel.belongsTo(models.ModelVersion);

		PharmacokineticModel.hasMany(models.PKCompartment, {});
		PharmacokineticModel.hasMany(models.PKRate, {});
		PharmacokineticModel.hasMany(models.PKPopulation)
	};

	return PharmacokineticModel;
};