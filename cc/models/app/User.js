/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      enabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'user',
    },
  );
  User.associate = models => {
    User.hasOne(models.Profile, { foreignKey: 'user_id' });
  };
  
  return User;
};
