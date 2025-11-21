import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
	const DosingRegimen = db.define("PKDosing", {
		...defaultAttributes,
		type: {
			type: DataTypes.ENUM("single", "multiple", "custom"),
		},
		route: {
			type: DataTypes.ENUM("iv", "od"),
		},
		amount: {
			type: DataTypes.FLOAT,
		},
		duration: {
			type: DataTypes.FLOAT,
		},
		interval: {
			type: DataTypes.FLOAT,
		},
		parameter_id: {
			type: DataTypes.BIGINT,
			references: {
				model: "PKParameter",
				key: "id"
			}
		},
	});

	DosingRegimen.associate = models => {

		DosingRegimen.belongsTo(models.PKParameter, {
			as: "parameter",
			foreignKey: "parameter_id"
		});
	}

	return DosingRegimen;
}