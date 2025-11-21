/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('learning_activity', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    masterid: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    workspacelayout: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    views: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'learning_activity'
  });
};
