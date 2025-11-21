export default (db, DataTypes) => {

	const Tasks = db.define("Tasks", {
			id: {
				type: DataTypes.BIGINT,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			job: {
				type: DataTypes.STRING,
			},
			name: {
				type: DataTypes.STRING,
			},
			description: {
				type: DataTypes.STRING,
			},
			processId: {
				type: DataTypes.INTEGER,
			},
			progress: {
				type: DataTypes.SMALLINT,
			},
			//LOADING, DONE, WAITING
			state: {
        type: DataTypes.STRING(8),
      },
			startedAt: {
				type: DataTypes.DATE,
			},
			finishedAt: {
				type: DataTypes.DATE,
			},
			prevRun: {
				type: DataTypes.DATE,
			},
			nextRun: {
				type: DataTypes.DATE,
			},
			sleep: {
				type: DataTypes.BIGINT,
			},
			daysRun: {
				type: DataTypes.INTEGER,
			},
			priority: {
				type: DataTypes.SMALLINT,
			},
			failureMessage: {
				type: DataTypes.TEXT,
			},
			files: {
				type: DataTypes.TEXT,
			},
			executedBy: {
        type: DataTypes.BIGINT,
      },
			resultLogPath: {
        type: DataTypes.STRING,
      },
			resultData: {
        type: DataTypes.TEXT,
      },
			resultDataType: {
        type: DataTypes.STRING,
      },
			_updatedBy: {
				type: DataTypes.BIGINT
			},
			_updatedAt: { 
				type: DataTypes.DATE
			 },
			_deletedBy: { 
				type: DataTypes.BIGINT
			 },
			_deletedAt: {
				type: DataTypes.DATE
			},
			_deleted: {
				type: DataTypes.BOOLEAN
			}
		}, {
		tableName: "Tasks"
	});
	
	Tasks.associate = (models) => {
	}

  return Tasks;

}