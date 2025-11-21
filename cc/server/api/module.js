import { response, Router } from 'express';
import fileUpload from 'express-fileupload';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { Seq } from 'immutable';
import moment from 'moment';
import JSZip from 'jszip';

import models, {db} from "../../models"

import ResourceFactory from './factory/rest/resource';
import Response from '../response';
import { AuthRequired } from '../middlewares/auth';
import { PATH, PLATFORM, UPLOAD } from '../../const';
import getModuleReport from '../../reports/course';
import { reportToCSV } from '../../util/report';
import { getStudentScores, getStudentCoursePercentile, getInstitutionPercentile,
	getAllInstitutionsPercentile, getModuleScoreForCourse, getPeerInstitutionsPercentile, getInstructorScore } from './scoreCache';
import Lesson from './manageModules/Lesson';
import Scores from './manageModules/Scores';
import Survey from './manageModules/Survey';
import Subscription from './manageSubscription/Subscription';
import attributes from '../../db/mixins/attributes';
import Version from './manageModel/Version';
import logger from "../../logger";
import CodeValidation from './manageModelIt/CodeValidation';
import TemporaryCredentials, { AnonymousUserModelIt, TEMP_ACCESS_TYPE } from './manageUser/TemporaryCredentials';
import ModelItLessonLink from './manageModelIt/ModelItLessonLink';
import { getenv } from "../../util/environment";
import DateTimeUtil from '../../util/DateTimeUtil';

const router = Router();
const AssignCreateScores = (id) => (new Scores(models)).createScoresByLessonId(id);


router.get('/:id/report', AuthRequired, async (req, res) => {
  const { id } = req.params;
  const { start_date, end_date, for_domain, course, isPublic } = req.query;

	if(!parseInt(id)){
			throw new Error("Model ID must be a number");
	}

	const versions = await models.ModelVersion.findAll({
		where: {
			modelid: id,
		},
		order: [
			['selected', 'desc'],
			['version', 'desc']
		]
	});

	if (versions.length === 0) {
		const response = new Response();
		response.setError(Response.Error.NOT_FOUND, "No module with ID " + id)
		res.status(response.code).json(response.json);
		return;
	}

	// If model belongs to an instructor:
	//  Proceed.
	// If to a student:
	//  Use get_original_lesson to get the instructor's copy (could be a copy made by the instructor or the original, depending on which one the teacher gave the student)
  //  Ensure correct authorization (teacher owns course with students who have started the lesson)

	const basemodel = await models.BaseModel.findOne({
		where: {
			id: versions[0].modelid
		}
	});

	const ownertype = await models.authority.findOne({
		where: {
			user_id: basemodel.userid
		}
	});

	let sourceId;
	// 2 is the student role
	if (parseInt(ownertype.role_id) === 2) {
		const query = `SELECT get_original_lesson(${basemodel.id}) AS sourceid`;
		const result = (await db.query(query))[0];
		sourceId = result.sourceid;
	} else {
		sourceId = basemodel.id;
	}

	const user = await models.Profile.findOne({
		where: {
			user_id: req.user.id
		}
	});

	let usemodel;
	if (sourceId != basemodel.id) {
		usemodel = await models.BaseModel.findOne({
			where: {
				id: sourceId
			}
		}); 
	} else {
		usemodel = basemodel;
	}
	let courseId;
	if (course > 0) {
		let q_teacher = `SELECT count(1) as total FROM "Courses" c2
		WHERE c2.id = ${course} and c2."_createdBy" = ${req.user.id}`
		courseId = await db.query(q_teacher)
		courseId = courseId[0].total > 0 ? course : null
	}

	const sds = moment(start_date).format('MM-DD-YYYY');
	const eds = moment(end_date).format('MM-DD-YYYY');

	const reportname = `Student Report for ${usemodel.name} (${usemodel.id}) from ${sds} to ${eds} (by ${user.email})`;

	const report   = await getModuleReport(parseInt(sourceId), {
			startDate: start_date,
			endDate: end_date,
			userId: for_domain == 'learning' ? user.user_id : null
	}, courseId);
	
	const csv      = reportToCSV(report)

  res.setHeader('Content-Disposition', `attachment; filename=${reportname}.csv`);
  res.set('Content-Type', 'text/csv');
  res.status(200).send(csv);
});

const getSelectedVersion = async (modelid) => {
	return await models.ModelVersion.findOne({
		where: {
			id: modelid
		},
		order: [
			['selected', 'desc'],
			['version', 'desc']
		]
	});
};

