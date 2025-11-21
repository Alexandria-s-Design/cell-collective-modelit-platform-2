import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const ReactionGene = db.define("ReactionGene", {
    ...defaultAttributes
  }, {
		indexes: [
			{
				unique: true,
				fields: ["ReactionId", "GeneId"]
			}
		]
	});

  ReactionGene.associate = models => {
    ReactionGene.belongsTo(models.Gene);
    ReactionGene.belongsTo(models.Reaction);
  };

  return ReactionGene;
};
