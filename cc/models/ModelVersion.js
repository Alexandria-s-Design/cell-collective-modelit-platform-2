import defaultAttributes from "../db/mixins/attributes"

export default (db, DataTypes) => {
    const ModelVersion = db.define("ModelVersion", {
      ...defaultAttributes,

      // Backward Compatibility
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      version: {
        type: DataTypes.BIGINT,
        primaryKey: true
      },
      description: {
        type: DataTypes.TEXT
      },
      modelid: {
        type: DataTypes.BIGINT,
        references: {
          model: "model",
          key: "id"
        }
      },
      userid: {
        type: DataTypes.BIGINT
      },
      creationdate: {
        type: DataTypes.DATE
      },
      name: {
        type: DataTypes.STRING
      },
      selected: {
        type: DataTypes.BOOLEAN
      }
    }, {
      tableName: "model_version"
    });

    ModelVersion.associate = models => {
      ModelVersion.hasMany(models.Annotation);
    }

    return ModelVersion
};