router.post('/:id/submit', AuthRequired, async (req, res) => {
	// get user id for who the model would be submitted to
	// check for course in query params, otherwise error

	const resp = new Response();

	if (isNaN(parseInt(req.params.id))) {
		resp.setError(Response.Error.BAD_REQUEST, "Invalid module ID " + req.params.id);
		res.status(resp.code).json(resp.json);
		return;
	}

	req.params.id = parseInt(req.params.id);

	const model = await getSelectedVersion(req.params.id);
	if (model === null) {
		resp.setError(Response.Error.NOT_FOUND, "No model with ID " + req.params.id);
		res.status(resp.code).json(resp.json);
		return;
	}

	if (PLATFORM.isModelIt === true) {
		return res.status(Response.HTTP.OK.code).json({
			success: true
		});
	}

	const forCourse = req.body.forCourse;

	if (!isNaN(parseInt(forCourse))) {
		try {
			const course = await models.Course.findOne({
				attributes: ['_createdBy'],
				where: {
					id: forCourse
				}
			});
			
			if (course === null) {
				throw {code: Response.Error.NOT_FOUND, message: "Could not find course with ID " + forCourse};
			}
		
			const instructor = course._createdBy;
			const lessonObj = new Lesson(models);
			const submitted = await lessonObj.verifyNewSubmit(req.params.id, instructor, 0);

			if (!submitted) {
				await lessonObj.submitLesson(req.params.id, instructor);
			}
			await getStudentScores(req.params.id, AssignCreateScores, forCourse);
			
		} catch(err) {
			resp.setError(
				err.code || Response.Error.INTERNAL_SERVER_ERROR,
				err.message
			);
			return res.status(resp.code).json(resp.json);
		}
	} else {
		const lessonObj = new Lesson(models);
		const instructor = await lessonObj.getInstructorIdByLesson(req.params.id);
		await lessonObj.submitLesson(req.params.id, instructor);
	}

	res.status(Response.HTTP.OK.code).json({
		success: true
	});
});

const isSubmittedLesson = async (modelid, modelversion, courseId, userId) => {
	// since student lessons are only shared when they are submitted,
	// then a lesson can be known to be submitted if there is any model_share
	// entry for it.

	const version = await models.ModelVersion.findOne({
		where: {
			id: modelid,
			version: modelversion
		}
	});

	if (modelversion !== null) {
		const model_share = await models.model_share.findOne({
			where: {
				model_id: version.modelid
			}
		});

		if (!courseId || !userId) {
			return model_share !== null;
		}
		
		const querySubmissions = `with ordered_submissions as (
			select row_number() over ( partition by (
			select userid from model where id = "model_id")
			order by "creationdate" desc) as rn, *,
			(select userid as modeluserid from model where id = "model_id")
			from model_share)
			select * from ordered_submissions
			where (select userid from model where id = "model_id") in (
			select "UserId" from "UserCourses" where "CourseId" = ${courseId} and "UserId" = ${userId})
			and "model_id" in (select "id" from model where "originid" = '${modelid}')`;
				
		const submissions = await db.query(querySubmissions,);

		return submissions.length > 0;

	} else {
		return false;
	}
};

router.get('/:id/submitted', AuthRequired, async (req, res) => {
	const resp = new Response();

	const id = parseInt(req.params.id);
	const { domain, course, version, category } = req.query;

	if (isNaN(id)) {
		resp.setError(Response.Error.BAD_REQUEST, "Invalid module ID " + req.params.id);
		res.status(resp.code).json(resp.json);
		return;
	}

	if (domain == 'learning') {
		
		if (PLATFORM.isModelIt === true) {
			resp.data = {
				modelId: id,
				submitted: false 
			}
			return res.status(resp.code).json(resp.json);
		}

		let skipCourse = true;
		if (category === 'MY_COURSES') {
			skipCourse = false;
		}

		let isSubmitted;
		const initLesson = new Lesson(models);
		try {
			const lessonData = await initLesson.getLessonForStudent(req.user.id, req.params.id, version || 1, course, skipCourse);
			
			if (lessonData.length) {			
				isSubmitted = await initLesson.findSubmittedLessonByModelIds(lessonData.map(v => v.id), course, skipCourse);
			}

			resp.code = 200;
			resp.data = {
				modelId: lessonData.length ? lessonData[0].id : null,
				submitted: new Boolean(isSubmitted) 
			}
		} catch(err) {
			logger.error(err);
			resp.setError(Response.Error.NOT_FOUND, `Not found the submitted lesson ${id}.`);
		}
	} else {
		const selected = await getSelectedVersion(id);
		if (selected) {
			resp.code = 200;
			resp.data = {
				modelId: selected.id,
				submitted: await isSubmittedLesson(selected.id, selected.version, course, req.user.id)
			}

		} else {
			resp.setError(Response.Error.NOT_FOUND, `Module ${id} not found.`);
		}
	}

	res.status(resp.code).json(resp.json);
});

