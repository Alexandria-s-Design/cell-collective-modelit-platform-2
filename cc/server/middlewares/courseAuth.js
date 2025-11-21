import models from '../../models';
import Response from '../response';

export default (getCourseId) => (async (req, res, next) => {
	let _courseId = getCourseId(req);
	if (_courseId instanceof Promise) {
		_courseId = await _courseId;
	}
	if (!['number', 'string'].includes(typeof _courseId)) {
		const err = new Response();
		err.setError(Response.Error.UNPROCESSABLE_ENTITY, "Invalid course ID.");
		res.status(err.code).json(err.json);
		return;
	}
	let courseId;
	if (_courseId instanceof Promise) {
		courseId = await _courseId;
	} else {
		courseId = _courseId;
	}

	let course = courseId ? await models.Course.findOne({
		where: {
			id: courseId
		}
	}) : null;

	if (course === null) {
		const err = new Response();
		err.setError(Response.Error.NOT_FOUND, "Course not found");
		res.status(err.code).json(err.json);
	} else {
		if (parseInt(course._createdBy) === req.user.id) {
			req.course = course.id;
			next();
		} else {
			const err = new Response();
			err.setError(Response.Error.FORBIDDEN, "You are not the administrator of this course!");
			res.status(err.code).json(err.json);
		}
	}
});