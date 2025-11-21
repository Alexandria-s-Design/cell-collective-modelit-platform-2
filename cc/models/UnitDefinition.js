import defaultAttributes from '../db/mixins/attributes';

export default (db, DataTypes) => {
  const UnitDefinition = db.define('UnitDefinitions', {
    ...defaultAttributes,
    name: {
      type: DataTypes.STRING,
    },
  });

	UnitDefinition.associate = models => {
		UnitDefinition.belongsToMany(models.KineticModel, { through: 'KineticUnits'});

		UnitDefinition.belongsToMany(models.Unit, { through: 'UnitDefinition_Units'});
	}

  return UnitDefinition;
};

