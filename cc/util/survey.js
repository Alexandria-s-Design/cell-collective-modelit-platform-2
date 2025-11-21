import { Seq } from 'immutable';

const getChildren = (parentId, children) => {
	return Seq(children).filter(entry => entry.parentId === parentId).toArray();
};

const buildSurvey = metadata => {
	const question = metadata.surveyQuestionMap;
	const optionData = metadata.surveyQuestionOptionMap;
	const tableData = metadata.surveyTableCellMap;

	return Seq(question).mapEntries(([k, v]) => [k, {
		...v,
		id: k
	}]).toIndexedSeq().map(question => {
		const type = question.type;
		const id = question.id;
		if (type === 0) {
			return {
				type: 'text',
				question: question.title,
				text: question.text,
				answer: question.studentAnswer || question.studentText || null,
				points: question.points || 1,
				objective: question.learnId
			};
		} else if (type === 1) {
			let options = Seq(getChildren(id, optionData)).sortBy(e => e.index).toArray();
			return {
				type: 'checkbox',
				question: question.title,
				options: options.map(option => option.text),
				correct: options.filter(option => option.checked).map(option => option.text),
				studentAnswer: options.filter(option => option.studentAnswer).map(option => option.text),
				points: question.points || 1,
				objective: question.learnId
			};
		} else if (type === 2) {
			let options = Seq(getChildren(id, optionData)).sortBy(e => e.index).toArray();
			return {
				type: 'radio',
				question: question.title,
				options: options.map(option => option.text),
				correct: (Seq(options).filter(option => option.checked).first() || { text: null }).text,
				studentAnswer: (Seq(options).filter(option => option.studentAnswer).first() || { text: null }).text,
				points: question.points || 1,
				objective: question.learnId
			};
		} else if (type === 3) {
			let table = [];
			for (let row = 0; row < question.tableRow; row++) {
				table.push([]);
				for (let col = 0; col < question.tableCol; col++) {
					table[row].push({ text: '', studentAnswer: '' });
				}
			}
			Seq(getChildren(id, tableData)).forEach(cell => {
				let row = cell.tRow;
				let col = cell.tCol;
				table[row][col] = {
					text: cell.text || '',
					studentAnswer: cell.studentAnswer || ''
				};
			});
			return {
				type: 'table',
				question: question.title,
				correct: table.map(row => row.map(col => col.text)),
				studentAnswer: table.map(row => row.map(col => col.studentAnswer || '')),
				points: question.points || 1,
				objective: question.learnId
			}
		} else {
			return null;
		}
	}).filter(e=>e).toArray();
};

export const gradeSurveyFull = (builtSurvey, gradeObjectives = false) => {
	const survey = Seq(builtSurvey).filter(question => ['radio', 'checkbox', 'text'].includes(question.type)).toArray();

	const objectives = {};

	const correct = survey.map(question => {
		let score;
		if (question.type === 'checkbox') {
			let sum = question.options.map(option => {
				return (question.correct.includes(option) && question.studentAnswer.includes(option))
					|| (question.correct.length == 0 && question.studentAnswer.length > 0);
			}).reduce((accumulator, currentValue) => {
				if (currentValue) return accumulator + 1;
				else return accumulator;
			}, 0);
			score = question.correct.length ? (question.points / question.correct.length) * sum : 0;
		} else if (question.type === 'radio') {
			score = question.correct === question.studentAnswer ? question.points : 0;
		} else if (question.type === 'text') {
			score = question.points; // adding full points for text questions until we add correct answers for them
		}

		// add score to unique objective
		if (gradeObjectives) {
			if (question.objective != undefined) {
				if (question.objective in objectives) {
					objectives[question.objective].obtained += score;
					objectives[question.objective].possible += question.points;
				} else {
					objectives[question.objective] = {
						obtained: score,
						possible: question.points
					}
				}
			}
		}

		return score;
	}).reduce((accumulator, currentValue) => {
		return accumulator + currentValue;
	}, 0);

	const totalPoints = survey.reduce((accumulator, question) => accumulator + question.points, 0);

	const scores = {
		overall: (correct / totalPoints) * 100
	}
	if (gradeObjectives) {
		scores.objectives = Seq(objectives).map(obj => (obj.obtained / obj.possible) * 100).toObject();
	}

	return scores;
};

export const gradeSurvey = (survey) => {
	return gradeSurveyFull(survey).overall;
};

export default buildSurvey;