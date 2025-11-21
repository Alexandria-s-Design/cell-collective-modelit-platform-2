import { Op } from 'sequelize';
import pickBy from "lodash.pickby";
import { generateUniqueStringId, toCSVRow } from './util';
import ResourceFactory from '../factory/rest/resource';
import AssociationResourceFactory, { AssocInstruction } from '../factory/rest/associationResource';
import models, { db } from '../../../models';
import { AuthRequired } from '../../middlewares/auth';
import CourseAuth from '../../middlewares/courseAuth';
import { Response } from '../../../server';

import { sendMail } from '../../mailagent';

import multer from "multer";

import { Readable } from "stream";
import { PATH, EMAIL } from "../../../const";
import path from "path";
import mkdirp from "mkdirp";
import fs from "fs";
import csv from "csv-parser";
import ManageCourse from '../manageCourse';
import Course from '../manageCourse/Course';


function readInstitutionTypes(filename){
	return new Promise((resolve) => {
		let data = {};
		fs.createReadStream(filename)
		.pipe(csv())
		.on('data', (row) => {
			console.log(row);
		})
		.on('end', () => {
			console.log('CSV file successfully processed');
			resolve();
		});	
	});
}

const modelName = 'Course';
const model = models[modelName];
const ROSTER_HEADERS = ['First Name', 'Last Name', 'Email Address'];

const userCourseAssocFactory = new AssociationResourceFactory('UserCourse', ['UserId', 'CourseId'], {
  createActionRoutes: true,
  permissionCheck: (req, rowData) => {
    return req.user.id == rowData.UserId;
  },
});

const modelCourseAssocFactory = new AssociationResourceFactory('ModelCourse', ['ModelId', 'CourseId'], {
  createActionRoutes: false,
  permissionCheck: async (req, rowData) => {
    const course = await model.findByPk(rowData.CourseId);
    //TODO: double check and ask.
    // const _binding_model = await models.Model.findByPk(req.ModelId);
    // if (!_binding_model.get().published) {
    // 	throw new Error(`Cannot bind course(${req.query.CourseId}) with  unpublished model(${req.query.ModelId})`)
    // }
    return req.user.id == course.get()._createdBy;
  },
});