router.get('/:id/insights', AuthRequired, async (req, res) => {
  let resp = new Response();
	if (isNaN(parseInt(req.params.id))) {
		resp.setError(Response.Error.BAD_REQUEST, "Invalid module ID " + req.params.id);
		res.status(resp.code).json(resp.json);
		return;
	}
	
	try {
		const subscriptions = await (new Subscription(models)).getSubscriptionByUser(req.user.id);
		if (subscriptions.length == 0) {
			throw new Error(`The current user (${req.user.id}) doesn't have a valid subscription.`)
		};
	} catch(err) {
		resp.setError(Response.Error.UNAUTHORIZED, `Warning on subscription. ${err.message}`);
		return res.status(resp.code).json(resp.json)
	}

	req.params.id = parseInt(req.params.id);

	// TODO - change request in front end for teach

	const data = {
		scores: {
			personal: {value: 0},
			course: {value: 0},
			institution: {value: 0},
			peer: {value: 0},
			all: {value: 0},
			learning_objectives: {},
			helpers: {
				personal: '',
				course: '',
				institution: '',
				peer: '',
				all: ''
			} 
		}
	};

	let forCourse = parseInt(req.query.forCourse);
	if (isNaN(forCourse)) forCourse = -1;

	if (forCourse == -1) {
		Object.keys(data.scores.helpers).forEach(help => {
			data.scores.helpers[help] = `Course not associated with the lesson ${req.params.id}.`;
		});
		resp.data = data;
		return res.status(200).json(resp.json);
	}

	const teach = 'teach' in req.query;

	const course = await models.Course.findOne({
		attributes: ['_createdBy'],
		where: {
			id: forCourse
		}
	});
	
	if (course === null) {
		throw {code: Response.Error.NOT_FOUND, message: "Could not find course with ID " + forCourse};
	}

	if (course === null) {
		resp.setError(Response.Error.NOT_FOUND, `Course ${forCourse} does not exist.`);
		res.status(resp.code).json(resp.json);
		return;
	}

	let canViewCourse;
	if (teach) {
		canViewCourse = parseInt(course._createdBy) === parseInt(req.user.id);
	} else {
		const userCourse = await models.UserCourse.findOne({
			where: {
				UserId: req.user.id,
				CourseId: forCourse
			}
		});
		canViewCourse = userCourse !== null;
	}

	if (!canViewCourse) {
		resp.setError(Response.Error.FORBIDDEN, `You do not have access to course ${forCourse}.`);
		res.status(resp.code).json(resp.json);
		return;
	}

	//const selected = await getSelectedVersion(req.params.id);

	if (teach) {
		try {
			const scoreAverage = getInstructorScore(req.params.id, forCourse, req.user.id);
			
			data.scores = {
				course: await scoreAverage.forCourse(),
				institution: await scoreAverage.forInstitution(), 
				all: await scoreAverage.forAllInstitutions(),
				peer: await scoreAverage.forPeerInstitutions(),
				learning_objectives: {},
				helpers: {}
			}

		} catch(e) {
			if (e.type && e.message) {
				resp.setError(e.type, e.message);
			} else {
				resp.setError(Response.Error.INTERNAL_SERVER_ERROR, e.message);
			}
			res.status(resp.code).json(resp.json);
			return;
		}
	} else {

		let initLesson;
		let lessonData;
		let idSubmitted;

		let { version, category } = req.query;
		
		let skipCourse = true;
		if (category === 'MY_COURSES') {
			skipCourse = false;
		}

		try {
			initLesson = new Lesson(models);
			lessonData = await initLesson.getLessonForStudent(req.user.id, req.params.id, version || 1, forCourse, skipCourse);

			if (lessonData.length) {
				idSubmitted = await initLesson.findSubmittedLessonByModelIds(lessonData.map(v => v.id), forCourse, skipCourse);
			}

			if (!idSubmitted) {
				throw {code: Response.Error.UNAUTHORIZED, message: "You may not view insights until you have submitted your lesson."};
			}
		} catch(err) {
			resp.setError(
				err.code || Response.Error.INTERNAL_SERVER_ERROR,
				err.message
			);
			return res.status(resp.code).json(resp.json);
		}
		
		let score;
		let modelMeta;
		let learnFor = 'learn';

		try {	

			if (!req.user.id) {
				throw new Error('User ID is required!');
			}

			modelMeta = await models.BaseModel.findOne({
				attributes: [
					'originid', 'id', 'userid',
					[models.sequelize.literal(`(SELECT (case when score = 'NaN' then 0 else score end) AS score FROM cached_scores WHERE modelid="BaseModel"."id" AND objective IS NULL AND "for"='${learnFor}')`), 'score'],
					[models.sequelize.literal(`(SELECT institution_id FROM profile WHERE user_id='${req.user.id}')`), 'institution_id'],
					[models.sequelize.literal(`(SELECT category FROM "Institutions" WHERE "Institutions".id IN (SELECT institution_id FROM profile WHERE user_id='${req.user.id}'))`), 'category'],
					[models.sequelize.literal(`${forCourse}`), 'courseid']],
				where: {
					id: idSubmitted
				}
			});

			if (modelMeta.originid && parseInt(modelMeta.userid) !== parseInt(req.user.id)) {
				throw {
					type: Response.Error.FORBIDDEN,
					message: "You do not own this model! Be sure you are viewing your copy, not the original lesson."
				}
			}

		} catch(err) {
			err.message = 'Error scores. '+err.message;
			if (err.type && err.message) {
				resp.setError(err.type, err.message);
			} else {
				resp.setError(Response.Error.INTERNAL_SERVER_ERROR, err.message);
			}
			res.status(resp.code).json(resp.json);
			return;
		}
		
		try {			
			score = await getStudentScores(idSubmitted, AssignCreateScores, forCourse);
			const toMap = Seq(score).keySeq().filterNot(k => k === "null").toArray();
			const mappings = Seq(await models.LearningObjectiveAssoc.findAll({
				where: {
					origin: {
						[Op.in]: toMap
					},
					modelid: idSubmitted
				}
			})).toKeyedSeq().mapEntries(([_, v]) => [v.origin, v.sub]).toObject();
			score = Seq(score).mapEntries(([k, v]) => [mappings[k] || null, v]).toObject();
		} catch(err) {
			resp.setError(Response.Error.INTERNAL_SERVER_ERROR, "Scores not created for students. " + err.message);
			res.status(resp.code).json(resp.json);
			return;
		}
		
		if (score === null) {
			resp.setError(Response.Error.NOT_FOUND, "No survey data for module id " + req.params.id);
			res.status(resp.code).json(resp.json);
			return;
		} else if (score === Response.Error.NOT_FOUND) {
			resp.setError(Response.Error.NOT_FOUND, `Could not find model with ID ${req.params.id}`);
			res.status(resp.code).json(resp.json);
			return;
		} else if (score === Response.Error.FORBIDDEN) {
			resp.setError(Response.Error.FORBIDDEN, "You don't have access to that model.");
			res.status(resp.code).json(resp.json);
			return;
		} else {
			data.scores.personal = {
				value: score[null]
			};
			
			if (modelMeta.originid && parseInt(modelMeta.userid) !== parseInt(req.user.id)) {
				resp.setError(Response.Error.FORBIDDEN, "You are not permitted to view insights for this module. Be sure you are viewing your copy of the module.");
				res.status(resp.code).json(resp.json);
				return;
			}
			
			if (!modelMeta.originid) {
				modelMeta.dataValues.originid = modelMeta.id;
			}
			if (!modelMeta.score) {
				modelMeta.dataValues.score = score[null];
			}

			try {
				data.scores.course = await getStudentCoursePercentile(modelMeta);				
				data.scores.institution = await getInstitutionPercentile(modelMeta);
				data.scores.peer = await getPeerInstitutionsPercentile(modelMeta);
				data.scores.all = await getAllInstitutionsPercentile(modelMeta);
				data.scores.learning_objectives = Seq(score).filter((v, k) => k !== 'null').toObject();
				
				data.scores.helpers.personal = `Your score (${data.scores.personal.value}) indicates the total of points by question divided by the possible achievable points in the survey.`;
				data.scores.helpers.course = `Your percentile (${data.scores.course.value}) indicates the score comparison related with this course a total scores (${data.scores.course.ctBelowOrEqualScores}) below or equal yours devided by all scores (${data.scores.course.ctAllScores}) multiplied by 100. E.g (${data.scores.course.ctBelowOrEqualScores} / ${data.scores.course.ctAllScores}) * 100.`;
				data.scores.helpers.institution = `Your percentile (${data.scores.course.value}) indicates the score comparison related with this lesson about your institution a total scores (${data.scores.course.ctBelowOrEqualScores}) below or equal yours devided by all scores (${data.scores.course.ctAllScores}) multiplied by 100. E.g (${data.scores.course.ctBelowOrEqualScores} / ${data.scores.course.ctAllScores}) * 100.`;
				data.scores.helpers.peer = `Your percentile (${data.scores.course.value}) indicates the score comparison related with this lesson about your institution category a total scores (${data.scores.course.ctBelowOrEqualScores}) below or equal yours devided by all scores (${data.scores.course.ctAllScores}) multiplied by 100. E.g (${data.scores.course.ctBelowOrEqualScores} / ${data.scores.course.ctAllScores}) * 100.`;
				data.scores.helpers.all = `Your percentile (${data.scores.course.value}) indicates the score comparison related with this lesson about all institutions a total scores (${data.scores.course.ctBelowOrEqualScores}) below or equal yours devided by all scores (${data.scores.course.ctAllScores}) multiplied by 100. E.g (${data.scores.course.ctBelowOrEqualScores} / ${data.scores.course.ctAllScores}) * 100.`;

			} catch(err) {
				resp.setError(Response.Error.INTERNAL_SERVER_ERROR, "List of scores was not processed. "+err.message);
				res.status(resp.code).json(resp.json);
				return;
			}

		}
	}
	
	resp.data = data;
  res.status(200).json(resp.json);
});

