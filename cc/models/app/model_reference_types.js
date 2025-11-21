/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('model_reference_types', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    modelid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'model',
        key: 'id'
      },
      unique: true
    },
    referenceid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'reference',
        key: 'id'
      }
    },
    citationtype: {
      type: DataTypes.STRING,
      allowNull: true
    },
    datatype: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'model_reference_types'
  });
};
