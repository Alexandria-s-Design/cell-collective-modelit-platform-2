import defaultAttributes from "../db/mixins/attributes";

export default (db, DataTypes) => {
  const BaseModel = db.define("BaseModel", {
    ...defaultAttributes,
    modelType: {
			type: DataTypes.ENUM("boolean", "metabolic", "kinetic", "pharmacokinetic"),
			field: "modeltype",
      defaultValue: "boolean"
		},
		// defaultVersion: {
		// 	type: DataTypes.BIGINT,
		// 	references: {
		// 		model: "ModelVersion",
		// 		key: "id"
		// 	}
		// },
		
		// Backward Compatible Attributes
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		userid: {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		originid: {
			type: DataTypes.BIGINT,
			allowNull: true
		},
		name: {
			type: DataTypes.STRING
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		published: {
			type: DataTypes.BOOLEAN
		},
		tags: {
			type: DataTypes.STRING,
			allowNull: true
		},
		author: {
			type: DataTypes.STRING,
			allowNull: true
		},
		cited: {
			type: DataTypes.INTEGER,
			allowNull: true
		},
		biologicupdatedate: {
			type: DataTypes.DATE
		},
		knowledgebaseupdatedate: {
			type: DataTypes.DATE,
			allowNull: true
		},
		components: {
			type: DataTypes.INTEGER
		},
		interactions: {
			type: DataTypes.INTEGER
		},
		type: {
			type: DataTypes.STRING
		},
		creationdate: {
			type: DataTypes.DATE
		},
		updatedate: {
			type: DataTypes.DATE
		},
		metadata: {
			type: DataTypes.BOOLEAN
		},
		prevOrigin: {
			type: DataTypes.BIGINT
		},
		is_reference: {
			type: DataTypes.BOOLEAN
		},
  }, {
		tableName: "model",
		defaultScope: {
			where: {
				_deleted: false
			}
		}
	});

  BaseModel.associate 	= models => {
    BaseModel.hasMany(models.ModelVersion, { foreignKey: "modelid" });
	};

  return BaseModel;
};