const asyncMap = async (arr, asyncFn) => {
  let output = [];
  for (let element of arr) {
    const newVal = await asyncFn(element);
    output.push(newVal);
  }
  return output;
};
const asyncForEach = async (arr, asyncFn) => {
  for (let element of arr) {
    await asyncFn(element);
  }
};

router.get('/:id/courses-for', AuthRequired, async (req, res) => {
	const response = new Response();

	const seq = models.sequelize;
	const base_lesson = await models.BaseModel.findOne({
		attributes: [[seq.fn('get_original_lesson', seq.col('id')), 'lesson_id']],
		where: {
			id: req.params.id
		}
	});

	if (base_lesson === null) {
		response.setError(Response.Error.NOT_FOUND, "No such lesson exists.");
		res.status(response.code).json(response.json);
		return;
	}

	const lesson_id = base_lesson.dataValues.lesson_id;

	const all_courses = await models.Course.findAll({
		attributes: ['id', 'title'],
		where: {
			'$models.id$': lesson_id,
			'$users.id$': req.user.id,
			_deleted: [null, false]
		},
		include: [{
			attributes: [],
			model: models.BaseModel,
			as: 'models'
		}, {
			attributes: [],
			model: models.User,
			as: 'users'
		}]
	});

	response.data = Seq(all_courses).map(entry => entry.dataValues).toArray();

	res.status(response.code).json(response.json);
});

