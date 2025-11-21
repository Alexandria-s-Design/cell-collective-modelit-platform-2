import defaultAttributes from "../db/mixins/attributes"

export default (db) => {
    const Module = db.define("Module", {
      ...defaultAttributes
    });

		
    Module.associate = models => {
			Module.belongsTo(models.BaseModel);
		};

    return Module;
};