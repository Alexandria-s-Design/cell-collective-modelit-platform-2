import { Router } from 'express';
import { getCourseUserReport } from '../../reports/course';

const router = new Router();


async function getReport(req){
	const courseId = req.params.courseId;
//	const { start_date, end_date } = req.body;
	if(!parseInt(courseId)){
		throw new Error("Model ID must be a number");
	}

	return await getCourseUserReport(courseId);
}
router.post('/:courseId/userReport', async(req,res) => {
	 const report = await getReport(req);
	 res.status(200).send(report);
});


export default router;