router.get('/:id/lessonStatus', AuthRequired, async (req, res) => {
	const resp = new Response();
	const lessonId = parseInt(req.params.id);
	if (isNaN(lessonId)) {
		res.status(400).send(`Invalid lesson ID '${req.params.id}'`);
		return;
	}


	const baseModel = await models.BaseModel.findOne({
		where: { id: { [Op.eq]: lessonId } },
	});


	const allDerivatives = await models.BaseModel.findAll({
		where: { originid: { [Op.eq]: baseModel.id }, userid: { [Op.eq]: req.user.id }},
	});

	resp.data = {
		started: allDerivatives.length > 0,
		lessonId: allDerivatives.length > 0 ? allDerivatives[0].id : null
	}
	// console.log(allDerivatives);
  res.status(200).json(resp.json);
});

router.post('/:id/lesson-status', AuthRequired, async (req, res) => {
  const resp = new Response();
  const lessonId = parseInt(req.params.id);
  if (isNaN(lessonId)) {
    res.status(400).send(`Invalid lesson ID '${req.params.id}'`);
    return;
  }

//  const db = new DataBase(getenv('DATABASE_NAME'));
//  await db.connect();

  // We will allow access to lesson-status when
  // one of the following conditions is met:
  // (1) The user is the owner of the lesson model, or
  // (2) The user has ADMIN access to the lesson model.
  const baseModel = await models.BaseModel.findOne({
    where: { id: { [Op.eq]: lessonId } },
  });

  const ownerId = parseInt(baseModel.userid);
  const isOwner = req.user.id === ownerId;

  if (!isOwner) {
    // Check if user has ADMIN access.
    const modelShare = await models.model_share.findOne({
      where: {
        model_id: { [Op.eq]: lessonId },
        userid: { [Op.eq]: req.user.id },
      },
    });
    if (modelShare === null || modelShare.access !== 'ADMIN') {
      res.status(401).json({
        error: "You do not have permission to view the students' lesson statuses.",
        data: null,
      });
      return;
    }
  }

  const allDerivatives = await models.BaseModel.findAll({
    where: { originid: { [Op.eq]: baseModel.id } },
  });

  resp.data = await asyncMap(allDerivatives, async model => {
    const user = await models.Profile.findOne({
      where: { user_id: { [Op.eq]: model.userid } },
    });

    const modelShare = await models.model_share.findOne({
      where: {
        [Op.and]: [{ model_id: { [Op.eq]: model.id } }, { userid: { [Op.eq]: req.user.id } }],
      },
    });

    const modelShareUserId = modelShare !== null ? parseInt(modelShare.userid) : -1;

    return {
      first: user.firstname,
      last: user.lastname,
      completed: modelShare !== null && modelShareUserId === req.user.id,
    };
  });
  res.status(200).json(resp.json);
});

const VALID_IMAGE_TYPES = ['model', 'simulation'];

router.use(
  '/:id/lesson-image',
  fileUpload({
    limits: { fileSize: 1024 * 1024 },
  }),
);
router.post('/:id/lesson-image', AuthRequired, async (req, res) => {
  let type = VALID_IMAGE_TYPES[0]; // default to 'model'
  if (VALID_IMAGE_TYPES.includes(req.body.type)) {
    type = req.body.type;
  }
  // image is: req.files.image
  const response = new Response();

  const modelId = parseInt(req.params.id);
  if (isNaN(modelId)) {
    response.data = {
      success: false,
      error: `Invalid model ID ${modelId}.`,
    };
    res.status(400).json(response.json);
    return;
  }

  const isAbsent = v => v === undefined || v == null;

  if (isAbsent(req.files.image) || isAbsent(req.body.file)) {
    response.data = {
      success: false,
      error: 'Missing one or more necessary parameters.',
    };
    res.status(400).json(response.json);
    return;
  }

  // Sanitize the given name - exclude all disallowed characters
  let name = req.body.file;
  let sanitized = '';
  for (let i = 0; i < name.length; i++) {
    let ch = name[i];
    if (UPLOAD.FILECHARS.includes(ch)) {
      sanitized += ch;
    }
  }

  const padTime = n => n.toString().padStart(2, '0');

  const d = moment().local();
  const offset = d.utcOffset();
  const timeString = `${padTime(d.hours())}:${padTime(d.minutes())}:${padTime(d.seconds())} UTC${
    offset > 0 ? '+' : '-'
  }${Math.abs(offset)}:00`;
  const fileName = `${sanitized}_${req.params.id}_${d.month()}-${d.date()}-${d.year()} ${timeString}`;

  // Just in case we get a duplicate file name
  let outfile = `${fileName}.png`;
  let duplicate = 1;
  while (fs.existsSync(path.join(PATH.UPLOADS, outfile))) {
    outfile = `${fileName} (${duplicate++}).png`;
  }

  let full_path = path.join(PATH.UPLOADS, outfile);

  try {
    fs.writeFileSync(full_path, req.files.image.data);

    response.data = {
      success: true,
      error: null,
    };
  } catch (e) {
    response.data = {
      success: false,
      error: 'Server failed to save file.',
    };
    res.status(500).json(response.json);
    return;
  }

	// Register an entry in saved_images
//  const db = new DataBase(getenv('DATABASE_NAME'));
//  await db.connect();

  type = type.toUpperCase();
  const entity = await models.saved_images.create({
    file: outfile,
		type,
		// createdAt: new Date(),
		// updatedAt: new Date(),
    timestamp: d.toString(),
//    userId: req.user.id,
//    ModelId: modelId,
	});
	
	await entity.setBaseModel(modelId)
	await entity.setProfile(req.user.id)

  res.status(200).json(response.json);
});

