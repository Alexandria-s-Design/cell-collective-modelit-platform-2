/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('model_reference', {
    id: {
      type: DataTypes.BIGINT,
      defaultValue: sequelize.literal("nextval('public.model_reference_id_seq')"),
      primaryKey: true
    },
    creationdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    creationuser: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    model_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'model',
        key: 'id'
      }
    },
    reference_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'reference',
        key: 'id'
      }
    }
  }, {
    tableName: 'model_reference'
  });
};
