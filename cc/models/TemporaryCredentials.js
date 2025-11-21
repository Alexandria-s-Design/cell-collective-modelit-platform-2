/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const TemporaryCredentials = sequelize.define(
    'TemporaryCredentials',
    {
			id: {
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			targetEmail: {
				allowNull: false,
				type: DataTypes.STRING
			},
			tempEmail: {
				allowNull: false,
				type: DataTypes.STRING
			},
			tempSecretKey: {
				allowNull: false,
				type: DataTypes.STRING
			},
			accessType: {
				allowNull: false,
				type: DataTypes.STRING(10)
			},
			accessCode: {
				allowNull: false,
				type: DataTypes.STRING(60)
			},
			usedAt: {
				allowNull: true,
				type: DataTypes.DATE
			},
			userTimezone: {
				allowNull: true,
				type: DataTypes.STRING(50),
				defaultValue: 'UTC',
			},
			userIp: {
				allowNull: true,
				type: DataTypes.STRING(45),
				validate: {	isIP: true	},
			},
			_deleted: {
				type: DataTypes.BOOLEAN,
			},
			_deletedAt: {
				type: DataTypes.DATE,
			},
			_updatedBy: {
				type: DataTypes.BIGINT,
			},
			_updatedAt: { 
				type: DataTypes.DATE,
			}
		},
    {
      tableName: 'TemporaryCredentials',
    },
  );

  TemporaryCredentials.associate = models => {
    
  };

  return TemporaryCredentials;
};
