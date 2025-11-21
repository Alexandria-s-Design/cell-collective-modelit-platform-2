/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const UserCCApp = sequelize.define(
    'UserCCApp',
    {
			id: {
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			user_id: {
				type: DataTypes.BIGINT,
			},
			user_ccapp_id: {
				type: DataTypes.UUID,
			},
			password_pending_update: {
				type: DataTypes.BOOLEAN,
			},
			_updatedBy: {
				type: DataTypes.BIGINT,
			},
			_updatedAt: { 
				type: DataTypes.DATE,
			}
		},
    {
      tableName: 'users_ccapp',
    },
  );

  UserCCApp.associate = models => {
    
  };

  return UserCCApp;
};
