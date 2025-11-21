/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('realtime_environment', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    modelid: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    userid: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    tableName: 'realtime_environment'
  });
};
