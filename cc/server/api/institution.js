import { Router } from 'express'
import { pick } from "lodash"
import models, { db } from "../../models"
import Response from '../response'
import ResourceFactory from "./factory/rest/resource"
import logger from '../../logger'

const router = new Router()
router.post("/create", async (req, res) => {
    const response = new Response()
    let transaction
    try {
        const data = {
            ...pick(req.body,
                [
                    'name',
                    'category',
                    'city',
                    'country',
                    'state',
                    'domains',
                    'websites',
                ]
            ),
            _createdAt: models.Sequelize.fn('NOW'),
            _updatedAt: models.Sequelize.fn('NOW'),
        }
        transaction = await db.sequelize.transaction()
        const resource = (await models.Institution.create(data, { transaction: transaction })).get()
        await transaction.commit()

        response.type = Response.HTTP.CREATED
        response.data = resource
    } catch (err) {
        logger.error("Error creating institution: ", err)
        if (transaction) {
            await transaction.rollback()
        }
        response.setError(Response.Error.INTERNAL_SERVER_ERROR, err.message)
    }
    res.status(response.code).json(response.json)
})

router.get("/search", async (req, res) => {
	const response = new Response();
	const size = 30;

	try {
		const institutions = await models.Institution.findAll({
			where: {
				name: {
					[models.Sequelize.Op.iLike]: `%${req.query.q}%`,
				},
			},
		});
		const data = institutions.map((institution) => ({
				id: institution.id,
				name: institution.name,
				city: institution.city,
				state: institution.state,
				country: institution.country,
				domains: institution.domains,
				websites: institution.websites,
		}));

		response.data = { name: "Institution", size: size, data: data };
	} catch (e) {
		response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
	}

	res.status(response.code).json(response.json);
});

export default ResourceFactory("Institution", { skipRoutes: ['post', 'search'], middlewares: router })
