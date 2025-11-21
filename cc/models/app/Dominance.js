/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('dominance', {
    negative_regulator_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'regulator',
        key: 'id'
      }
    },
    positive_regulator_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'regulator',
        key: 'id'
      }
    }
  }, {
    tableName: 'dominance'
  });
};
