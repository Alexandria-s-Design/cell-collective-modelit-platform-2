/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('anonymous_user', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false
    },
    useragent: {
      type: DataTypes.STRING,
      allowNull: true
    },
    creationdate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'anonymous_user'
  });
};
