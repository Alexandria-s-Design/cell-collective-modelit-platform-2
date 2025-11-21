import { Seq } from "immutable";
import { QueryTypes } from "sequelize";
import LessonMap from "../../../modelsMapper/LessonMap";
import LessonDto from '../../../modelsMapper/dtos/LessonDto';
import { ArrayUtil } from "../../../util/ArrayUtil";
import { StartedLessonsCollection } from "./Collections";
import Version from "../manageModel/Version";

export default class Lesson {
	constructor (modelInstance = null, transaction = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('instance of Sequelize DB was not defined');
		}
		this.dbInstance = modelInstance;
		this.transaction = transaction;
	}

	async getLessonByOriginalId(modelOriginId = 0, userId = 0) {
		let lessonData = await this.dbInstance.BaseModel.findOne({
			where: {
				userid: userId,
				originid: modelOriginId
			}
		});
		if (!lessonData) {
			throw new Error('Lesson was not found by the original ID: '+modelOriginId);
		}
		return LessonMap.toDTO(lessonData);
	}

	async verifyNewSubmit(lessonId, instructorId, errorCode = 0) {
		const hasModelShare = await this.dbInstance.model_share.findOne({
			where: {
				model_id: lessonId,
				userid: instructorId,
				access: 'VIEW'
			},
			attributes: ['model_id']
		});
	
		if (errorCode && hasModelShare !== null) {
			throw {code: errorCode, message: `Model ${lessonId} is already submitted!`};
		}

		return hasModelShare == null ? false : true;
	}

	/** 
	 * @param lessonId Represent the same model.id
	 * @param instructorId Is used when is required verify if lesson was added to specific course.
	 */
	async findSubmittedLessonId(lessonId, instructorId) {
		const whereStmt = {
			model_id: lessonId,
			access: 'VIEW'
		}
		if (!instructorId) {
			whereStmt.userid = instructorId;
		}
		const hasModelShare = await this.dbInstance.model_share.findOne({
			where: whereStmt,
			attributes: ['model_id']
		});
		return hasModelShare == null ? 0 : hasModelShare.model_id;
	}

	async findSubmittedLessonByModelIds(lessonsId = [], courseId = null, skipCourse) {
		let lessonsCollection = await this.findStartedLessonsByModelIds(lessonsId, courseId, skipCourse);
		lessonsCollection = lessonsCollection.filterBySubmitted();
		if (lessonsCollection.startedLessons.length) {
			lessonsCollection = lessonsCollection.startedLessons[0].modelId;
		} else {
			lessonsCollection = 0;
		}
		return lessonsCollection;
	}

	/**
	 * @param {Array} lessonsId 
	 * @param {number} courseId
	 * @param {boolean} skipCourse 
	 * @returns {Promise<StartedLessonsCollection>}
	 */
	async findStartedLessonsByModelIds(lessonsId = [], courseId = null, skipCourse = false) {
		const whereStmt = {
			_deleted: { [this.dbInstance.Sequelize.Op.ne]: true },
		}

		let _courseId = courseId && courseId > 0 ? parseInt(courseId) : null;
		whereStmt.courseId = _courseId;

		if (skipCourse === true) {
			delete whereStmt.courseId;
		}

		const started = await this.dbInstance.ModelStartedLesson.findAll({
			where: whereStmt,
			include: [{
					as: 'model',
					attributes: [],
					model: this.dbInstance.BaseModel,
					where: {
						_deleted: { [this.dbInstance.Sequelize.Op.ne]: true },
						id: { [this.dbInstance.Sequelize.Op.in]: lessonsId	}
				}}, {
					as: 'model_initial_state',
					attributes: ['survey'],
					required: false,
					model: this.dbInstance.model_initial_state,
			}],
			attributes: ['modelId', 'submitted'],
		});
		
		return StartedLessonsCollection.fromRawData(started.map(item => item.toJSON()));
	}

	/**
	 * Get all versions model id to the current lesson
	 * @param {*} studentId 
	 * @param {number} versionId Note: This parameter should be model_version.id not model.id 
	 * @param {number} version 
	 * @param {number} courseId 
	 * @param {boolean} skipCourse 
	 * @returns {Promise<Array<LessonDto>>}
	 */
	async getLessonForStudent(studentId, versionId, version, courseId = null, skipCourse = false) {
		if (Boolean(parseInt(studentId) && parseInt(versionId)) == false) {
			return [];
		}
		let replacements = {studentId: parseInt(studentId), versionId: parseInt(versionId), version: parseInt(version)}

		let _courseId = courseId && courseId > 0 ? parseInt(courseId) : null;
		replacements.courseId = _courseId;

		if (skipCourse === true) {
			_courseId = undefined;
			delete replacements.courseId;
		}

		// Check if the lesson is in the My Learning section
		let lessonListFromMyLearning = await this.dbInstance.sequelize.query(`
		select
			m.id,
			m.userid,
			NULL as instructorid,
			m.name,
			m.originid,
			m.author,
			NULL as courseid,
			mv.id as "versionId",
			mv."version",
			mv."name" as "versionName"
		from model_version mv
		left join model m on m.id = mv.modelid
		where (mv.id = :versionId and m.originid != :versionId)
			and m.userid = :studentId
			and m."_deleted" != true
			and m.originid is not null`,
		{
			type: QueryTypes.SELECT,
			replacements
		});

		if (lessonListFromMyLearning && lessonListFromMyLearning.length) {
			return lessonListFromMyLearning.map(v => LessonMap.toDTO(v));
		}
		
		//Check if the lesson by original ID
		let lessonList = await this.dbInstance.sequelize.query(`
		with tb_model_id as (
			select modelid from model_version mv where mv.id = :versionId
			order by mv.modelid asc limit 1
		)
		select
			m.id,
			m.userid,
			${_courseId !== undefined ? `c."_createdBy"` : `NULL`} as instructorid,
			m.name,
			m.originid,
			m.author,
			${_courseId !== undefined ? `'${_courseId}'` : `NULL`} as courseid,
			mv.id as "versionId",
			mv."version",
			mv."name" as "versionName"
		from model m
		inner join model_version mv on mv.modelid = m.id
		inner join model m_orig on m_orig.id = m.originid
		inner join profile p on p.user_id = m.userid
		${_courseId !== undefined ? `
			inner join "ModelStartedLesson" msl on msl."courseId" = :courseId and msl."modelId" = m.id
			inner join "UserCourses" uc on uc."UserId" = p.user_id and uc."CourseId" = msl."courseId"
			inner join "Courses" c on c.id = uc."CourseId" and uc."_deleted" != true
			inner join "ModelCourse" mc
				on mc."ModelId" = m.originid
				and mc."CourseId" = uc."CourseId" and mc."_deleted" != true
		` : ''}
		where m.userid = :studentId
			and m.type = 'learning'
			and m.originid = fn_get_original_lesson((select tb_model_id.modelid from tb_model_id))
			and m._deleted != true
			and m_orig."_deleted" != true
		order by m.id desc`,
		{
			type: QueryTypes.SELECT,
			replacements
		});

		if (lessonList && lessonList.length) {
			return lessonList.map(v => LessonMap.toDTO(v));
		}
		return [];
	}

	async getLessonsIdByCourse(courseId, userId) {
		let sqlParams = {course: courseId};
		let sqlLessons = `SELECT m.id FROM model m
		INNER JOIN "ModelCourse" mc ON mc."ModelId" = m.originid AND mc."CourseId" = :course
		WHERE m.type = 'learning'`;

		if (userId) {
			sqlLessons += ` AND m.userid = :user`;
			sqlParams.user = userId;
		}
		
		return await this.dbInstance.sequelize.query(sqlLessons, {
			type: QueryTypes.SELECT,
			replacements: sqlParams
		});
	}

	async disableRows(lessonList = [], userId = 0) {
		
		if (!userId) {
			throw new Error("A user ID is required to disable lessons");
		}

		await this.dbInstance.BaseModel.update({
			_deletedAt: this.dbInstance.sequelize.literal("NOW()"),
			_deletedBy: userId,
			_deleted: true
		}, {
			where: {
				id: {
					[this.dbInstance.Sequelize.Op.in]: lessonList
				},
				type: 'learning',
				_deleted: {[this.dbInstance.Sequelize.Op.ne]: true }
			},
			transaction: this.transaction
		});
	}

	async removeSubmittedLessons(lessonList = []) {
		await this.dbInstance.model_share.destroy({
			where: {
				model_id: { [this.dbInstance.Sequelize.Op.in]: lessonList },
				access: 'VIEW'
			},
			transaction: this.transaction
		});
	}

	async checkSubmittedlesson(userId, queryList, courseId=null) {
		try{
			let sqlParams = {userId: parseInt(userId)};

				let _courseId = parseInt(courseId);

				if (_courseId) {
					sqlParams.courseId = _courseId;
				}

				const modelShareQuery = `select distinct "originid" as id
				from model 
				where
				"id" in (
					select distinct msl."modelId" 
					from "ModelStartedLesson" msl
					where msl.submitted = true
					${_courseId ? `and msl."courseId" = :courseId` : ''}
					and 
						msl."modelId" in (
							select "id" from model where "originid" in (${queryList}) and "userid"= :userId
							)
				)`;
						return await this.dbInstance.sequelize.query(modelShareQuery, {
							type: QueryTypes.SELECT,
							replacements: sqlParams
						});
		}catch(e){
			return e;
		}							
	}

	async isAllowedToStartLesson(body, userId = 0, courseId = null) {
		const modelBody = Object.entries(body);
		let modelOrigin = modelBody.pop();
		// This is needed when user clicks confirmation
		// so model is not last object but 'confirm' attribute
		if (modelOrigin[0] === 'confirm') {
			modelOrigin = modelBody.pop();
		}  
		
		if (!modelOrigin[1].startLesson) {
			return;
		}

		const version = modelOrigin[0].split('/')[1];
		
		if (version > 0) return true;
		let sqlQuery = `select
			m.id,
			m."name",
			to_char(m."_createdAt", :dtstring) as "createdAt",
			msl."courseId",
			msl.submitted
		from "ModelStartedLesson" msl 
		inner join model m on m.id = msl."modelId"
		inner join model mo on mo.id = m.originid
		where
			m.originid = :origin
			and m.userid = :user
			and m."type" = 'learning'
			and m."_deleted" != true
			and mo."_deleted" != true
			and msl.submitted = true`;

		if (courseId) {
			sqlQuery += ` and msl."courseId" = ${this.dbInstance.sequelize.escape(courseId)}`;
		}

		const submitted = await this.dbInstance.sequelize.query(sqlQuery, {
			type: QueryTypes.SELECT,
			replacements: {
				origin: parseInt(modelOrigin[1].originId),
				user: parseInt(userId),
				dtstring: "YYYY-MM-DD at HH24:MI"
			}
		});

		if (submitted.length == 0) {
			return true;
		}
		throw Error(`This lesson ${submitted[0].name}, has already been submitted on ${submitted[0].createdAt}`);		
	}

	/**
	 * The purpose of this function is to ensure that the models recorded
	 * are related to the lessons that the students have started.
	 */
	async registeringInitiation(body, userId, courseId) {
		const modelOriginList = Array();
		const modelsId = Seq(body).filter((_, k) => { 
			const modelKey = k.split('/');
			const _id = parseInt(modelKey[0])
			if (_id < 0 && _.id && _.startLesson) {
				modelOriginList.push({id: _.id, origin: _.originId});
				return true;
			}
			return false;
		}).map((v) => v.id).toArray();
		if (modelsId.length == 0) {
			return;
		}
		
		const t =  await this.dbInstance.sequelize.transaction();
		
		try {
			await this.setOriginAtLesson(t, modelOriginList);
			
			const lessons = await this.getLessonsAttempts( ArrayUtil.removeDuplicates(modelOriginList.map(v => v.origin)), userId);
			const idsDisable = lessons.filter(v => !v._deleted && ((!courseId && !v.courseId) || v.courseId == courseId) && modelsId.indexOf(parseInt(v.id)) == -1).map(v => v.id);
			const idsStarting = lessons.filter(v => !v.startedId && modelsId.indexOf(parseInt(v.id)) != -1).map(v => v.id);

			await this.disableInitiationAttempts(t, idsDisable, userId);
			await this.startLesson(t, idsStarting, userId, courseId || null);
			
			await t.commit();
		} catch(err) {
			await t.rollback();
			err.message = 'Lesson initiation was not successful. '+ err.message;
			throw err;
		}
	}

	/**
	 * The purpose of this function of this function is to list all attempts
	 * that are not deleted lessons and also all of these
	 * have the same origin ID, started by a student ID.
	 */
	async getLessonsAttempts(originIds=[], userId) {
		if (originIds.length == 0) return [];

		let sqlQuery = `with m as (
			select
				msb.id,
				msb.userid,
				msb."prevOrigin",
				msb."_deleted",
				msb.originid as origin
			from model msb
			where
				msb.userid = :userId
				and msb.originid in (:originIds)
				and "_deleted" != true
			)
			select
				m.id,
				m.origin,
				m.userid,
				m."_deleted",
				msl."modelId" as "startedId",
				msl."courseId",
				m."prevOrigin"
			from m
			left join public."ModelStartedLesson" msl on msl."modelId" = m.id`;

		return await this.dbInstance.sequelize.query(sqlQuery, {
			type: QueryTypes.SELECT,
			replacements: {	userId, originIds}
		});
	}

	/**
	 * The purpose of this function is to reconfigure the origin ID
	 * on the new model lesson ID. This was created to resolve an issue
	 * regarding the student having the lesson child of another lesson
	 * of the same student.
	 */
	async setOriginAtLesson(t, originIds=[]) {
		if (originIds.length == 0) return;

		for (const value of originIds) {
			await this.dbInstance.BaseModel.update({
				originid: this.dbInstance.sequelize.literal("fn_get_original_lesson("+value.origin+")"),
				prevOrigin: this.dbInstance.sequelize.literal("originid"),
				_updatedAt: this.dbInstance.sequelize.literal("NOW()")
			}, {
				where: {
					id: {
						[this.dbInstance.Sequelize.Op.eq]: value.id
					},
					type: 'learning',
					_deleted: {[this.dbInstance.Sequelize.Op.ne]: true }
				},
				transaction: t
			});
		}
	}

	async disableInitiationAttempts(t, ids=[], userId = null) {
		if (ids.length == 0) return;

		await this.dbInstance.ModelStartedLesson.update({
			_deletedAt: this.dbInstance.sequelize.literal("NOW()"),
			_deletedBy: userId,
			_deleted: true,
			canceled: 1,
			canceledMsg: 'DISABLED BY RESTART'
		}, {
			where: {
				modelId: {
					[this.dbInstance.Sequelize.Op.in]: ids
				},
				_deleted: {[this.dbInstance.Sequelize.Op.ne]: true }
			},
			transaction: t
		});

		await this.dbInstance.BaseModel.update({
			_deletedAt: this.dbInstance.sequelize.literal("NOW()"),
			_deletedBy: userId,
			_deleted: true
		}, {
			where: {
				id: {
					[this.dbInstance.Sequelize.Op.in]: ids
				},
				type: 'learning',
				_deleted: {[this.dbInstance.Sequelize.Op.ne]: true }
			},
			transaction: t
		});

	}

	async startLesson(t, ids = [], userId = null, courseId = null) {
		if (ids.length == 0) return;

		const startArr = [];
		let _courseId = parseInt(courseId);

		if (!_courseId) {
			_courseId = null;
		}

		ids.forEach((id) => {
			startArr.push({
				modelId: id,
				courseId: _courseId,
				_createdBy: userId,
				_updatedBy: userId
			});
		});

		await this.dbInstance.ModelStartedLesson.bulkCreate(startArr, {
			returning: false,
			transaction: t
		});

	}

	async submitLesson(modelId, instructor) {
		if (!modelId || !instructor) return;

		await this.dbInstance.model_share.create({
			access: 'VIEW',
			creationdate: this.dbInstance.sequelize.fn('NOW'),
			email: null,
			updatedate: this.dbInstance.sequelize.fn('NOW'),
			userid: instructor,
			model_id: modelId,
			id: this.dbInstance.sequelize.fn('nextval', this.dbInstance.sequelize.literal("'model_share_id_seq'"))
		});

		await this.dbInstance.ModelStartedLesson.update({
			submitted: true,
			submittedAt: this.dbInstance.sequelize.fn('NOW')
		}, {
			where: {
				modelId,
				_deleted: {[this.dbInstance.Sequelize.Op.ne]: true },
				submitted: {[this.dbInstance.Sequelize.Op.ne]: true }
			}
		});

	}

	async getInstructorIdByLesson(modelId) {
		const instructor = await this.dbInstance.BaseModel.findOne({
			attributes: ['userid'],
			where: {
				id: this.dbInstance.sequelize.fn('fn_get_original_lesson', parseInt(modelId))
			}
		});
		return instructor === null ? null : instructor.dataValues.userid;
	}

	async getOneStartedLessonByStudent(userId, originId, courseId = null) {
		if (!originId) { throw new Error("Origin ID was not found"); }

		if (courseId && isNaN(courseId)) {
			return null;
		}

		let sqlQuery = `
		select
			p.email as "user",
			m.creationdate as "date",
			m.id as "modelId",
			p.user_id as "userId"
		from "ModelStartedLesson" msl
		inner join model m on m.id = msl."modelId"
		inner join profile p on p.user_id = m.userid`;

		const params = { origin: parseInt(originId), user: parseInt(userId)};

		if (courseId) {
			params.course = parseInt(courseId);
			sqlQuery += ` inner join "UserCourses" uc on uc."UserId" = p.user_id and uc."CourseId" = msl."courseId"`;
			sqlQuery += ` inner join "Courses" c ON c.id = uc."CourseId" and uc."_deleted" != true`;
		}

		sqlQuery += ` where m.userid = :user and m.originid = :origin and m."_deleted" != true`;
		if (courseId) {
			sqlQuery += ` and uc."CourseId" = :course`;
		}
		sqlQuery += ` order by m.userid, m.creationdate desc`;

		const lessonsList = await this.dbInstance.sequelize.query(sqlQuery, {
			type: QueryTypes.SELECT,
			replacements: params
		});
		return (lessonsList.length && lessonsList[0]) || null;

	}

	/**
	 * It checks which lessons were started by users using the original model ID
	 * 
	 * @param {number} userId 
	 * @param {number} versionId 
	 * @param {number} version 
	 * @param {number} courseId 
	 * @param {boolean} skipCourse 
	 * @returns {Promise<{modelId: number, submitted: boolean, name: string}>}
	 */
	async checkStartedLesson(userId, versionId, version, courseId = null, skipCourse = false) {
		let courseSql = '';
		if (courseId && !isNaN(courseId)) {
			courseSql = ` and msl."courseId" = ${Number(courseId)} `;
		} else {
			courseSql = ` and msl."courseId" = null `;
		}
		if (skipCourse === true) {
			courseSql = '';
		}
    try{
      let sqlParams = {userId: parseInt(userId), versionId: parseInt(versionId)};
        const modelShareQuery = `
					with tb_model_id as (
						select modelid from model_version mv where mv.id = :versionId
						order by mv.modelid asc limit 1
					)
          select distinct m."id", mv.id as "versionId", mv."version", msl."modelId", msl."submitted", m."name"
          from "ModelStartedLesson" msl
          inner join "model" m on m."id" = msl."modelId"
					inner join model_version mv on mv.modelid = m.id
          where m."userid" = :userId
					${courseSql}
          and (m."id" = (select tb_model_id.modelid from tb_model_id) or m."originid" = (select tb_model_id.modelid from tb_model_id))
          and m."_deleted" != true
          and msl."_deleted" != true
        `;
        return await this.dbInstance.sequelize.query(modelShareQuery, {
              type: QueryTypes.SELECT,
              replacements: sqlParams
            });
    }catch(e){
      return e;
    }
  }

	/**
	 * 
	 * @param {number} userId 
	 * @param {number} versionId 
	 * @param {number} version 
	 * @returns {Promise<{id: number, versionId: number,version: number, modelId: number, submitted: boolean, name: string, courseId: number, courseName: string}>}
	 */
	async getLessonsByVersionId(userId, versionId, version) {

    try {
      let sqlParams = {userId: parseInt(userId), versionId: parseInt(versionId), version: parseInt(version)};
        const modelShareQuery = `
					with tb_model_id as (
						select modelid from model_version mv where mv.id = :versionId
						order by mv.modelid asc limit 1
					)
          select distinct m."id", mv.id as "versionId", mv."version", msl."modelId", msl."submitted", m."name", c.id as "courseId", c."title" as "courseName"
          from "ModelStartedLesson" msl
          inner join "model" m on m."id" = msl."modelId"
					inner join model_version mv on mv.modelid = m.id
					left join "Courses" c on c.id = msl."courseId" and c."_deleted" != true
          where m."userid" = :userId
          and (m."id" = (select tb_model_id.modelid from tb_model_id) or m."originid" = (select tb_model_id.modelid from tb_model_id))
          and m."_deleted" != true
          and msl."_deleted" != true
					order by m."id" desc
        `;
        let result = await this.dbInstance.sequelize.query(modelShareQuery, {
					type: QueryTypes.SELECT,
					replacements: sqlParams
				});
				return result
    }catch(e){
      return e;
    }
  }

	/**
	 * 
	 * @param {object} body 
	 * @param {number} userId 
	 * @returns {Promise<{'origin_id/version': 'lesson_id/_version'}>}
	 */
	async mappedLessonBodyIds(body, userId) {
		const modelBody = Object.entries(body);
		let result = {};
		let version = new Version(this.dbInstance);
		for (let [modelKey, { currentLesson }] of modelBody) {
			if (!currentLesson || !currentLesson.lessonId) {
				continue;
			}
			if (currentLesson.lessonId == currentLesson.originId) {
				continue;
			}
			if (!currentLesson.versionId) {
				console.log(`Current lesson does not have a valid Version ID.`)
				continue;
			}		
			const canSaveLesson = await version.getModelVersionByModelId(currentLesson.lessonId, userId);
			if (canSaveLesson) {
				let _modelKey = modelKey.split('/')[1];
				result[modelKey] = `${currentLesson.versionId}/${_modelKey}`;
			}
		}
		if (!Seq(result).isEmpty()) {
			return result;
		}
	}
}
