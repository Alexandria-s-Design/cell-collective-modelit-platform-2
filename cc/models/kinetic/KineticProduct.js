import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const KineticProduct = db.define("KineticProduct", {
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

  KineticProduct.associate = models => {
  };

  return KineticProduct;
};