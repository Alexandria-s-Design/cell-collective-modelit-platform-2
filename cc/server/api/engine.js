import { Router } from "express";
import Response from "../response";
import logger from "../../logger";

const router = new Router();

router.post("/", (req, res) => {
    const { code } = req.body;
    const response = new Response();

    try {
        // logger.info(`Evaluating code: ${code}`);

        var result = eval(code);
        response.data = result;
    } catch (e) {
        console.log(`Error while evaluating: ${code}, ${e}`)
    }

    res.status(response.code)
       .json(response.json)
})

export default router;