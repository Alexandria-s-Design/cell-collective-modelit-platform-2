export default (sequelize, DataTypes) => {
	const Condition = sequelize.define("Condition", {
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
    subconditionrelation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    regulator_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "regulator",
        key: "id"
      }
    }
	}, {
		tableName: "condition"
	});

	Condition.associate = models => {
		Condition.Species = Condition.hasMany(models.ConditionSpecies, {
			as: "species",
			foreignKey: "condition_id"
		})
	}

	return Condition;
};