// image report (two formats: in-browser view and zip archive)

const entryToFile = async (entry, zip, db) => {
  let user = entry.user;
  let id = entry.imageId;
  let row = await models.saved_images.findOne({ where: { id } });
  
  let data = fs.readFileSync(path.join(PATH.UPLOADS, row.file), 'base64');
  zip.file(`Capture_${id}_${user.firstname}${user.lastname}.png`, data, { base64: true });
};

const imageReportToZip = async (report, db) => {
  let jszip = new JSZip();
  await asyncForEach(report, async entry => {
    await entryToFile(entry, jszip, db);
  });
  return jszip;
};

const imageReportReqHandler = (method, cbk) => async (req, res) => {
  let r = new Response();

  const src = method.toLowerCase() === 'post' ? 'body' : 'query';

  const isAbsent = v => v === undefined || v == null;

  if (isAbsent(req[src].from) || isAbsent(req[src].to) || isAbsent(req[src].tz)) {
    r.data =
      "Request must include a start date ('from'), an end date ('to'), and a timezone ('tz') which is the output of getTimezoneOffset() of a Date object.";
    res.status(400).json(r.json);
    return;
  } else if (!moment(`${req[src].from}`, 'MM-DD-YYYY').isValid() || !moment(`${req[src].to}`, 'MM-DD-YYYY').isValid()) {
    r.data = "'to' and 'from' must be valid dates in the format MM-DD-YYYY.";
    res.status(400).json(r.json);
    return;
  } else if (isNaN(parseInt(req[src].tz))) {
    r.data = 'tz must be an integer.';
    res.status(400).json(r.json);
    return;
  }

  let from = req[src].from;
  let to = req[src].to;
  let _tz = parseInt(req[src].tz) / 60;
  let tz = `${_tz}:00`;

  if (_tz > 14 || _tz < -12) {
    r.data = 'tz must be between -12 and 14 (inclusive).';
    res.status(400).json(r.json);
    return;
  }

  const modelId = parseInt(req.params.id);
  if (isNaN(modelId)) {
    r.data = `Invalid model ID ${modelId}.`;
    res.status(400).json(r.json);
    return;
	}

  const model = await models.BaseModel.findOne({ where: { id: { [Op.eq]: modelId } } });
  if (model === null) {
    r.data = `Model with ID ${modelId} does not exist.`;
    res.status(400).json(r.json);
    return;
  }

  if (req.user.id !== parseInt(model.userid)) {
    r.data = `You don't have the authority to access the image report for model ${modelId}.`;
    res.status(400).json(r.json);
    return;
  }

	const results = await models.saved_images.findAll({
		where: {
			BaseModelId: {[models.Sequelize.Op.in]:
				models.sequelize.literal(`(SELECT id FROM model m WHERE (m.id = '${modelId}' OR m.originid = '${modelId}') AND m."_deleted" != true )`)
			},
			[models.Sequelize.Op.and]: models.sequelize.literal(`timezone('${tz}', timestamp)::date >= '${from}'::date and timezone('${tz}', timestamp)::date <= '${to}'::date`)
		}
	});
	const user_cache = {}; // to avoid unnecessary extra queries

  const formatted = await asyncMap(results, async result => {
		let user;
    if (user_cache.hasOwnProperty(result.profileId)) {
      user = user_cache[result.profileId];
    } else {
      user = await models.Profile.findOne({
        where: {
          user_id: { [Op.eq]: result.profileId },
        },
      });
      user_cache[result.profileId] = user;
    }
    const userData = {};
    if (user !== null) {
      userData['id'] = parseInt(user.user_id);
      userData['firstname'] = user.firstname;
      userData['lastname'] = user.lastname;
    } else {
      userData['id'] = -1;
      userData['firstname'] = '[user deleted]';
      userData['lastname'] = null;
    }
    return {
      model: result.BaseModelId,
      imageId: result.id,
      user: userData,
      timestamp: result.timestamp,
      type: result.type,
    };
  });

  cbk(formatted, req, res, db);
};