const courseFactory = ResourceFactory(modelName, {
  skipRoutes: [],
  attributes: {
    include: ['_createdBy', '_createdAt', '_updatedAt'],
  },
  customFields: {
    set: async (req, data, { transaction } = {}) => {
      const {
        body: { models: _models },
      } = req;
      if (req.method == 'POST') {
        const newId = generateUniqueStringId(data.id);
        const course = await models.Course.update({ codeKey: newId }, { where: { id: data.id }, transaction: transaction, returning: true, plain: true });
		// await modelCourseAssocFactory.addOrModify(req, {ModelId: '55633', CourseId: `${data.id}`}, true, {ignorePermissionCheck: true, transaction: transaction});
		if (_models) {
          await modelCourseAssocFactory.addOrModify(req, { ModelId: _models, CourseId: data.id }, true, { ignorePermissionCheck: true, transaction: transaction });
          return {
            ...course[1].get(),
            models: await modelCourseAssocFactory.getAssociationById('CourseId', { CourseId: data.id }, { transaction: transaction }),
          };
        }
        return course[1].get();
      }
      const {
        params: { id },
      } = req;
      if (req.method == 'PUT' && _models) {
        if (!Array.isArray(_models)) {
          throw new Error('models need to be an array of type AssocInstruction');
        }
				const modelsPrevId = [];
				for (const model of _models) {
					if (model.type === "add") {
						const id = parseInt(model.id);
						if (isNaN(id)) continue;
						const useVersion = (await db.query(`SELECT fn_get_basemodel_id(${id}) AS modelid`))[0].modelid;
						if (useVersion) {
							model.id = String(useVersion);
							modelsPrevId.push({ [model.id]: (await db.query(`SELECT use_version(${id}) AS modelid`))[0].modelid });
						};
					}
				}
        await modelCourseAssocFactory.addAndRemoveInstruction(req, { ModelId: _models.map(instruction => AssocInstruction.fromJSON(instruction)), CourseId: id }, { transaction: transaction });
				await modelCourseAssocFactory.updatePrevId(id, modelsPrevId, transaction);
        return {
          ...data,
          models: await modelCourseAssocFactory.getAssociationById('CourseId', { CourseId: id }, { transaction: transaction }),
        };
      }
    },
    get: async (req, data) => {
      const {
        params: { id },
        query: { model_binding },
			} = req;
			
      if (req.method == 'GET' && id && model_binding !== undefined) {
        data.models = data.models.map(row => row.id);
        return data;
      }
      if (req.method == 'GET' && model_binding !== undefined) {
        data.forEach(d => (d.models = d.models && d.models.map(row => row.id)));
        return data;
      }
    },
  },
  getModelData: req => {
    const exclude = ['codeKey', 'published', 'models'];
    if (req.method === 'POST' || req.method === 'PUT') {
			const data = pickBy(req.body, (val, key) => !exclude.includes(key));
			if(req.method === 'POST'){
				if (!data.startDate) { data.startDate = new Date(); }
				if (!data.endDate) { data.endDate = new Date(); }
			}
			return data;
	}
  },
  query: {
    where: req => {
      const {
        user,
        query: { codeKey, my_courses, my_enrolled },
      } = req;
			const defaultConditions = { _deleted: models.sequelize.literal('"users->UserCourse"."_deleted" IN(false, null)') };

      if (codeKey !== undefined) {
        return {
          codeKey: {
            [Op.eq]: codeKey,
          },
        };
      }

      if (my_courses !== undefined) {
        if (!user) {
          throw new Error('Unauthorized');
        }
        return {
          [Op.and]: {
            _deleted: false,
            _createdBy: user.id,
          },
        };
      }

      return defaultConditions;
    },
    include: req => {
      const {
        user,
        query: { my_enrolled, model_binding },
      } = req;
      let _include = [];
      if (req.method === 'GET' && model_binding !== undefined) {
        _include = [
          ..._include,
          {
            model: models.BaseModel,
            through: { attributes: [] },
            attributes: ['id'],
            as: 'models',
						required: false
          },
        ];
      }
      if (req.method === 'GET' && my_enrolled !== undefined) {
        if (!user) {
          throw new Error('Unauthorized');
        }
        _include = [
          ..._include,
          {
						model: models.User,
						as: 'users',
            where: { id: { [Op.eq]: user.id } },
            through: { attributes: [] },
						attributes: ['id'],
						as: 'users'
          },
        ];
      }
      return _include;
    },
  },
});

const upload = multer({ storage: multer.memoryStorage() });

const readStreamFromBuffer = (buf) => {
	const readable = new Readable();
	readable._read = () => {};
	readable.push(buf);
	readable.push(null);
	return readable;
};

// make roster course dir
mkdirp.sync(path.join(PATH.PRIVATE, "course", "roster"));

courseFactory.use('/', userCourseAssocFactory.router);
courseFactory.use('/', modelCourseAssocFactory.router);

courseFactory.post('/roster/:courseId', AuthRequired, CourseAuth(req => req.params.courseId), upload.single('roster'), async (req, res) => {
	try {
		let roster = [];
		await (new Promise((resolve, reject) => {
			let valid = true;
			let buf = req.file.buffer;

			readStreamFromBuffer(buf).pipe(csv()).on('data', data => {
				if (!valid) return;
				else {
					if (data['First Name'] === undefined || data['Last Name'] === undefined || data['Email Address'] === undefined) {
						valid = false;
					} else {
						roster.push(data);
					}
				}
			}).on('end', () => {
				// write file contents
				if (valid) {
					const outStream = fs.createWriteStream(path.join(PATH.PRIVATE, "course", "roster", `${req.params.courseId}.csv`));
					readStreamFromBuffer(buf).pipe(outStream).on('finish', () => {
						outStream.end();
						resolve();
					});
				} else {
					reject(new Error("Invalid roster CSV file."));
				}
			}).on('error', err => {
				reject(new Error("Invalid roster CSV file."));
			});
		}));

		const success = new Response();
		success.code = 200;
		success.data = {
			message: "Roster uploaded.",
			roster
		};

		res.status(success.code).json(success.json);
	} catch(e) {
		const err = new Response();
		err.setError(Response.Error.UNPROCESSABLE_ENTITY, e.toString());
		res.status(err.code).json(err.json);
	}
});

