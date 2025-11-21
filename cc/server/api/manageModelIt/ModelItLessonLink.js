import uuidv4 from "uuid/v4";
import DateTimeUtil from "../../../util/DateTimeUtil";

export const getNewModelId = async (model) => {
	const lastModel = await model.findOne({
		order: [ ["id", "DESC"] ]
	});		
	return parseInt(lastModel.id) + 1;
}


export default class ModelItLessonLink {

	constructor (modelInstance = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined. '+__filename);
		}
		this.dbInstance = modelInstance;
	}

	/**
	 * 
	 * @param {number} courseId
	 * @returns {Promise<{versionId: number, instructorId: number}>}
	 */
	async getFirstLessonRelatedToCourse(courseId = 0) {
		let lessonCourse = await this.dbInstance.ModelCourse.findOne({
				attributes: ['ModelId', 'CourseId','_createdBy'],
				where: {
					CourseId: courseId,
					_deleted: { [this.dbInstance.Sequelize.Op.ne]: true },
				},
				order: [['_createdAt', 'ASC']],
		});

		if (!lessonCourse) {
			return null;
		}
		lessonCourse = lessonCourse.toJSON();

		let lessonVersion = await this.dbInstance.ModelVersion.findOne({
				attributes: [['id', 'versionId']],
				where: {
					modelid: lessonCourse.ModelId,
				}
		});

		return {
			...lessonVersion.toJSON(),
			instructorId: lessonCourse._createdBy
		}
	}

	/**
	 * @param {{versionId: number, instructorId: number}} lessonRelated
	 * @returns {Promise<{id: number, accesscode: string, startdate: Date, enddate: Date}>}
	 */
	async verifyLessonLink(lessonRelated) {		
		const modelLink = await this.dbInstance.model_link.findOne({
			attributes: ['id', 'accesscode', 'startdate', 'enddate'],
			where: {
				userid: lessonRelated.instructorId,
				model_id: lessonRelated.versionId,
			}
		});
		if (modelLink) {
			return modelLink.toJSON();
		}
		return null;
	}

	/**
	 * 
	 * @param {number} courseId 
	 * @param {string} lessonCode 
	 * @param {Date} endDate 
	 * @returns 
	 */
	async generateLessonLinkByCourse(courseId = 0, lessonCode='', endDate = null) {
		
		const lessonRelatedToCourse = await this.getFirstLessonRelatedToCourse(courseId);

		if (!lessonRelatedToCourse) {
			throw new Error(`No lesson found for this code ${lessonCode}.`);
		}

		const shareableLessonCode = await this.verifyLessonLink(lessonRelatedToCourse);

		if (shareableLessonCode) {
			if (endDate && DateTimeUtil.toUtcMs(shareableLessonCode.enddate) != DateTimeUtil.toUtcMs(endDate)) {
				await this.dbInstance.model_link.update({
					enddate: endDate,
					updatedate: this.dbInstance.Sequelize.fn('NOW'),
				}, {
					where: {
						id: shareableLessonCode.id
					}
				});
			}
			return shareableLessonCode.accesscode;
		}

		const accessCode = uuidv4();

		await this.dbInstance.model_link.create({
			id: await getNewModelId(this.dbInstance.model_link),
			userid: lessonRelatedToCourse.instructorId,
			model_id: lessonRelatedToCourse.versionId,
			accesscode: accessCode,
			access: 'VIEW',
			startdate: this.dbInstance.Sequelize.fn('NOW'),
			enddate: endDate || this.dbInstance.Sequelize.literal("DATE_ADD(NOW(), INTERVAL 1 DAY)"),
			accesscount: 0,
			creationdate: this.dbInstance.Sequelize.fn('NOW'),
			updatedate: this.dbInstance.Sequelize.fn('NOW'),
		});

		return accessCode;
	}

}