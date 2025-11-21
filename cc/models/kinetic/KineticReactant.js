import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const KineticReactant = db.define("KineticReactant", {
		id: {
			allowNull: false,
			autoIncrement: true,
			primaryKey: true,
			type: DataTypes.INTEGER
		},
		KineticReactionId: {
			allowNull: false,
			type: DataTypes.INTEGER
		},
		KineticSpeciesId: {
			allowNull: false,
			type: DataTypes.INTEGER
		},
		stoichiometry: {
			type: DataTypes.INTEGER
		}
  });

  KineticReactant.associate = models => {

  };

  return KineticReactant;
};