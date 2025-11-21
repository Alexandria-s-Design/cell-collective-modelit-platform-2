import defaultAttributes from "../../db/mixins/attributes"

export default (db, DataTypes) => {
	const ConstraintBasedModel = db.define("ConstraintBasedModel", {
		...defaultAttributes
	});

	ConstraintBasedModel.associate = models => {
		ConstraintBasedModel.belongsTo(models.ModelVersion);

		ConstraintBasedModel.belongsToMany(models.Metabolite, {
			through: "MetaboliteConstraintBasedModel"
		});

		ConstraintBasedModel.belongsToMany(models.Reaction, {
			through: "ReactionConstraintBasedModel"
		});
		
		ConstraintBasedModel.belongsToMany(models.Gene, {
			through: "GeneConstraintBasedModel"
		});

		ConstraintBasedModel.hasMany(models.Annotation);

		ConstraintBasedModel.hasOne(models.ObjectiveFunction);
	};

	return ConstraintBasedModel;
};