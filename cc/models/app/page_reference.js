/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('page_reference', {
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
    page_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'page',
        key: 'id'
      }
    },
    reference_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'reference',
        key: 'id'
      }
    }
  }, {
    tableName: 'page_reference'
  });
};