courseFactory.delete('/roster/:courseId', AuthRequired, CourseAuth(req => req.params.courseId), async (req, res) => {
	const response = new Response();
	try {
		const rosterFile = path.join(PATH.PRIVATE, "course", "roster", `${req.course}.csv`);
		const exists = fs.existsSync(rosterFile);
		if (!exists) {
			response.setError(Response.Error.NOT_FOUND, "No roster is uploaded for this course!");
		} else {
			fs.unlinkSync(rosterFile);
			response.code = 200;
		}
	} catch(e) {
		response.setError(Response.Error.INTERNAL_SERVER_ERROR, "Failed to delete roster.");
	}
	res.status(response.code).json(response.json);
});

const getRoster = async (courseId) => {
	const rosterPath = path.join(PATH.PRIVATE, "course", "roster", `${courseId}.csv`);
	if (fs.existsSync(rosterPath)) {
		const roster = [];
		await (new Promise((resolve) => {
			fs.createReadStream(rosterPath).pipe(csv()).on('data', entry => roster.push(entry)).on('end', () => resolve());
		}));
		return roster;
	} else {
		return null;
	}
};

const asyncMap = async (arr, asyncFn) => {
  let output = [];
  for (let element of arr) {
    const newVal = await asyncFn(element);
    output.push(newVal);
  }
  return output;
};

const mapFromEntries = entries => {
	let out = {};
	for (let entry of entries) {
		out[entry[0]] = entry[1];
	}
	return out;
};

courseFactory.post('/roster/match/:courseId', AuthRequired, CourseAuth(req => req.params.courseId), async (req, res) => {
	const response = new Response();
	const { unmatched, matchTo } = req.body;
	if (!(unmatched && matchTo)) {
		response.setError(Response.Error.UNPROCESSABLE_ENTITY, "Must include an unmatched e-mail and an e-mail to match the unmatched roster entry to.");
	} else {
		const roster = await getRoster(req.course);
		if (roster === null) {
			response.setError(Response.Error.NOT_FOUND, "This course doesn't have a roster!");
		} else {
			let user = roster.filter(e => e['Email Address'] === unmatched);
			if (user.length === 0) {
				response.setError(Response.Error.NOT_FOUND, `The student with e-mail ${unmatched} could not be found in the roster.`);
			} else {
				user = user[0];

				const alreadyMatched = await models.UserCourse.findOne({
					where: {
						UserId: {
							[Op.in]: [models.sequelize.literal(`SELECT user_id FROM profile WHERE email=${models.sequelize.escape(unmatched)}`)]
						},
						CourseId: req.course
					}
				});

				if (alreadyMatched !== null) {
					response.setError(Response.Error.CONFLICT, "The supposedly unmatched user is already matched and in the course!");
				} else {
					const matchToUser = await models.Profile.findOne({
						where: {
							email: matchTo
						}
					});
					if (matchToUser === null) {
						response.setError(Response.Error.NOT_FOUND, `The profile with e-mail ${matchTo} could not be found.`);
					} else {
						// replace e-mail in roster with new e-mail (TODO: skip this if they are the same?)
						const newRoster = ROSTER_HEADERS.map(header => `"${header}"`).join(",") + "\n"
							+	roster.map(entry => {
							let useEntry;
							if (entry['Email Address'] === unmatched) {
								const newEntry = entry;
								newEntry['Email Address'] = matchTo;
								useEntry = newEntry;
							} else useEntry = entry;
	
							return toCSVRow(useEntry, ROSTER_HEADERS);
						}).join("\n");
	
						let finish = true;
						try {
							await new Promise((resolve, reject) => {
								const outStream = fs.createWriteStream(path.join(PATH.PRIVATE, "course", "roster", `${req.course}.csv`));
								readStreamFromBuffer(Buffer.from(newRoster, 'utf8')).pipe(outStream).on('error', err => {
									reject(err);
								}).on('finish', () => {
									outStream.end();
									resolve();
								});
							});
						} catch(e) {
							response.setError(Response.Error.INTERNAL_SERVER_ERROR, "Could not write to roster file.");
							finish = false;
						}
	
						// if the roster was successfully re-written, add the user to the course (if they aren't already)
						if (finish) {
							// will not create a new DB row if the matched user is already in the course
							await models.UserCourse.findOrCreate({
								where: { UserId: matchToUser.user_id },
								defaults: {
									_createdBy: req.user.id,
									CourseId: req.course
								}
							});
							response.code = 200;
							response.data = {success: true};
						}
					}
				}
			}
		}
	}

	res.status(response.code).json(response.json);
});

