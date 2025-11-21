/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('initial_state_species', {
    initial_state_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'initial_state',
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
    tableName: 'initial_state_species'
  });
};
