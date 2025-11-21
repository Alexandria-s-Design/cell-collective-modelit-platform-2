
const valueIdSeq = 'metadata.value_id_seq';

export default (db, DataTypes) => {
  const Value = db.define('Value', {
    id: {
			type: DataTypes.BIGINT,
			autoIncrement: true,
			primaryKey: true
    },
    definition_id: {
      type: DataTypes.BIGINT,
    },
		updatedate: {
      type: DataTypes.DATE,
    },
		position: {
      type: DataTypes.INTEGER,
    }
  }, {
		schema: 'metadata',
		tableName: "value"
	});

	Value.beforeCreate(async (entity, options) => {
		entity.id = db.queryInterface.sequelize.literal(`nextval('${valueIdSeq}')`);
		entity.updatedate = new Date();
	});

	Value.associate = models => {
		Value.hasMany(models.ValueText, {
			as: "ValueText",
			foreignKey: "value_id"
		})
	}

  return Value;
};
