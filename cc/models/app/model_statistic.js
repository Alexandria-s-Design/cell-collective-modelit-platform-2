/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('model_statistic', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    creationdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    metadata: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userid: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    model_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    }
  }, {
    tableName: 'model_statistic'
  });
};
