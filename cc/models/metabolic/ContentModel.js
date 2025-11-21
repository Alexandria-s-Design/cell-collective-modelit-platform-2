
export default (db, DataTypes) => {
  return db.define('ContentModel', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
			autoIncrement: true,
			primaryKey: true,
    },
		sectionModelId: {
			allowNull: true,
			type: DataTypes.BIGINT,
			references: {
				model: 'SectionModel',
				key: 'id'
			}
		},
		flagged: {
			allowNull: true,
			type: DataTypes.BOOLEAN
		},
		text: {
			allowNull: true,
			type: DataTypes.TEXT
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
    tableName: 'ContentModel'
  });
};