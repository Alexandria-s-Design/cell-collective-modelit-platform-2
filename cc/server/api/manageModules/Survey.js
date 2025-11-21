
export default class Survey {

	constructor (modelInstance = null) {
		if (!modelInstance || !('Sequelize' in modelInstance)) {
			throw new Error('Instance of Sequelize DB was not defined');
		}
		this.dbInstance = modelInstance;
	}

	async getParsedSurvey(lessonId = 0) {
		let modelInitialState = await this.dbInstance.model_initial_state.findOne({
			where: {
				modelid: lessonId
			}
		});
		if (!modelInitialState) {
			throw new Error('The survey has not started by student!')
		}
		if (modelInitialState.survey === null) {
			return null;
		}
		return JSON.parse(modelInitialState.survey)
	}

}
