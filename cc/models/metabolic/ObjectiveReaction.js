import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const ObjectiveReaction = db.define("ObjectiveReaction", {
		...defaultAttributes,
		coefficient: {
			type: DataTypes.FLOAT,
			defaultValue: 1
		}
	});

  ObjectiveReaction.associate = (models) => {
		ObjectiveReaction.belongsTo(models.Reaction);
	};
	
	

  return ObjectiveReaction;
};