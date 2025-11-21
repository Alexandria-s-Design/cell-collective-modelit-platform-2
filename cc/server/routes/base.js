import path from "path";

import { Router } from "express";

import { PATH } from "../../config";

const router = Router();
// router.get("/", (req, res) => {
//     const filepath = path.join(PATH.PUBLIC, "index.html")
//     res.sendFile(filepath);
// });

export default router;