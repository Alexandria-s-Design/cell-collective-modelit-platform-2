import defaultAttributes from "../db/mixins/attributes"

export default (db, DataTypes) => {
    const log = db.define("logs", {
        ...defaultAttributes,
        type: {
            type: DataTypes.STRING
        },
        action: {
            type: DataTypes.STRING
        },
        transaction_uuid: DataTypes.STRING,
        message: DataTypes.JSON
    })

    return log
}