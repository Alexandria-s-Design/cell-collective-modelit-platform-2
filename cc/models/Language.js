import defaultAttributes from "../db/mixins/attributes"

export default (db, DataTypes) => {
    const Language = db.define("Language", {
        ...defaultAttributes,
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        code: {
            type: DataTypes.STRING
        },
        nativeName: {
            type: DataTypes.STRING
        }
    });

    

    return Language;
}