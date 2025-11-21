import defaultAttributes from "../db/mixins/attributes"

export default (db, DataTypes) =>
    db.define("Response", {
        ...defaultAttributes,
        responseID: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        code: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false
        },
        data: {
            type: DataTypes.JSON
        },
        error: {
            type: DataTypes.JSON
        }
    });