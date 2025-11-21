/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('component_pair', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    firstcomponentid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'species',
        key: 'id'
      }
    },
    secondcomponentid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'species',
        key: 'id'
      }
    },
    delay: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    threshold: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'component_pair'
  });
};
