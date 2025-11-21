/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('section', {
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
    position: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
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
    page_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'page',
        key: 'id'
      }
    }
  }, {
    tableName: 'section'
  });
};
