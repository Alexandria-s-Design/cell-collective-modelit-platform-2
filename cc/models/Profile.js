/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const profile = sequelize.define(
    'Profile',
    {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      firstname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      institution: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
			institution_id: {
				type: DataTypes.BIGINT,
				allowNull: true
			},
			alternateEmails: {
				type: DataTypes.ARRAY(DataTypes.STRING),
				allowNull: true
			},
			avatarUri: {
				type: DataTypes.STRING,
				allowNull: true
			},
			thirdPartyId: {
				type: DataTypes.STRING(255),
				allowNull: true
			},
			thirdPartyType: {
				type: DataTypes.STRING(50),
				allowNull: true
			}
    },
    {
      tableName: 'profile',
    },
  );

  profile.associate = models => {
    profile.belongsTo(models.User, { foreignKey: 'user_id', targetKey: 'id' });
		profile.belongsTo(models.Institution, { foreignKey: 'institution_id', targetKey: 'id', constraints: false });
  };

  return profile;
};
