/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('content', {
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
    flagged: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    section_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'section',
        key: 'id'
      }
    }
  }, {
    tableName: 'content'
  });
};
