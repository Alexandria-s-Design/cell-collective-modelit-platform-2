import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const KineticGlobalParams = db.define("KineticGlobalParams", {
    ...defaultAttributes,
    name: {
      type: DataTypes.STRING
    },
    parameter_id: {
      type: DataTypes.STRING,
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

  KineticGlobalParams.associate = (models) => {
    KineticGlobalParams.belongsTo(models.KineticModel);
    KineticGlobalParams.belongsTo(models.UnitDefinitions, { foreignKey: 'unit_definition_id' });
  }

  return KineticGlobalParams;
};
