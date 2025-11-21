
export class StartedLessonsCollection {
	constructor(startedLessons = []) {
			this.startedLessons = startedLessons;
	}
	static fromRawData(rawData) {
		return new StartedLessonsCollection(
			rawData.map(item => ({
				modelId: item.modelId,
				submitted: item.submitted,
				survey: item.model_initial_state?.survey || null
			}))
		);
	}
	toJSON() {
		return this.startedLessons;
	}
	count() {
		return this.startedLessons.length;
	}
	filterBySubmitted(submitted = true) {
		return new StartedLessonsCollection(this.startedLessons.filter(lesson => lesson.submitted === submitted));
	}
	filterBySurvey() {
		return new StartedLessonsCollection(this.startedLessons.filter(lesson => lesson.survey !== null));
	}
}