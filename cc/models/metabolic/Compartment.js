import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const Compartment = db.define("Compartment", {
    ...defaultAttributes,
    compartmentId: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    }
  });

  Compartment.associate = models => {
		// One-to-Many
    Compartment.belongsToMany(models.Species, { through: "CompartmentSpecies" });

    Compartment.hasMany(models.Annotation);
  } 

  return Compartment;
};