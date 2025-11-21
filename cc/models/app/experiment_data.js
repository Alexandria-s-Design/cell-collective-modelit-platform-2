/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('experiment_data', {
    experiment_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'experiment',
        key: 'id'
      }
    },
    simulation: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    calcintervalid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    }
  }, {
    tableName: 'experiment_data'
  });
};
