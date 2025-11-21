'use strict';

export default (db, DataTypes) => {
    const LearningActivity = db.define("LearningActivity", {
      id: {
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
				type: DataTypes.BIGINT
			},
			masterid: {
        type: DataTypes.BIGINT,
      },
			position: {
        type: DataTypes.INTEGER,
      },
			version: {
        type: DataTypes.INTEGER
      }
    }, {
      tableName: "learning_activity"
    });

    LearningActivity.associate = models => {
      //LearningActivity.hasMany(models.Annotation);
    }

    return LearningActivity
};