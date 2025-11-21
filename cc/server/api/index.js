import { Router } from 'express';

import PingRoute from "./ping";
import PMIDRoute from "./pmid";
import NCBIRoute from "./ncbi";
import UserRoute from "./user";
import ModelRoute from "./model";
import ModuleRoute from "./module";
import CourseRoute from "./teach/course";
import InstitutionRoute from "./institution";
import PlanRoute from "./plan";
import SystemRoute from "./system";
import AuthRoute from "./auth";

import BooleanAnalysisRoute from './boolean';
import ModelReportRoute from './modelReport';
import CourseReportRoute from './courseReport';

import EngineRoute from "./engine";

import ManageSubscriptionRoute from "./manageSubscription";
import KineticLawsRoute from "./kineticLaws";

const router = Router();

router.use('/ping', PingRoute);
router.use('/pmid', PMIDRoute);
router.use('/ncbi', NCBIRoute);

router.use("/users",     		UserRoute);
router.use("/boolean",   	 	BooleanAnalysisRoute);
router.use("/institution", 	InstitutionRoute);
router.use("/model", 				ModelRoute);

router.use("/course",  	CourseRoute);
router.use("/module",  	ModuleRoute);
router.use("/plan", 		PlanRoute);
router.use("/system", 	SystemRoute);
router.use('/course-report', CourseReportRoute);
router.use('/model-report', ModelReportRoute);

router.use('/_engine', EngineRoute);
router.use('/auth', 	 AuthRoute);
router.use('/kineticlaws', 	 KineticLawsRoute);

router.use('/manage-subscription', ManageSubscriptionRoute);

export { router };
