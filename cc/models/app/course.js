/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('course', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    modelid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'model',
        key: 'id'
      }
    }
  }, {
    tableName: 'course'
  });
};
