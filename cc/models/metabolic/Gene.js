import defaultAttributes from "../../db/mixins/attributes";

export default (db, DataTypes) => {
  const Gene = db.define("Gene", {
		...defaultAttributes,
		// functional: {
		// 	type: DataTypes.BOOLEAN,
		// 	defaultVal: true
		// }
		position: {
      type: DataTypes.INTEGER
    }
  });

  Gene.associate = (models) => {
    Gene.belongsTo(models.Species);
		Gene.hasMany(models.Annotation);
  }
  return Gene;
};