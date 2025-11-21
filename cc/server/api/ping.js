import { Router } from "express";

import { Response } from "../../server";
import { AuthRequired } from "../middlewares/auth";

const router = Router();

router.get("/", (req, res) => {
    const response = new Response();
    response.data  = "pong";

    res.status(response.code)
       .json(response.json);
});


export default router;