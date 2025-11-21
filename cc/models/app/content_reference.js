/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('content_reference', {
    id: {
      type: DataTypes.BIGINT,
      defaultValue: sequelize.literal("nextval('public.content_reference_id_seq')"),
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
    content_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'content',
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
    },
    datatype: {
      type: DataTypes.STRING,
      allowNull: true
    },
    citationtype: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'content_reference'
  });
};
