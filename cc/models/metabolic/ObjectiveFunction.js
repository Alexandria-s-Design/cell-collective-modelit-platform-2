import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const ObjectiveFunction = db.define("ObjectiveFunction", {
    ...defaultAttributes,
    name: {
      type: DataTypes.STRING
    }
  });

  ObjectiveFunction.associate = (models) => {
		ObjectiveFunction.hasMany(
			models.ObjectiveReaction
		);
	}
  
  

  return ObjectiveFunction;
};