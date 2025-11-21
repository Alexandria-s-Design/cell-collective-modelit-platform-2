
export default (db, DataTypes) => {
  const EntityValue = db.define('EntityValue', {
    value_id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			allowNull: true
    },
		entity_id: {
			type: DataTypes.BIGINT,
			allowNull: true
    },
  }, {
		schema: 'metadata',
		tableName: "entity_value"
	});

  return EntityValue;
};
