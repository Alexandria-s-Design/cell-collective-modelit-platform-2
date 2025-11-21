export default (sequelize, DataTypes) => {
	const ConditionSpecies = sequelize.define("ConditionSpecies", {
		GeneId: {
			type: DataTypes.BIGINT,
			references: {
				model: "Gene",
				key: "id"
			}
		},

		// Backward Compatibility
    condition_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "condition",
        key: "id"
      }
    },
    species_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "species",
        key: "id"
      }
		}
  }, {
    tableName: "condition_species"
	});
	
	return ConditionSpecies;
};