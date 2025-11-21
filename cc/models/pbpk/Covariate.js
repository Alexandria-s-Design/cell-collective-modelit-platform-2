import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
	const Covariate = db.define("PKCovariate", {
		...defaultAttributes,
		name: {
			type: DataTypes.TEXT
		},
		type: {
			type: DataTypes.ENUM("body-weight", "age", "creatine", "custom")
		},
		function_id: {
			type: DataTypes.BIGINT,
			references: {
				model: "Functions",
				key: "id"
			}
		},
		parameter_id: {
			type: DataTypes.BIGINT,
			references: {
				model: "PKParameters",
				key: "id"
			}
		},
	});

	Covariate.associate = models => {
		Covariate.belongsTo(models.PKParameter, {
			foreignKey: "parameter_id"
		});
		Covariate.belongsTo(models.Function, {
			foreignKey: "function_id"
		});
	};

	return Covariate;
};