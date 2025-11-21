import defaultAttributes from "../db/mixins/attributes"

export default (db) => {
    const Model = db.define("CountryLanguages", {
        ...defaultAttributes,
    });

    return Model;
}