
module.exports = function(sequelize, DataTypes) {
  const authority = sequelize.define(
    'Authority',
    {
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
				primaryKey: true
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
			tableName: 'authority'
    },
  );

  authority.associate = models => {
  };

  return authority;
};