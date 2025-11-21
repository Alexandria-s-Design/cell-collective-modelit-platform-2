import { Router } from 'express';
import Response from "../response";
import DataBase from '../../db';
import { getenv } from '../../util/environment';
import { AuthRequired } from '../middlewares/auth';
import getModuleReport, { getCourseUserReport } from '../../reports/course';
import { reportToCSV } from '../../util/report';

const router = new Router();
const db = new DataBase(getenv('DATABASE_NAME'));

{/*
	// implemented for client side course report performance, handles permission
	router.get('/:id/isOwner', AuthRequired, async(req, res) => {
	const response = new Response(); 
	try{
		const userId = req.session.user.id;
		const modelId = req.params.id;
		let owner = await db.query(`Select "_createdBy" from "ModelCourse" where "ModelId"=${modelId}`);
		// a lesson can be added by many instructors, find the corresponding user
		owner = owner.map(id => id._createdBy);
		const data = owner.includes(String(userId));

		response.data = data;
	}catch(e){
		console.log(e);
		response.setError(Response.Error.INTERNAL_SERVER_ERROR, e.toString());
	}
	res.status(response.code).json(response.json);
}) 
*/}


async function getReport(req){
	const  modelId  = req.params.id;
	const courseId = req.params.courseId;
	const { start_date, end_date } = req.body;
	if(!parseInt(modelId)){
		throw new Error("Model ID must be a number");
	}

	return await getModuleReport(modelId, {startDate:start_date, endDate:end_date}, courseId);
}

router.post('/:id/:courseId/report', async(req,res) => {
	const report = await getReport(req);
	res.status(200).send(report.data);
});


router.post('/:id/:courseId/report/csv', async(req,res) => {
	const report = await getReport(req);
	const filename = "Report";
	const csv = reportToCSV(report)

	res.setHeader('Content-Disposition', `attachement; filename=${filename}.csv`);
	res.set('Content-Type', 'text/csv');
	res.status(200).send(csv);
});

export default router;
