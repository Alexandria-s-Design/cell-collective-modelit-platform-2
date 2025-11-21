import defaultAttributes from "../db/mixins/attributes"

export default (db, DataTypes) => {
    const ModelStartedLesson = db.define("ModelStartedLesson", {
      ...defaultAttributes,
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
			modelId: {
				type: DataTypes.BIGINT,
        references: {
          model: "model",
          key: "id"
        }
      },
      courseId: {
				type: DataTypes.BIGINT,
        references: {
          model: "Courses",
          key: "id"
        }
      },
			canceled: {
				allowNull: true,
        type: DataTypes.SMALLINT
      },
			canceledMsg: {
				allowNull: true,
        type: DataTypes.STRING(200)
      },
			submitted: {
				allowNull: true,
        type: DataTypes.BOOLEAN,
      },
			submittedAt: {
				allowNull: true,
        type: DataTypes.DATE
      }
    }, {
      tableName: "ModelStartedLesson"
    });

    ModelStartedLesson.associate = models => {
			ModelStartedLesson.belongsTo(models.BaseModel, {
				as: "model",
				foreignKey: "modelId"
			})
			ModelStartedLesson.belongsTo(models.model_initial_state, {
				as: "model_initial_state",
				foreignKey: "modelId"
			})
    }

    return ModelStartedLesson;
};