/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('model_domain_access', {
    modelid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'model',
        key: 'id'
      }
    },
    userid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    creationdate: {
      type: DataTypes.DATE,
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
    tableName: 'model_domain_access'
  });
};
