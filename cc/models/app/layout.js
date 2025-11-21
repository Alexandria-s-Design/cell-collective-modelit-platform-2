/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('layout', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    top: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    bottom: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    left: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    right: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    creationdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    modelid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'model',
        key: 'id'
      }
    }
  }, {
    tableName: 'layout'
  });
};
