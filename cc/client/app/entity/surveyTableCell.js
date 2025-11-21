import Entity from "./Entity";

export default class SurveyTableCell extends Entity{}

Entity.init({SurveyTableCell}, {
	parentId: { ref: "tableCells" },
	tCol: null,
	tRow: null,
	text: null,
	studentAnswer: null
});