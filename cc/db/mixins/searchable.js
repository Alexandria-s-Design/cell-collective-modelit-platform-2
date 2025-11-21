import { Op } from "sequelize";

import search from "../../search";
import { excludeAttributes } from "../../server/api/factory/rest/util";

// TEMPORARY
search.indices.delete({ index: 'cc' });

const createDocuments = async (model, { attributes = [ ] } = { }) => {
    const name = model.options.name.singular;

    if ( Array.isArray(attributes) ) {
        attributes = { include: attributes, exclude: [ ] };
    } else {
        if ( !attributes.include ) {
            attributes.include = [ ];
        }
        if ( !attributes.exclude ) {
            attributes.exclude = [ ];
        }
    }

    let resources = await model.findAll({
        attributes: {
            include: [...attributes.include],
            exclude: [...attributes.exclude]
        },
        where: {
            [Op.and]: [
                {
                    _deleted: false
                }
            ]
        }
    });
    resources      = resources.map(resource => excludeAttributes(resource.get()));
    if ( !(await search.indices.exists({ index: "cc" })) ) {
        await search.indices.create({ index: "cc" });
    }

    for ( let resource of resources ) {
        try {
						if (resource.category === null) {
							resource.category = '';
						}
            await search.index({
                index: "cc",
                   id: `${resource.id}`,
                 type: name,
                 body: resource
            });
        } catch (e) {
            throw e
        }
    }
}

const saveDocument    = async (model, { attributes = [ ] } = { }) => {
//		console.log("save document", model);
/*		if(model._deleted){
			//not awaiting to speed it up
			search.documents.destroy({ id: model.id })
		}else{
			const data = excludeAttributes(model.get());
			const name = data.name;
			console.log({
				index: "cc",
				id: model.id,
				type: name,
				body: data
			})

			try{
			//not awaiting to speed it up
			await search.index({
				index: "cc",
				id: model.id,
				type: name,
				body: data
			});
		}catch(e){
			console.error(e);
			process.exit(1);
		}
		}
*/
};

const deleteDocument = async model => search.documents.destroy({ id: model.id });

export default (model, { attributes = { } } = { }) => {
    createDocuments(model, attributes);

    model.addHook("afterCreate" , async instance => await saveDocument(instance, attributes));
    model.addHook("afterUpdate" , async instance => await saveDocument(instance, attributes));
    model.addHook("afterDestroy", async instance => await deleteDocument(instance, attributes));

    return model;
}