courseFactory.get('/insights/:modelId', AuthRequired, CourseAuth(req => req.query.forCourse), async (req, res) => {
	const { params: { modelId }, query: {forCourse: course} } = req;
	const response = new Response();

	const courseObj = new Course(models);

	// no. of students who have accessed course
	let accessedCourse = await courseObj.getEnrolledStudentsInCourse(course);

	let courseMap = mapFromEntries(await asyncMap(accessedCourse, async entry => {
		return [entry.UserId, (await models.Profile.findOne({
			where: {
				user_id: entry.UserId
			}
		}))];
	}));

	accessedCourse = accessedCourse.map(record => ({courseTitle: record.title,  user: courseMap[record.UserId].email, date: record._createdAt, profile: courseMap[record.UserId] }));
	let roster = await getRoster(course);
	let inCourseEmails = Object.values(courseMap).map(profile => profile.email);

	// get students from roster who aren't in course
	let nonjoined = roster ? (await asyncMap(roster.filter(entry => !inCourseEmails.includes(entry['Email Address'])), async entry => {
		return {
			...entry,
			potential_matches: await models.Profile.findAll({
				where: {
					[Op.or]: [
						{
							firstname: entry['First Name'],
							lastname: entry['Last Name']
						},
						{
							email: entry['Email Address']
						}
					]
				}
			}).map(profile => profile.email)
		}
	})).filter(entry => entry.potential_matches.length > 0) : [];
							
	try {
	// no. of students who have started lesson
	// select distinct on the userid column will ignore any duplicate models for an individual user (i.e. if they restarted a lesson, which creates
	// another copy of it). So if you have 3 students: student A, who has not started the lesson, student B who has started the lesson once, and
	// student C who has started and restarted the lesson, this query will return 2 results instead of 3 as should be expected.
	const startedLesson = await courseObj.getStartedLessons(modelId, course);

	// select all models whose origin id is modelId and which are from users in the course
	// select all model shares whose model_id is in the set described above
	// group by the userid OF THE MODELS (NOT the model_share row), then get entries from each group with most recent creationdate

	let completedLesson = await courseObj.getCompletedLessons(modelId, course);
	completedLesson = completedLesson.map(record => ({ user: courseMap[parseInt(record.modeluserid)].email, date: record.creationdate, original: record }));

	response.data = {
		accessedCourse, startedLesson, completedLesson,

		course, roster, nonjoined
	};
	} catch(err) {
		response.setError(Response.Error.BAD_REQUEST, 'Error found to list lessons submitted: '+ err.message);
	}

	res.status(response.code).json(response.json);
});

