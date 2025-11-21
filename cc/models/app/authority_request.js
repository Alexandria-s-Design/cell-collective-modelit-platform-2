/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('authority_request', {
    userid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    roleid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false
    },
    creationdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    approvaldate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejectiondate: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'authority_request'
  });
};
