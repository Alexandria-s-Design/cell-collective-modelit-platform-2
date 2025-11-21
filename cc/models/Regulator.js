import defaultAttributes from "../db/mixins/attributes";

export default (db, DataTypes) => {
  const Regulator = db.define("Regulator", {
    ...defaultAttributes,
		// NOTE: Backward Compatibility
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		type: {
			type: DataTypes.ENUM("POSITIVE", "NEGATIVE"),
			allowNull: false,
			field: "regulationtype"
		},
		conditionrelation: {
			type: DataTypes.STRING,
			allowNull: true
		},
		regulator_species_id: {
			type: DataTypes.BIGINT,
			allowNull: true,
			references: {
				model: "species",
				key: "id"
			}
		},
		species_id: {
			type: DataTypes.BIGINT,
			allowNull: true,
			references: {
				model: "species",
				key: "id"
			}
		},
		position: {
      type: DataTypes.INTEGER
    }
  }, {
		tableName: "regulator"
	});

  Regulator.associate = (models) => {
		// Backward Compatibility
		// Regulator.belongsTo(models.Species, { sourceKey: "species_id", foriegnKey: "id" });

		Regulator.ReactionGene	= Regulator.belongsTo(models.ReactionGene, {
			as: "reactionGene",
			foreignKey: "ReactionGeneId"
		});
		Regulator.Conditions 		= Regulator.hasMany(models.Condition, {
			as: "conditions",
			foreignKey: "regulator_id"
		});
  }

  return Regulator;
};