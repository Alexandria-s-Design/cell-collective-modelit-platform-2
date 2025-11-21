import { Router } from "express";

import Response from "../../response";
import { PATH } from "../../../const";
import logger from "../../../logger";

const router = Router();

router.post("/", async (req, res) => {
    const response = new Response();

		logger.info(`Attempting to Logout...`)

    try {
        req.session.destroy(() => {
            logger.info(`Successfully destroyed session. Resetted to ${JSON.stringify(req.session)}`)
        });
    } catch (e) {
        response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
    }
    
    res.status(response.code)
       .json(response.json);
});

export default router;