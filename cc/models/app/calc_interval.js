/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('calc_interval', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    experimentid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'experiment',
        key: 'id'
      }
    },
    from: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    to: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'calc_interval'
  });
};
