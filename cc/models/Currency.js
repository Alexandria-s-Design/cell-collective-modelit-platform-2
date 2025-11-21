import defaultAttributes from "../db/mixins/attributes"

export default (db, DataTypes) => {
    const Currency = db.define("Currency", {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        symbol: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    

    return Currency;
}