import Entity from "./Entity";

export default class SurveyQuestionText extends Entity{}

Entity.init({SurveyQuestionText}, {
	text: null,
	parentId: { ref: "questionsText" },
	index: null,
	position: { defaultVal: 0 },
	questionId: null
});