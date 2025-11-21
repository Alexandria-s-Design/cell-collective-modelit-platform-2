import Lesson from "../manageModules/Lesson";
import Scores from "../manageModules/Scores";
import Course from "./Course";

export default class ManageCourse {

	constructor (modelInstance = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined');
		}
		this.dbInstance = modelInstance;
	}

	async unenroll(userId, courseId = 0) {
		const t = await this.dbInstance.sequelize.transaction();
		const lesson = new Lesson(this.dbInstance, t);
		const course = new Course(this.dbInstance, t);
		const scores = new Scores(this.dbInstance, t);
		try {
			const lessonList = (await lesson.getLessonsIdByCourse(courseId, userId)).map(d => d.id);
			await lesson.disableRows(lessonList, userId);
			await course.removeById(courseId, userId);
			await scores.removeScoreByLessons(lessonList, courseId);
			await lesson.removeSubmittedLessons(lessonList);
			await t.commit();
		} catch (error) {
			await t.rollback();
			error.message = `Unenroll from course: ${error.message}`;
			throw error;
		}
		return {message: "Unenrolled was successful!"}
	}
}
