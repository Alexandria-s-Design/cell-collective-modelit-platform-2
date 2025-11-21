/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sub_condition_species', {
    sub_condition_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'sub_condition',
        key: 'id'
      }
    },
    species_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'species',
        key: 'id'
      }
    }
  }, {
    tableName: 'sub_condition_species'
  });
};
