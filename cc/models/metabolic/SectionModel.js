
export default (db, DataTypes) => {
  return db.define('SectionModel', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
			autoIncrement: true,
			primaryKey: true,
    },
		pageModelId: {
			allowNull: true,
			type: DataTypes.BIGINT,
			references: {
				model: 'PageModel',
				key: 'id'
			}
		},
		title: {
			allowNull: true,
			type: DataTypes.STRING(200)
		},
		type: {
			allowNull: true,
			type: DataTypes.STRING(80)
		},
		position: {
			allowNull: true,
			type: DataTypes.INTEGER
		},
		creationdate: {
			type: DataTypes.DATE
		},
		creationuser: {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		updatedate: {
			type: DataTypes.DATE,
			allowNull: true
		},
		updateuser: {
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
		}

  }, {
    tableName: 'SectionModel'
  });
};