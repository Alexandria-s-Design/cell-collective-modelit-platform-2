import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const Reaction = db.define("Reaction", {
		...defaultAttributes,
		reactionId: {
			type: DataTypes.TEXT
		},
    name: {
      type: DataTypes.TEXT
    },
		boundary: {
			type: DataTypes.ENUM('sinks','demands','exchanges'),
			allowNull: true
		},
    lowerBound: {
			type: DataTypes.FLOAT,
			defaultValue: -1000
    },
    upperBound: {
			type: DataTypes.FLOAT,
			defaultValue:  1000
		},
		objectiveCoefficient: {
			type: DataTypes.FLOAT,
			defaultValue: 0
		}
  });

  Reaction.associate = models => {
		Reaction.belongsTo(models.SubSystem);
    Reaction.belongsToMany(models.ConstraintBasedModel, {
      through: "ReactionConstraintBasedModel"
    });

    Reaction.hasMany(models.Annotation);
  };

  

  return Reaction;
};