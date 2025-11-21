import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const KineticLaw = db.define("KineticLaw", {
    ...defaultAttributes,
    formula: {
      type: DataTypes.STRING
    },
		description: {
			type: DataTypes.STRING
		},
		numSubstrates : {
			type:  DataTypes.BIGINT
		},
		numProducts : {
			type:  DataTypes.BIGINT
		}
  });

  KineticLaw.associate = (models) => {
		KineticLaw.belongsTo(models.KineticReaction);
		KineticLaw.belongsTo(models.KineticLawType);

		KineticLaw.hasMany(models.KineticLocalParams);
	}

  return KineticLaw;
};