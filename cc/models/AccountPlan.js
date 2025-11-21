import defaultAttributes from '../db/mixins/attributes';

export default (db, DataTypes) => {
  const AccountPlan = db.define('AccountPlans', {
    ...defaultAttributes,
    name: {
      type: DataTypes.STRING,
    },
    length: {
      type: DataTypes.STRING,
    },
		studentRange: {
      type: DataTypes.INTEGER,
    },
		noOfStudentAccount: {
      type: DataTypes.INTEGER,
    },
    cost: DataTypes.INTEGER,
    permissions: DataTypes.JSON,
  });

  return AccountPlan;
};