import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
	const Compartment = db.define("PKCompartment", {
		...defaultAttributes,
		name: {
      type: DataTypes.TEXT
    },
		type: {
			type: DataTypes.ENUM("int", "ext") // internal or external
		},
		cmp: {
			type: DataTypes.ENUM("drug", "metabolite") // drug or metabolite
		},
		ext_type: {
			type: DataTypes.ENUM("in", "out") // input or output
		},
	});

	Compartment.associate = models => {
		Compartment.belongsTo(models.PharmacokineticModel);

		Compartment.hasMany(models.PKParameter);
	};
	return Compartment;
};