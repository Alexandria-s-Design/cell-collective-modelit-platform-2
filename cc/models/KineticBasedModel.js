import defaultAttributes from "../db/mixins/attributes"

export default (db) => {
	const KineticBasedModel = db.define("KineticBasedModel", {
		...defaultAttributes
	});

	KineticBasedModel.associate = models => {
		KineticBasedModel.belongsTo(models.BaseModel);

		KineticBasedModel.hasMany(models.Metabolite);
		KineticBasedModel.hasMany(models.Reaction);
	};

	

	return KineticBasedModel;
};