router.post(
  '/:id/image-report',
  AuthRequired,
  imageReportReqHandler('POST', async (data, req, res) => {
    let r = new Response();
    r.data = data;
    res.status(200).json(r.json);
  }),
);

router.get(
  '/:id/image-report/zip',
  AuthRequired,
  imageReportReqHandler('GET', async (data, req, res, db) => {
    let zipfile = await imageReportToZip(data, db);
    let b64_data = await zipfile.generateAsync({ type: 'base64' });
    res.setHeader('Content-type', 'application/zip');
    res.status(200).send(b64_data);
  }),
);

// This route is used to fetch the saved images
router.get('/images/:id', async (req, res) => {
  if (!req.user) {
    res.status(401).end();
    return;
  }

  const validateInteger = i => !isNaN(parseInt(i)) && parseInt(i) >= 0;
  if (!validateInteger(req.params.id)) {
    res.status(400).end();
    return;
  }

	const imgId = parseInt(req.params.id);

  const imgEntry = await models.saved_images.findOne({ where: { id: { [Op.eq]: imgId } } });

  if (imgEntry === null) {
    res.status(404).end();
    return;
  }

  const sendFile = fileName => {
    const rs = fs.createReadStream(path.join(PATH.UPLOADS, fileName));
    res.setHeader('Content-Type', 'image/png');
		res.status(200);
		rs.pipe(res);
  };

  if (req.user.id === parseInt(imgEntry.profileId)) {
		sendFile(imgEntry.file);
    return;
  } else {
    // Check if user is the owner of the origin model, later
    // TODO: Check if user has ADMIN access to origin model??? Not sure of this yet!
    if (!validateInteger(imgEntry.BaseModelId)) res.status(401).end();
    const modelId = parseInt(imgEntry.BaseModelId);

    const q = await db.query(`select userid from model where id in (select originid from model where id=${modelId})`);
		if (q.length > 0) {
      const result = parseInt(q[0].userid);
      if (result === req.user.id) {
        sendFile(imgEntry.file);
        return;
      }
    }

    res.status(401).end();
  }
});

/**
 * Route to parse the survey response
 */
router.get('/:id/survey', async (req, res) => {
	const resp = new Response();

	const id = parseInt(req.params.id);
	const { domain, course, version, category } = req.query;

	resp.code = 200;
	resp.data = null;

	if (!req.user) {		
		return res.status(resp.code).json(resp.json);
	}

	if (PLATFORM.isModelIt === true) {
		resp.data = {
			lessonId: id,
			versionId: id,
			survey: [],
			versions: [],
			courseId: course
		}
		return res.status(resp.code).json(resp.json);
	}

	try {

		if (domain != 'learning') {
			throw new Error(`Your account should be a student (learning).`);
		}

		let skipCourse = true;
		if (category === 'MY_COURSES') {
			skipCourse = false;
		}

		const initLesson = new Lesson(models)
		const lessonData = await initLesson.getLessonForStudent(req.user.id, id, version || 1, course, skipCourse);

		if (!lessonData.length) {
			throw new Error('The lesson for the survey could not be found');
		}

		let currentLesson = {lessonId: null, versionId: null, survey: null};
		if (version) {
			let lessonsCollection;
			const modelVersionId = lessonData.filter(lesson => lesson.version == version);
			if (modelVersionId.length) {
				lessonsCollection = await initLesson.findStartedLessonsByModelIds([modelVersionId[0].id], course, skipCourse);
				lessonsCollection = lessonsCollection.filterBySurvey();

				currentLesson.lessonId = modelVersionId[0].id;
				currentLesson.versionId = modelVersionId[0].versionId;
				currentLesson.survey = lessonsCollection.startedLessons.filter(started => started.modelId == modelVersionId[0].id);
				if (currentLesson.survey.length) {
					currentLesson.survey = JSON.parse(currentLesson.survey[0].survey);
				}
			}
		}
		if (!currentLesson.lessonId) {
			currentLesson.lessonId = lessonData[0].id;
		}	
		resp.data = {
			lessonId: currentLesson.lessonId,
			versionId: currentLesson.versionId,
			survey: currentLesson.survey,
			versions: lessonData,
			courseId: course
		}
	} catch (err) {
		console.log(Response.Error.BAD_REQUEST, `Survey not found. Error: ${err.message}`);
	}

	res.status(resp.code).json(resp.json);

});



