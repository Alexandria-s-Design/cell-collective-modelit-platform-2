/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('model_share', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    access: {
      type: DataTypes.STRING,
      allowNull: false
    },
    creationdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    updatedate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    userid: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    model_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    modellinkid: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'model_link',
        key: 'id'
      }
    }
  }, {
    tableName: 'model_share'
  });
};
