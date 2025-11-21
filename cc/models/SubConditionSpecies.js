export default (sequelize, DataTypes) => {
	const SubConditionSpecies = sequelize.define("SubConditionSpecies", {
		GeneId: {
			type: DataTypes.BIGINT,
			references: {
				model: "Gene",
				key: "id"
			}
		},

    sub_condition_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "sub_condition",
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
    tableName: "sub_condition_species"
	});
	
	return SubConditionSpecies;
};