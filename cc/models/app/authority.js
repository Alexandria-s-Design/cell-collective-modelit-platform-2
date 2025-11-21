/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('authority', {
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    role_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'role',
        key: 'id'
      }
    }
  }, {
    tableName: 'authority'
  });
};
