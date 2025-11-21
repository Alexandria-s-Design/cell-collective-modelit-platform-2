import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const ReactionCoefficient = db.define("ReactionCoefficient", {
    ...defaultAttributes,
    coefficient: {
      type: DataTypes.FLOAT
    }
  });

  ReactionCoefficient.associate = models => {
    ReactionCoefficient.belongsTo(models.Reaction);
    ReactionCoefficient.belongsTo(models.Metabolite);
  };

  

  return ReactionCoefficient;
};
