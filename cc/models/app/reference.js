/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reference', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    creationdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    creationuser: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    pmid: {
      type: DataTypes.STRING,
      allowNull: true
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    updatedate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updateuser: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    shortcitation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    doi: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'reference'
  });
};
