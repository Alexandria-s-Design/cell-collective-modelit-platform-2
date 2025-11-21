import defaultAttributes from "../../db/mixins/attributes";


module.exports = function(sequelize, DataTypes) {
  return sequelize.define('DrugEnvironment', {
		...defaultAttributes,
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
			autoIncrement: true,
			primaryKey: true,
    },
		name: {
			type: DataTypes.STRING
		},
		isDefault: {
			type: DataTypes.BOOLEAN,
		},
		position: {
			type: DataTypes.INTEGER,
		},
		ConstraintBasedModelId: {
			type: DataTypes.BIGINT,
		}
  }, {
    tableName: 'DrugEnvironments'
  });
};
