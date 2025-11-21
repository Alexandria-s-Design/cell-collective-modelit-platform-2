import logger from '../../logger';
import models from '../../models'
import { getBaseModelJSON } from "../../server/api/model"

export default async (job, done) => {
	const mModels	= await models.BaseModel.findAll({
		where: {
			modelType: ["metabolic", "kinetic", "pharmacokinetic"],
			 _deleted: [false, null],
			published: true
		},
		order: [
			["_createdAt", "DESC"]
		]
	});

	logger.info(`Caching ${mModels.length} Models...`)

	for ( let i = 0; i < mModels.length; ++i ) {
		const m = mModels[i];
		job.progress( Math.round((i + 1) / mModels.length, 2) );
		await getBaseModelJSON(m.id, { shallow: false, slim: true });
	}

	done()
}