/**
 * get ids from model table using originId ,
 * then find the ids in model_share table , to know which lessons among the models in my course tab are submitted or not
 * then with this set of model ids from model_share, again query in model table to get the originIds 
 * and get a list of model originIds that are submitted by the student, for which we want to mark the check_circle icon
 */
 router.get('/:courseId/checkSubmittedlesson', async (req, res) => {
	const resp = new Response();
	const { queryList } = req.query;
	resp.code = 200;
	resp.data = null;

	if (!req.user) {		
		return res.status(resp.code).json(resp.json);
	}
	let userId = 0;

	if(req.user != null){
		userId = req.user.id;
	}

	if (PLATFORM.isModelIt === true) {
		resp.data = {
			lessons: []
		}
		return res.status(resp.code).json(resp.json);
	}

	try {
		
			let studentModels = [];
							const submissions = await (new Lesson(models)).checkSubmittedlesson(userId,queryList, req.params.courseId);
							if(submissions != null){
								submissions.forEach(async obj => {
									studentModels.push(parseInt(obj.id));
								});
								
							}
							resp.data = {lessons: studentModels};	
	} catch (err) {
		console.log(Response.Error.BAD_REQUEST, `Model not found.  Error: ${err.message}`);
	}

	res.status(resp.code).json(resp.json);

});



router.get('/:versionId/checkStartedLesson', async (req, res) => {
  const resp = new Response();
  resp.code = 200;
  resp.data = null;

	// Allow lessons to run without authentication
	let userId = null;
	if(req.user != null){
		userId = req.user.id;
	}

	let { version, courseId, category } = req.query;

	if (PLATFORM.isModelIt === true) {
		resp.data = {
			originId: req.params.versionId,
			lessonId: req.params.versionId,
			started: false,
			submitted: false,
			moduleName: '',
			relatedLessons: [],
			versionId: req.params.versionId
		}
		return res.status(resp.code).json(resp.json);
	}


	if (courseId) {
		courseId = Number(courseId);
		courseId = isNaN(courseId) ? null : courseId;
	}

	let skipCourse = true;
	if (category === 'MY_COURSES') {
		skipCourse = false;
	}

  try {
		const lessonModel = new Lesson(models);
    const submission = await lessonModel.checkStartedLesson(userId, req.params.versionId, version || 1, courseId, skipCourse);
		console.log('submissions: ' + JSON.stringify(submission))

		const relatedLessons = await lessonModel.getLessonsByVersionId(userId, req.params.versionId, version || 1);

    if (submission && submission.length) {
      resp.data = {
				originId: req.params.versionId,
				lessonId: submission[0].modelId,
        started: true,
        submitted: submission[0].submitted,
				moduleName: submission[0].name,
				relatedLessons,
				versionId: submission[0].versionId
      };
    } else {
      resp.data = {
				originId: req.params.versionId,
				lessonId: req.params.versionId,
        started: false,
        submitted: false,
				moduleName: '',
				relatedLessons,
				versionId: req.params.versionId
      };
    }
  } catch (err) {
    console.log(Response.Error.BAD_REQUEST, `Model not found.  Error: ${err.message}`);
  }

  return res.status(resp.code).json(resp.json);
});


router.post('/modelit/:code', async (req, res) => {
  const resp = new Response();
  resp.code = 200;
	let { code: lessonCode } = req.params;
	const reqUserIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
	const reqTimezone = req.timezone?.id;

	try {

		if (!lessonCode) {
			throw new Error(`Invalid lesson code format.`);
		}

		lessonCode = `${lessonCode}`.replace(/\-/g,'');

		const codeValidation = new CodeValidation(models);
		const course = await codeValidation.getCourseValidCode(lessonCode);

		if (!course) {
			throw new Error(`The code "${lessonCode}" does not correspond to any active Lesson.`);
		}

		const nowUtcMs = Date.now();
		const endUtcMs = DateTimeUtil.toUtcMs(course?.endDate);

		if (Number.isFinite(endUtcMs) && nowUtcMs > endUtcMs) {
			throw new Error(`The code "${lessonCode}" is no longer valid (expired).`);
		}

		const modelItLessonLink = new ModelItLessonLink(models);
		const shareableLessonCode = await modelItLessonLink.generateLessonLinkByCourse(course.id, lessonCode, course.endDate);

		const shareableLessonURL = `${getenv(
			'CC_URL_LEARN', 'http://localhost:5000', {prefix: 'VITE',	seperator: '_',	}
		)}#${shareableLessonCode}`;

		const anonymousUser = new AnonymousUserModelIt();
		const temporaryCredentials = new TemporaryCredentials(models);
		const tempCredentials = await temporaryCredentials.generateCredentials(
			anonymousUser, lessonCode, TEMP_ACCESS_TYPE.lesson, reqUserIp, reqTimezone
		);

		resp.data = {
			course,
			anonymousUser: {
				temp_email: tempCredentials.email,
				temp_password: tempCredentials.password
			},
			urls: {
				sign_in: '/web/api/auth/login/?modelit_credentials=1',
				redirect_to: shareableLessonURL,
				redirect_hash: shareableLessonCode
			}
		}

	} catch (err) {
		resp.setError(Response.Error.BAD_REQUEST, err.message);
	}	
	return res.status(resp.code).json(resp.json);
});

export default ResourceFactory('Model', {
  as: 'module',
  middlewares: router,
  where: {
    [Op.and]: [{ type: { [Op.eq]: 'learning' } }, { published: { [Op.eq]: true } }],
  },
});
