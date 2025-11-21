/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('experiment', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    creationdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    lastaccessdate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastrundate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    published: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    settings: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    shared: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    updatedate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    userid: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    model_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    courseid: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'course',
        key: 'id'
      }
    },
    updatetype: {
      type: DataTypes.STRING,
      allowNull: true
    },
    environmentid: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'analysis_environment',
        key: 'id'
      }
    },
    lastrunenvironmentid: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'analysis_environment',
        key: 'id'
      }
    },
		exper_type: {
			type: DataTypes.STRING(10),
		},
		err_msg: {
			type: DataTypes.STRING(200),
		},
		_updatedBy: {
			type: DataTypes.BIGINT,
		},
		_updatedAt: {
			type:  DataTypes.DATE,
		},
		_deletedAt: {
			type:  DataTypes.DATE,
		},
		_deleted: {
			type: DataTypes.BOOLEAN,
		}
  }, {
    tableName: 'experiment'
  });
};
