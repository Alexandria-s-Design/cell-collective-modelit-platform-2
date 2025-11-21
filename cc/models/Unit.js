import defaultAttributes from '../db/mixins/attributes';

export default (db, DataTypes) => {
  const Unit = db.define('Units', {
    ...defaultAttributes,
    name: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.ENUM(
				'ampere',
				'candela',
				'dimentionless',
				'kilogram',
				'kelvin',
				'litre',
				'metre',
				'mole',
				'second',
			),
    },
		multiplier: {
      type: DataTypes.INTEGER,
    },
		exponent: {
      type: DataTypes.INTEGER,
    },
		scale: {
			type: DataTypes.INTEGER
		}
  });

	Unit.associate = models => {
		Unit.belongsToMany(models.UnitDefinition, { through: 'UnitDefinition_Units'});
	}

  return Unit;
};
