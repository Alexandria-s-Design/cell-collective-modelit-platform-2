import defaultAttributes from "../db/mixins/attributes";

export default (db, DataTypes) => {
	const ModelContextData = db.define('ModelContextData', {
		...defaultAttributes,
		id: {
			type: DataTypes.BIGINT,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		modelContextId: {
			type: DataTypes.BIGINT,
			references: {
				model: 'ModelContext',
				key: 'id'
			}
		},
		dataType: {
			// EXCLUDE_REACTIONS, BOUNDARY_REACTIONS, CORE_REACTIONS and etc...
			type: DataTypes.STRING(35)
		},
		data: {
			type: DataTypes.JSONB
		}
	}, {
		tableName: "ModelContextData"
	});

	ModelContextData.associate = (models) => {
		
	}
	
	return ModelContextData;
}