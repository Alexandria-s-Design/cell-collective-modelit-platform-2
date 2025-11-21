import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const Species = db.define("KineticSpecies", {
    ...defaultAttributes,
    species_id: {
      type: DataTypes.STRING
    },
		name: {
			type: DataTypes.STRING
		},
		initial_concentration: {
			type: DataTypes.FLOAT
		},
		unit_definition_id: {
			type: DataTypes.BIGINT,
			references: {
				model: 'UnitDefinitions',
				key: 'id'
			}
		},
  }, {
		tableName: 'KineticSpecies',
		name: {
			singular: 'KineticSpecies',
			plural: 'KineticSpecies'
		}
	});

  Species.associate = (models) => {
		Species.belongsTo(models.KineticCompartment);
		Species.belongsTo(models.KineticModel);
		Species.belongsTo(models.UnitDefinition, { foreignKey: 'unit_definition_id' });
	}

  return Species;
};