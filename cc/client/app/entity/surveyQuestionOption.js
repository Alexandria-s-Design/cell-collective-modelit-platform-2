import Entity from "./Entity";

export default class SurveyQuestionOption extends Entity{}

Entity.init({SurveyQuestionOption}, {
	text: null,
	parentId: { ref: "options"},
	index: null,
	checked: null,
	studentAnswer: null
});