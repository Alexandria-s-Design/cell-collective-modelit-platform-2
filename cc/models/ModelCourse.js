import defaultAttributes from "../db/mixins/attributes";

export default (db, DataTypes) => {
	const ModelCourse = db.define('ModelCourse', {
		...defaultAttributes 
	}, {
		tableName: "ModelCourse"
	});

	ModelCourse.associate = models => {
		models.BaseModel.belongsToMany(models.Course, { through: ModelCourse });
		models.Course.belongsToMany(models.BaseModel, { through: ModelCourse, as: 'models', otherKey: 'ModelId' });
	}
	
	return ModelCourse;
}