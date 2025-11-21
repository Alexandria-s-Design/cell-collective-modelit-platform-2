/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('layout_node', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    componentid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'species',
        key: 'id'
      }
    },
    layoutid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'layout',
        key: 'id'
      }
    },
    x: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    y: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }, {
    tableName: 'layout_node'
  });
};
