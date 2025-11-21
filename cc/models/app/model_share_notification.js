/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('model_share_notification', {
    modelid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    modelshareid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'model_share',
        key: 'id'
      }
    },
    userid: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    creationdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'model_share_notification'
  });
};
