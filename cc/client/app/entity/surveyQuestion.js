import Entity from "./Entity";

const Classification = {
	Skills: {
		0: "Model Building",
		1: "Model Validation",
		2: "Behavior Simulations"
	},
	Types: {
		0: "Participation",
		1: "Assessment"
	}
};

export { Classification };

export default class SurveyQuestion extends Entity{}

Entity.init({SurveyQuestion}, {
	title: null,
	parentId: { ref: "questions" },
	index: null,
	type: { defaultVal: 0 },
	tableRow: { defaultVal: 0 },
	tableCol: { defaultVal: 0 },
	text: null,
	learnId: { link: "mLearningObjective" },
	learnSkill: null,
	learnType: { defaultVal: 0 },
	studentText: null,
	points: { defaultVal: 0 },
	questionText: null,
	position: { defaultVal: 0 },
}, {
	options: false,
	tableCells: false
}, true);