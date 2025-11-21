/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('course_activity', {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    courserangeid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'course_range',
        key: 'id'
      }
    },
    speciesid: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'species',
        key: 'id'
      }
    },
    value: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    min: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    max: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }, {
    tableName: 'course_activity'
  });
};
