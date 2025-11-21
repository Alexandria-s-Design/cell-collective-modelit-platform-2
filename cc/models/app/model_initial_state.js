/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('model_initial_state', {
    modelid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'model',
        key: 'id'
      }
    },
    initialstateid: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'initial_state',
        key: 'id'
      }
    },
    layoutid: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'layout',
        key: 'id'
      }
    },
    workspacelayout: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    survey: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'model_initial_state'
  });
};
