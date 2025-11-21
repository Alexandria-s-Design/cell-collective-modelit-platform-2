import { Router } from "express";
import ccBooleanAnalysis from "ccbooleananalysis";

import Response from "../response";

const router = Router();

router.post("/regulator", (req, res) => {
    const response = new Response();
		const { expr } = req.body;

    try {
			const result  = ccBooleanAnalysis.getBiologicalConstructs(expr);
			response.data = result;
    } catch (err) {
			console.error(err);
      response.setError(Response.Error.INTERNAL_SERVER_ERROR, err.message);
    }

    res.status(response.code)
       .json(response.json);
});

router.post("/compare",   (req, res) => {
    const response         = new Response();
    const { expr1, expr2 } = req.body;
    
    try {
			const result  = ccBooleanAnalysis.compareBooleansSAT(expr1, expr2);
			response.data = result;
    } catch (err) {
      response.setError(Response.Error.INTERNAL_SERVER_ERROR, err.message);
    }

    res.status(response.code)
       .json(response.json);
});

export default router;