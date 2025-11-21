module.exports = function(sequelize, DataTypes) {
  return sequelize.define('PageModelReference', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
			autoIncrement: true,
      primaryKey: true
    },
		pageModelId: {
			allowNull: false,
			type: DataTypes.BIGINT,
			references: {
				model: 'PageModel',
				key: 'id'
			}
		},
		referenceId: {
			allowNull: false,
			type: DataTypes.BIGINT,
			references: {
				model: 'reference',
				key: 'id'
			}
		},
		creationdate: {
			type: DataTypes.DATE
		},
		creationuser: {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		_deletedBy: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		_deletedAt: {
			type: DataTypes.DATE,
			allowNull: true
		},
		_deleted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},

  }, {
    tableName: 'PageModelReference'
  });
};
