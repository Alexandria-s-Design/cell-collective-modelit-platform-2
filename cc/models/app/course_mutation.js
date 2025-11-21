/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('course_mutation', {
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
    state: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'course_mutation'
  });
};
