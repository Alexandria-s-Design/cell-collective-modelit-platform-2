import defaultAttributes from "../db/mixins/attributes";

export default (db, DataTypes) => {
  const UserCourse = db.define('UserCourse', { ...defaultAttributes });

  UserCourse.associate = models => {
    models.User.belongsToMany(models.Course, { through: UserCourse });
    models.Course.belongsToMany(models.User, { through: UserCourse, as: 'users'  });
  };

  return UserCourse;
};
