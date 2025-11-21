export default (db, DataTypes) => {
  const KineticLawType = db.define("KineticLawType", {
    type: {
      type: DataTypes.STRING
    },
  });

  KineticLawType.associate = (models) => {
		KineticLawType.hasMany(models.KineticLaw);
	}

  return KineticLawType;
};