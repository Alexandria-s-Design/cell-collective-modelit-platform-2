'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LearningObjectiveAssoc extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  LearningObjectiveAssoc.init({
    origin: DataTypes.INTEGER,
    sub: DataTypes.INTEGER,
		modelid: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'LearningObjectiveAssoc',
  });
  return LearningObjectiveAssoc;
};