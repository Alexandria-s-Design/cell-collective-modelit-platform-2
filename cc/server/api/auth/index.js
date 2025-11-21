import { Router } from "express"
import AppService from "../../../service/app";
import GoogleRoute from "./google";
import FacebookRoute from "./facebook";
import LinkedInRoute from "./linkedin";

import LogoutRoute from "./logout";
import AuthLogin, { impersonateUserLogin} from "./login";

const router = Router();

router.use("/google", GoogleRoute);
router.use("/facebook", FacebookRoute);
router.use('/linkedin', LinkedInRoute);

router.use('/logout', LogoutRoute);
router.post('/login', AuthLogin);
router.post('/impersonate', impersonateUserLogin )

export default router;