import defaultAttributes from "../db/mixins/attributes";

export default (db, DataTypes) => {
  const Species = db.define("Species", {
    ...defaultAttributes,
    speciesId: {
      type: DataTypes.STRING
    },

		// NOTE: Backward Compatibility
		id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			allowNull: false,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING,
			allowNull: true
		},
		creationdate: {
			type: DataTypes.DATE,
			allowNull: true
		},
		updatedate: {
			type: DataTypes.DATE
		},
		absentstate: {
			type: DataTypes.STRING
		},
		external: {
			type: DataTypes.BOOLEAN
		},
		model_id: {
			type: DataTypes.BIGINT,
			references: { model: "model", key: "id" },
			allowNull: true
		},
		position: {
      type: DataTypes.INTEGER
    }
  }, {
		tableName: "species" // NOTE: Backward Compatibility
	});

  Species.associate = (models) => {
    // Species.belongsToMany(models.Compartment, { through: "CompartmentSpecies" });
		
		// NOTE: Backward Compatibility
		Species.belongsTo(models.BaseModel, { foreignKey: "model_id" });
		// Species.belongsToMany(models.Condition, {
		// 	through: models.ConditionSpecies,
		// 	foreignKey: "species_id"
		// })
	}

  return Species;
};