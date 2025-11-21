import defaultAttributes from "../db/mixins/attributes"

export default (db, DataTypes) => {
    const Country = db.define("Country", {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        abbreviation: {
            type: DataTypes.STRING,
            unique: true
        }
    });

    Country.associate = models => {
        Country.belongsTo(models.Currency);
        Country.belongsToMany(models.Language, { through: models.CountryLanguages });
    };

    return Country;
};