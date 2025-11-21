/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('analysis_activity', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    parentid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'analysis_environment',
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
    min: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    max: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }, {
    tableName: 'analysis_activity'
  });
};
