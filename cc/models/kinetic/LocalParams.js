import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const LocalParams = db.define("KineticLocalParams", {
    ...defaultAttributes,
    name: {
      type: DataTypes.STRING
    },
		value: {
			type: DataTypes.FLOAT
		},
		unit_definition_id: {
			type: DataTypes.BIGINT,
			references: {
				model: 'UnitDefinitions',
				key: 'id'
			}
		},
  });

  LocalParams.associate = (models) => {
		LocalParams.belongsTo(models.KineticLaw);
		LocalParams.belongsTo(models.UnitDefinitions, { foreignKey: 'unit_definition_id' });
	}

  return LocalParams;
};