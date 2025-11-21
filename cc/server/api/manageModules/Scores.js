import buildSurvey, { gradeSurveyFull } from '../../../util/survey';
import { DataTypes } from "sequelize";


export default class Scores {

	constructor (modelInstance = null, transaction = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('instance of Sequelize DB was not defined');
		}
		this.dbInstance = modelInstance;
		this.transaction = transaction;
	}

	async createScoresByLessonId(lessonId = 0) {
		let modelInitialState = await this.dbInstance.model_initial_state.findOne({
			where: {
				modelid: lessonId
			}
		});
	
		if (modelInitialState.survey === null) {
			return null;
		} 
		const surveyColumnType = this.dbInstance.model_initial_state.rawAttributes.survey.type;
		if (modelInitialState && surveyColumnType instanceof DataTypes.TEXT) {
				try {
						modelInitialState.survey = JSON.parse(modelInitialState.survey);
				} catch (error) {
						console.error("Error parsing survey JSON:", error);
				}
		}	
		if (!modelInitialState.survey.surveyMap) {
			return null;
		}
		const gradeParser = gradeSurveyFull(buildSurvey(modelInitialState.survey), true);

		return {
			overall: gradeParser.overall,
			objectives: gradeParser.objectives
		}
	}

	async removeScoreByLessons(lessonList = [], courseId = 0) {
		if (!courseId) {
			throw new Error("Course ID is required to remove scores");
		}
		await this.dbInstance.cached_score.destroy({
			where: {
				modelid: {
					[this.dbInstance.Sequelize.Op.in]: lessonList
				},
				courseid: courseId,
				for: 'learn'
			},
			transaction: this.transaction
		});
	}
}
