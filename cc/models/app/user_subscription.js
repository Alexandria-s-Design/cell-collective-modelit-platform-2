/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_subscription', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    userid: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    creationdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    expirationdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    modelssubmitted: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    tableName: 'user_subscription'
  });
};
