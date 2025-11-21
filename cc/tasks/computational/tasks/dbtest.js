import registerTask from '../../task';
import {NODE} from '../consts';

import models from "../../../models";

export default registerTask(NODE, "dbtest", async ({limit = 1} = {}) => {

    const model = models.BaseModel;


    console.log("DB RUN START");

    let { count, rows: resources } = await model.findAndCountAll({
        limit
    });

    console.log("DB RUN SUCCESS");


    return {
        count,
        resources
    };
});