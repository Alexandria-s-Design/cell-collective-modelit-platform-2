/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('model_score', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    citations: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    downloads: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    edits: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    lastcalculationdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    score: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    simulations: {
      type: DataTypes.INTEGER,
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
    tableName: 'model_score'
  });
};
