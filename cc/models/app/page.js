/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('page', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    creationdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    creationuser: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    updatedate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updateuser: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    tableName: 'page'
  });
};
