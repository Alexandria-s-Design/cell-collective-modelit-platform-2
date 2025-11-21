import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const Modifier = db.define("KineticModifier", {
		type: DataTypes.ENUM(
			'activator',
			'inhibitor'
		)
  });

  Modifier.associate = (models) => {
	}

  return Modifier;
};