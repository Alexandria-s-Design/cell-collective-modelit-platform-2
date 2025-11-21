/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('registration', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    activationcode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    activationdate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    registrationdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    }
  }, {
    tableName: 'registration'
  });
};
