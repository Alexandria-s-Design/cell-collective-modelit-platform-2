/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('realtime_activity', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    parentid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'realtime_environment',
        key: 'id'
      }
    },
    componentid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'species',
        key: 'id'
      }
    },
    value: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }, {
    tableName: 'realtime_activity'
  });
};
