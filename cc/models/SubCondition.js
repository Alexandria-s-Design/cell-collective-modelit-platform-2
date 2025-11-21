import defaultAttributes from "../db/mixins/attributes";

export default (sequelize, DataTypes) => {
	const SubCondition = sequelize.define("SubCondition", {
		...defaultAttributes,
		id: {
      type: DataTypes.BIGINT,
      allowNull: false,
			primaryKey: true,
			autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    speciesrelation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    condition_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "condition",
        key: "id"
      }
    }
	}, {
		tableName: "sub_condition"
	});

	SubCondition.associate = models => {
		SubCondition.Species = SubCondition.hasMany(models.SubConditionSpecies, {
			as: "species",
			foreignKey: "sub_condition_id"
		})
	}

	return SubCondition;
};
