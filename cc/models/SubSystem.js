import defaultAttributes from "../db/mixins/attributes";

export default (db, DataTypes) => {
  const SubSystem = db.define("SubSystem", {
    ...defaultAttributes,
    subSystemId: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
		ConstraintBasedModelId: {
			type: DataTypes.BIGINT
		}
  });

  SubSystem.associate = models => {
		// One-to-Many
    // SubSystem.belongsTo(models.Reaction);
	}
	
  return SubSystem;
};