courseFactory.post('/remind/:modelId', AuthRequired, CourseAuth(req => req.body.forCourse), async (req, res) => {
	const response = new Response();

	const accessed  = req.body.accessed || false;
	const started   = req.body.started || false;
	const completed = req.body.completed || false;

	if (!(accessed || started || completed)) {
		response.setError(Response.Error.BAD_REQUEST, "Must have at least one category selected for e-mail reminders.");
		res.status(response.code).json(response.json);
		return;
	}

	const profiles = await models.Profile.findAll({
		where: {
			user_id: {
				[Op.in]: [models.sequelize.literal(`SELECT "UserId" from "UserCourses" WHERE "CourseId"=${models.sequelize.escape(req.course)}`)]
			}
		}
	});

	let emails = {};
	profiles.forEach(profile => {
		emails[profile.email] = null
	});


	if (accessed) {
		const roster = await getRoster(req.course);
		if (roster === null) {
			response.setError(Response.Error.NOT_FOUND, "Cannot remind students to access course if there is no roster to determine who is expected to access the course!");
			res.status(response.code).json(response.json);
			return;
		}

		const emailKeys = roster.map(entry => entry['Email Address']);

		let didAccess = profiles.map(record => record.email);
		let didNotAccess = emailKeys.filter(email => !didAccess.includes(email));
		for (const email of didNotAccess) {
			// TODO - make messages not magic
			emails[email] = ["Access his/her course"];
		}
	}
	if (started) {
		const startedProfiles = await models.Profile.findAll({
			where: {
				user_id: {
					[Op.in]: [models.sequelize.literal(`SELECT DISTINCT userid FROM model WHERE originid=${models.sequelize.escape(req.params.modelId)} AND userid IN\
(SELECT "UserId" FROM "UserCourses" WHERE "CourseId"=${models.sequelize.escape(req.course)})`)]
				}
			}
		});
		let didStart = startedProfiles.map(record => record.email);
		let didNotStart = profiles.filter(entry => !didStart.includes(entry.email)).map(profile => profile.email);
		for (const email of didNotStart) {
			if (emails[email] === null) emails[email] = ["Start your lesson"];
			else emails[email].push("Start your lesson");
		}
	}
	if (completed) {
		let completedProfiles = await models.Profile.findAll({
			where: {
				user_id: {
					[Op.in]: [models.sequelize.literal(`SELECT DISTINCT (SELECT userid FROM model WHERE id="model_id") FROM model_share WHERE model_id IN\
(SELECT id FROM model WHERE originid=${models.sequelize.escape(req.params.modelId)}) AND "userid"=${models.sequelize.escape(req.user.id)}`)]
				}
			}
		});
		let didComplete = completedProfiles.map(record => record.email);
		let didNotComplete = profiles.filter(entry => !didComplete.includes(entry.email)).map(profile => profile.email);
		for (const email of didNotComplete) {
			if (emails[email] === null) emails[email] = ["Complete your lesson"];
			else emails[email].push("Complete your lesson");
		}
	}

	let instructor = await models.Profile.findOne({
		where: {
			user_id: req.user.id
		}
	});

	let emailsSent = 0;
	for (const target in emails) {
		if (emails[target] === null) continue;
		let content = EMAIL.REMINDER_TEMPLATE({
			todo: `<ul>${emails[target].map(message => `<li>${message}</li>`).join('')}</ul>`,

			instructor_first: instructor.firstname,
			instructor_last: instructor.lastname
		});

		// TODO - have mail queue to send messages asynchronously and not delay the node server
		// Possible Solutions:
		// - use queue to distribute the load of e-mails to send
		// - put pending messages in some data source that the java server can access, and
		//   have a thread on the Java server send the e-mails.
		let msgConfig = {
			from: EMAIL.SMTP_OPTIONS.USER,
			to: target,
			subject: "Reminder",
			html: content
		};

		await sendMail(msgConfig).catch(err => {
			response.data = {
				message: `Error sending reminders.`
			};
			return;
		});
		emailsSent++;
	}
	response.data = {
		message: `Sent ${emailsSent} reminders.`
	};
	response.code = 200;

	res.status(response.code).json(response.json);
});


courseFactory.delete('/:courseId/enroll', AuthRequired, async (req, res) => {
	const resp = new Response();
	try {
		resp.data = await (new ManageCourse(models)).unenroll(req.user.id, req.params.courseId);
	} catch (err) {
		resp.setError(Response.Error.BAD_REQUEST, "Cannot unenroll user from course: "+err.message);
	}
	res.status(resp.code).json(resp.json);
});

export default courseFactory;
