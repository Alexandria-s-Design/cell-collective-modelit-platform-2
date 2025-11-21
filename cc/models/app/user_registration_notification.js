/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_registration_notification', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    creationdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'user_registration_notification'
  });
};
