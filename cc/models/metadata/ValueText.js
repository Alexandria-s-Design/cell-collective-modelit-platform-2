
export default (db, DataTypes) => {
  const ValueText = db.define('ValueText', {
    value_id: {
			type: DataTypes.BIGINT,
			primaryKey: true,
			allowNull: true
    },
    value: {
      type: DataTypes.TEXT,
    }
  }, {
		schema: 'metadata',
		tableName: "value_text"
	});

	ValueText.associate = models => {
		ValueText.belongsTo(models.Value, {
			as: "Value",
			foreignKey: "value_id",
			targetKey: 'id'
		});
	}

  return ValueText;
};
