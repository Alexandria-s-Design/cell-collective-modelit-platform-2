import { Router } from 'express';
import Response from '../response';
import fs from 'fs';
import models from '../../models';
import LoggerService from "../../service/logger";

const KEY_LOGGER = "IUr2WAEQ4Z";

const router = Router();
router.get('/changelog', (req, res) => {
  const response = new Response();
  const changelog = fs.readFileSync(__dirname + '/../../../CHANGELOG.md', 'utf8');
  response.data = changelog;

  res.status(response.code).json(response.json);
});


router.post("/logger",  async (req, res) => {
    const response = new Response();
    try {
			const log = req.body;
			if (log.keyID != KEY_LOGGER) {
				throw new Error('The access KEY is not allowed.')
			}
			delete log.keyID;
			await models.sequelize.query(
				`INSERT INTO "logs" ("type","action","message")
				VALUES ('APPROVAL', 'SEND_REQUEST', '${JSON.stringify(log)}')`,
			{
				type: "INSERT"
			});
    } catch (err) {
      response.setError(Response.Error.BAD_REQUEST, err.message);
    }
    res.status(response.code).json(response.json);
});

export default router;
