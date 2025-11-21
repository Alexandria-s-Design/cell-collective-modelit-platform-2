import defaultAttributes from "../db/mixins/attributes";

export default (db, DataTypes) => {
  const Course = db.define('Course', {
    ...defaultAttributes,
    title: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    startDate: {
      type: DataTypes.DATE,
    },
    endDate: {
      type: DataTypes.DATE,
    },
    published: {
      type: DataTypes.BOOLEAN,
      default: false,
    },
    codeKey: {
      type: DataTypes.STRING(60),
      unique: true,
    },
  }, {
		indexes: [
			{
				fields: ['codeKey'],
				unique: true
			}
		]
	});

  return Course;
};
