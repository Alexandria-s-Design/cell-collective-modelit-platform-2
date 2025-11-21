import defaultAttributes from "../db/mixins/attributes";

export default (db, DataTypes) => {
  const Annotation = db.define("Annotation", {
    ...defaultAttributes,
    source: {
        type: DataTypes.STRING
    },
    annotations: {
        type: DataTypes.ARRAY(DataTypes.STRING)
    }
  });

  return Annotation;
};