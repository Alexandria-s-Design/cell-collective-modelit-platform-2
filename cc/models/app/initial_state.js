/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('initial_state', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    creationdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    updatedate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    model_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'model',
        key: 'id'
      }
    }
  }, {
    tableName: 'initial_state'
  });
};
