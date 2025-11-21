import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const Reaction = db.define("KineticReaction", {
		...defaultAttributes,
		reaction_id: {
			type: DataTypes.TEXT
		},
    name: {
      type: DataTypes.TEXT
    },
		reversible: {
			type: DataTypes.BOOLEAN
		},
  });

  Reaction.associate = models => {
		Reaction.belongsTo(models.KineticModel);

		Reaction.hasOne(models.KineticLaw);

		Reaction.belongsToMany(models.KineticSpecies, { through: 'KineticReactants', as: 'reactants' });
		Reaction.belongsToMany(models.KineticSpecies, { through: 'KineticProducts', as: 'products' });
		Reaction.belongsToMany(models.KineticSpecies, { through: 'KineticModifiers', as: 'modifiers'});
  };

  return Reaction;
};