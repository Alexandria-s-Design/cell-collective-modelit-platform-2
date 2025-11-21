import { useId } from "react";
import { QueryTypes } from "sequelize";

export default class Course {

	constructor (modelInstance = null, transaction = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('instance of Sequelize DB was not defined');
		}
		this.dbInstance = modelInstance;
		this.transaction = transaction;
	}

	async removeById(courseId = 0, userId = 0) {		
		if (!userId) {
			throw new Error("A user ID is required to disable course");
		}

		await this.dbInstance.UserCoursesUnenroll.create({
			courseId,
		  userId
		}, {
			transaction: this.transaction
		});

		await this.dbInstance.UserCourse.destroy({
			where: {
				CourseId: courseId,
				UserId: userId
			},
			transaction: this.transaction
		});
	}
	
	async getCompletedLessons(originId, courseId) {
		const sqlQuery = `select
			0 AS rn,
			ms.id,
			ms."access",
			ms.creationdate,
			ms.email,
			ms.updatedate,
			ms.userid,
			ms.model_id,
			ms.modellinkid,
			m.userid AS modeluserid
		from model_share ms
		inner join model m on m.id = ms.model_id
		where ms.model_id
		in (select msl."modelId"
			from "ModelStartedLesson" msl
			where fn_get_original_lesson(msl."modelId") = :origin and msl."courseId" in (:course, null)
		) and m."_deleted" != true`;
		
		const lessonsList = await this.dbInstance.sequelize.query(sqlQuery, {
			type: QueryTypes.SELECT,
			replacements: {
				origin: parseInt(originId),
				course: parseInt(courseId)
			}
		});

		return (lessonsList.length && lessonsList) || [];
	}

	async getStartedLessons(originId, courseId = null) {
		let sqlQuery = `
		select
			p.email as "user",
			m.creationdate as "date",
			p.user_id as "userId",
			':course' as "courseId"
		from "ModelStartedLesson" msl
		inner join model m on m.id = msl."modelId"
		inner join profile p on p.user_id = m.userid`;

		const params = { origin: parseInt(originId) };

		if (courseId) {
			params.course = parseInt(courseId);
			sqlQuery += ` inner join "UserCourses" uc on uc."UserId" = p.user_id and uc."CourseId" = :course`;
			sqlQuery += ` inner join "Courses" c ON c.id = uc."CourseId" and uc."_deleted" != true`;
		}

		sqlQuery += ` where fn_get_original_lesson(msl."modelId") = :origin`;
		sqlQuery += ` and m."_deleted" != true`;
		sqlQuery += ` group by 1, 2, 3, 4`;
		sqlQuery += ` order by p.user_id, m.creationdate desc`;

		const lessonsList = await this.dbInstance.sequelize.query(sqlQuery, {
			type: QueryTypes.SELECT,
			replacements: params
		});
		return (lessonsList.length && lessonsList) || [];
	}

	async getEnrolledStudentsInCourse(courseId) {
		let sqlQuery = `select
			uc."UserId",
			uc."_createdAt",
			p."email",
			c."title"
		from "Courses" c
		inner join "UserCourses" uc on uc."CourseId" = c.id
		inner join profile p on p.user_id = uc."UserId" and (
			select count(1) as t from authority a2
			where a2.user_id = p.user_id and a2.role_id = 1
		) = 0
		where c.id = :course and c."_deleted" != true and uc."_deleted" != true`;

		const students = await this.dbInstance.sequelize.query(sqlQuery, {
			type: QueryTypes.SELECT,
			replacements: { course: parseInt(courseId) }
		});
		return (students.length && students) || [];
	}

	async getCoursesByModelLearning(modelId, userId, onlyPublic) {
		const role = onlyPublic == true ? '(2,3)' : '(1,2,3)';
		let sqlQuery = `
		with model_versions AS (
			select mv2.modelid
			from model_version mv
			inner join model_version mv2 ON mv2.id = mv.id
			where mv.modelid = :model
		)
		select mc."CourseId" as course_id
		from "ModelCourse" mc
		inner join "UserCourses" uc on uc."CourseId" = mc."CourseId" 
		inner join authority a on a.user_id = uc."UserId"
		inner join model_versions mvs on mvs.modelid = mc."ModelId" 
		where a.user_id = :user and a.role_id in ${role}
		group by 1;`
		const courses = await this.dbInstance.sequelize.query(sqlQuery, {
			type: QueryTypes.SELECT,
			replacements: { model: modelId, user: userId }
		});
		return (courses.length && courses) || [];
	}
}
