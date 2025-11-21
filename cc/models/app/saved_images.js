'use strict';
module.exports = (sequelize, DataTypes) => {
  const saved_images = sequelize.define('saved_images', {
    file: DataTypes.STRING,
    type: DataTypes.STRING,
		timestamp: DataTypes.DATE
		// createdAt: {
		// 	type: DataTypes.DATE
		// },
		// updatedAt: {
		// 	type: DataTypes.DATE
		// },
  }, {});
  saved_images.associate = function(models) {
    saved_images.belongsTo(models.Profile, { foreignKey: "profileId", targetKey: "id" });
    saved_images.belongsTo(models.BaseModel);
  };
  return saved_images;
};