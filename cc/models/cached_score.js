'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class cached_score extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  cached_score.init({
    modelid: DataTypes.BIGINT,
    score: DataTypes.DOUBLE,
    for: DataTypes.STRING,
		createdAt: DataTypes.TIME,
		updatedAt: DataTypes.TIME,
		courseid: DataTypes.BIGINT,
		objective: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'cached_score',
  });

	cached_score.customFindOrCreate = async function (params) {
		return new Promise(async (resolve, reject) => {
			if (!params) return reject('Please define params on customFindOrCreate');
			const transaction = params.transaction || null;
			const recordFound = await this.findAll({where: params.where, transaction});
			if (recordFound && recordFound.length) {
				return resolve( new Promise((rslv) => rslv(recordFound)) );
			}
			resolve(this.bulkCreate([params.defaults], {transaction}));
		});
	}

  return cached_score;
};