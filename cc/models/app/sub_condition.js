/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sub_condition', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    speciesrelation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    condition_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'condition',
        key: 'id'
      }
    }
  }, {
    tableName: 'sub_condition'
  });
};
