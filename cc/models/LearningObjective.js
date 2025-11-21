'use strict';

export default (db, DataTypes) => {
    const LearningObjective = db.define("LearningObjective", {
      id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.BIGINT
			},
			versionId: {
        type: DataTypes.BIGINT,
      },
			version: {
        type: DataTypes.INTEGER
      },
			valueRefId: {
        type: DataTypes.BIGINT,
      },
      valueId: {
        type: DataTypes.BIGINT
      },
			_createdBy: {
				type: DataTypes.BIGINT,
				references: {
          model: 'user',
          key: 'id'
        }
			},
			_createdAt: {
				type: DataTypes.DATE
			}
    }, {
      tableName: "LearningObjective"
    });

    LearningObjective.associate = models => {
      //LearningObjective.hasMany(models.Annotation);
    }

    return LearningObjective
};