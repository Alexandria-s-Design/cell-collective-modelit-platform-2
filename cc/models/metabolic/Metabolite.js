import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const Metabolite = db.define("Metabolite", {
    ...defaultAttributes,
    name: {
      type: DataTypes.STRING
    },
    formula: {
      type: DataTypes.STRING
    },
    charge: {
      type: DataTypes.INTEGER
    }
  });

  Metabolite.associate = (models) => {
    Metabolite.belongsTo(models.Compartment);
    Metabolite.belongsTo(models.Species);
    
    Metabolite.belongsToMany(models.ConstraintBasedModel, {
      through: "MetaboliteConstraintBasedModel"
    });
    
    Metabolite.hasMany(models.Annotation);
  }

  return Metabolite;
};