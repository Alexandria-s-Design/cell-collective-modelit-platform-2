import defaultAttributes from "../db/mixins/attributes";

export default (db, DataTypes) => {
	const ModelContext = db.define('ModelContext', {
		...defaultAttributes,
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		contextType: {
			// iMAT, GIMME, FAST and etc...
			type: DataTypes.STRING
		},
		modelId: {
			type: DataTypes.BIGINT,
			references: {
				model: 'model',
				key: 'id'
			}
		},
		modelOriginId: {
			type: DataTypes.BIGINT,
			references: {
				model: 'model',
				key: 'id'
			}
		},
		uploads: {
			type: DataTypes.JSONB
		},
		downloads: {
			type: DataTypes.JSONB
		},
		settings: {
			allowNull: false,
			type: DataTypes.JSONB
		}
	}, {
		tableName: "ModelContext"
	});

	ModelContext.associate = (models) => {
		
	}
	
	return ModelContext;
}