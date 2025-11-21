import defaultAttributes from "../db/mixins/attributes";

export default (db, DataTypes) => {
  const UserCourse = db.define('UserCoursesUnenroll', {
		userId: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		courseId: {
			type: DataTypes.BIGINT,
			allowNull: false
		},
		 ...defaultAttributes
	}, {
		freezeTableName: true
	});

  return UserCourse;
};
