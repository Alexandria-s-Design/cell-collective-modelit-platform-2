module.exports = (sequelize, DataTypes) => {
  const learning_activity_group = sequelize.define('learning_activity_group', {
    name: DataTypes.STRING,
    position: DataTypes.INTEGER,
    masterid: DataTypes.BIGINT
  }, {});
  learning_activity_group.associate = function(models) {
    // associations can be defined here
  };
  return learning_activity_group;
};