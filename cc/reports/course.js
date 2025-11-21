import { Op } from 'sequelize';
import models, { db } from '../models';
import moment from 'moment';
import  { Seq } from "immutable";
function is_null_row(row) {
  for (const k in row) {
    if (row[k] != null) return false;
  }
  return true;
}

function mapRichEditable(text) {
	if (!text || typeof text == 'string') return text;
	let ret = '';
	for (var block_id in text) for (var each_block in text[block_id]) ret = text[block_id][each_block].text;
	return ret;
}


function populateSurveyVersionsBase(versions=[], surveyData={}) {
	 for (const vData of versions) {
		try {
			if (!vData.dataValues.metadata) {
				continue;
			}
			let parseSurveyVersion = JSON.parse(vData.dataValues.metadata);
			Object.keys(parseSurveyVersion).forEach(ksurvey => {
				if (ksurvey in surveyData) {
					surveyData[ksurvey] = {...surveyData[ksurvey], ...parseSurveyVersion[ksurvey]}
				} else {
					surveyData[ksurvey] = {...parseSurveyVersion[ksurvey]}
				}
			})
		} catch(err) {	console.error(err)	}
	 }
}
export default async (modelID, { startDate = '1970-01-01', endDate = moment(), userId = 0 } = {}, courseId = null) => {
  startDate = `${moment(startDate).format('YYYY-MM-DD')} 00:00:00.000`;
  endDate = `${moment(endDate).format('YYYY-MM-DD')} 23:59:59.999`;

	// let initialStateQuery = `SELECT id FROM model WHERE originid=${models.sequelize.escape(modelID)}`;
	// if (courseId !== null) {
	// 	 initialStateQuery += ` AND userid IN (SELECT "UserId" from "UserCourses" where "CourseId"=${models.sequelize.escape(courseId)})`;
	// }

	// const modelIS = await models.model_initial_state.findAll({
	// 	where: {
	// 		modelid: {
	// 			[Op.in]: [models.sequelize.literal(initialStateQuery)]
	// 		}
	// 	}
	// });


	let whereUser = userId ? ` and model.userid = '${userId}'`: '';

  const query = `${courseId !== null ? `with cte_courses as (select "UserId" as userid from "UserCourses" where "CourseId"='${courseId}')` : '' }
	select * from (select
						profile.user_id						 as userid,
            profile.firstname          as first_name,
            profile.lastname           as last_name,
            profile.email              as email,
            inst."name"         			 as institution,
            model.updatedate           as last_updated_date,
            null as metadata
        from model
				inner join model_share on
						model_share.model_id = model.id
        left join profile on
            model.userid = profile.user_id
				left join "Institutions" inst on
						inst.id = profile.institution_id 
        left join model_initial_state on
            model.id = model_initial_state.modelid
        where model.originid in (${modelID}) and model.updatedate between '${startDate}' and '${endDate}'
				and model._deleted = false
				${courseId !== null ? 'and model.userid in (select userid from cte_courses)' : ''}
				${whereUser} 
				group by
					profile.user_id,
					profile.firstname,
					profile.lastname,
					profile.email,
					inst."name",
					model.updatedate
				) tb_insights
				order by
					tb_insights.first_name,
					tb_insights.last_name`;

	const baseLessonState = await models.model_initial_state.findOne({
		attributes: ['modelid', ['survey', 'metadata']],
		where: { modelid: modelID }
	});

	const studentsVersions = await models.sequelize.query(`
		with ${courseId !== null ? `cte_courses as (select "UserId" as userid from "UserCourses" where "CourseId"='${courseId}'),` : '' }
		cte_lessons as (
			select mv.modelid, m.userid
			from model_version mv
			inner join model m on m.id = mv.modelid
			where m.originid = ${modelID}
				and m.userid != (select userid from model m2 where m2.id = ${modelID})
				${courseId !== null ? 'and m.userid in (select userid from cte_courses)' : ''}
				and m.updatedate between '${startDate}' and '${endDate}'
				and m._deleted != true
		)
		select ctel.userid, ctel.modelid, mis."survey" as "metadata"
		from "model_initial_state" mis
		inner join "cte_lessons" as ctel on ctel.modelid = mis.modelid
		and mis."survey" is not null`, { type: 'SELECT' });
	
	const baseLessonVersions = await models.model_initial_state.findAll({
		attributes: [['survey', 'metadata']],
		where: { modelid: {
			[models.Sequelize.Op.in]:
				models.sequelize.literal(
					`(select modelid from model_version mv
						inner join model m on m.id = mv.modelid
						where mv.id=${modelID} and mv.modelid !=${modelID}
						and m._deleted != true
						)`
				)
		} }
	});
  const results = await db.query(query);
  const report = buildReport(results, baseLessonState, {lessons: studentsVersions, base: baseLessonVersions});
  return report;
};


const SUBSCRIPTION_PERIOD_IN_DAYS = 180;

function subscriptionExpired(updatedAt){
	let expiring_date = new Date(updatedAt);
	expiring_date.setDate(expiring_date.getDate()+SUBSCRIPTION_PERIOD_IN_DAYS);
	return new Date().getTime() > expiring_date.getTime();
}

export async function getCourseUserReport(courseId){
	const query = `select
	p.firstname        as first_name,
	p.lastname         as last_name,
	p.email            as email,
	p.institution      as institution,
	(SELECT "AccountPlanId" FROM "UserSubscriptions" us WHERE us."_createdBy" = uc."UserId" ORDER BY "_updatedAt" DESC ) as plan_id,
	(SELECT "_updatedAt" FROM "UserSubscriptions" us WHERE us."_createdBy" = uc."UserId" ORDER BY "_updatedAt" DESC ) as plan_subscription_time
	from "UserCourses" uc
	left join "profile" p on
			p.user_id = uc."UserId"
	where
			uc."CourseId" = :courseId`;

	let result = (await db.query(query, {courseId}));

	result = result.map((ret) => ({
		is_premium: !!(ret.plan_subscription_time && !subscriptionExpired(new Date(ret.plan_subscription_time))),
		...ret
	}));
	return result;
}

export async function buildReport(studentLessons = [], baseLesson, lessonsVersions) {
	const initialColumns = ['First Name', 'Last Name', 'Email', 'Institution', 'Last Updated Date'];
	let data = [],
			surveyHead = {},
			table_flattener = {},
			set_columns = new Set(initialColumns);

	try {
		let surveyArr = '';
		let surveyQuestionArr = '';
		const surveyData = JSON.parse(baseLesson.dataValues.metadata);
		 
			if (lessonsVersions) {
				populateSurveyVersionsBase(lessonsVersions.base, surveyData);
			}

		 if(surveyData != null && surveyData != undefined){
				if(surveyData.surveyMap != null && surveyData.surveyMap != undefined){
					surveyArr = Object.entries(surveyData.surveyMap);
				}
				if(surveyData.surveyQuestionMap != null && surveyData.surveyQuestionMap != undefined){
					surveyQuestionArr = Object.entries(surveyData.surveyQuestionMap);
				}

			surveyArr.forEach(val => {
				const keySurveyHead = `${val[1].index}${val[0]}`;
				if (!(keySurveyHead in surveyHead)) {
					surveyHead[keySurveyHead] = {};
				}
				surveyHead[keySurveyHead].id = val[0];
				surveyHead[keySurveyHead].name = val[1].name;
				const questionVal = surveyQuestionArr.filter(q => q[1].parentId == val[0]);
				if (questionVal.length) {
					for (const qVal of questionVal) {
						const colName = `${val[1].name} - ${qVal[1].title}`;
						if (!('questionsName' in surveyHead[keySurveyHead])) {
							surveyHead[keySurveyHead].questionsName = [];
						}
						if (!('questions' in surveyHead[keySurveyHead])) {
							surveyHead[keySurveyHead].questions = [];
						}
						surveyHead[keySurveyHead].questionsName.push(qVal[1].title);
						surveyHead[keySurveyHead].questions.push({id: qVal[0], col: colName, ...qVal[1]});
						set_columns.add(colName);
					}
				}
			});
		 }
		

	} catch(err) {
		err.message = `Survey data invalid (${err.message})`;
		throw err;
	}
	let results = studentLessons.map(props => {
		let _props = { ...props }
		if (lessonsVersions) {
			let _propsMetada = {};
			lessonsVersions.lessons.filter(v => v.userid === _props.userid).forEach(v => {		
				populateSurveyVersionsBase(Array({dataValues: v}), _propsMetada)
			});
			_props.metadata = _propsMetada;
		}
		return _props;
	});

  let row = {};
	let prev_row = [];
  let prev_email = null;

  results.map((result, row_idx) => {
    const first_name 				= result.first_name;
    const last_name 				= result.last_name;
    const emailID 					= result.email;
    const institution 			= result.institution;
    const last_updated_date = result.last_updated_date;
    const metadata 					= result.metadata;

		let tableData = '';
		let metadataSurvey = '';
    let metadataOption = '';
    let metadataQuestion = '';

		if(metadata != '' && metadata != null){
			if(metadata.surveyTableCellMap != undefined && metadata.surveyTableCellMap != null){
				tableData = metadata.surveyTableCellMap;
			}
			if(metadata.surveyMap != undefined && metadata.surveyMap != null){
				metadataSurvey = Object.entries(metadata.surveyMap);
			}
			if(metadata.surveyQuestionOptionMap != undefined && metadata.surveyQuestionOptionMap != null){
				metadataOption = Object.values(metadata.surveyQuestionOptionMap);
			}
			if(metadata.surveyQuestionMap != undefined && metadata.surveyQuestionMap != null){
				metadataQuestion = Object.entries(metadata.surveyQuestionMap);
			}
			
		}


    let unique = false;
    if (prev_email != emailID) {
      row = {};
    }

    row[initialColumns[0]] = first_name;
    row[initialColumns[1]] = last_name;
    row[initialColumns[2]] = emailID;
    row[initialColumns[3]] = institution;
    row[initialColumns[4]] = moment(last_updated_date).format('YYYY-MM-DD HH:mm:ss');

		// Start survey columns empty
		Array.from(set_columns).filter(col => !initialColumns.includes(col)).forEach(col => (row[col] = ''));
		surveyHead = Seq(surveyHead);
		for (const valSurvey of metadataSurvey) {
			const surveyHeadFilter = surveyHead.filter(vl => `${vl.name}`.trim() == `${valSurvey[1].name}`.trim()).toArray();
			if (!surveyHeadFilter.length || !surveyHeadFilter[0].questions) {
				continue;
			}

			//Setting index of each equation id
			surveyHeadFilter[0].questions.forEach(_question => {

				let questionFilter = metadataQuestion.filter(vl => 
					vl[1].parentId == valSurvey[0]
					&& vl[1].title == _question.title
					&& vl[1].type == _question.type
				);
				
				if (questionFilter.length) {
					questionFilter = questionFilter[0];
					const colName 			= _question.col,
								question 			= questionFilter[1].title,
								question_id 	= questionFilter[0],
								question_type = questionFilter[1].type;

					//If the type of response type of question is 0
					if (question_type === 0) {
						row[colName] = mapRichEditable(questionFilter[1].studentText) || mapRichEditable(questionFilter[1].text) || '';
					} else if (question_type === 3) {
						// Construct table data map
						let table = {};
						for (let cellk in tableData) {
							let cell = tableData[cellk];
							if (cell.parentId === question_id) {
								if (cell.tRow === 0 || cell.tCol === 0) {
									table[[cell.tCol, cell.tRow]] = cell.text; // use predetermined headers, NOT the null studentAnswer field lol
								} else {
									table[[cell.tCol, cell.tRow]] = cell.studentAnswer !== undefined ? cell.studentAnswer : cell.text;
								}
							}
						}
						if(metadataQuestion[question_id]){
						// Convert table into mapping, i.e. { 'RowName+ColumnName': CellValue }
						let RCtoValueMap = {};
						let tableRows = metadataQuestion[question_id].tableRow;
						let tableCols = metadataQuestion[question_id].tableCol;
						for (let x = 1; x < tableCols; x++) {
							let top_header = '';
							if ([x, 0] in table) {
								top_header = table[[x, 0]] || x + '';
							} else {
								continue;
							}
							for (let y = 1; y < tableRows; y++) {
								let coords = [x, y];
								let left_header = '';
								if ([0, y] in table) {
									left_header = table[[0, y]] || y + '';
								} else {
									continue;
								}
								if (coords in table && table[coords] !== undefined) {
									let key = `${question}_${left_header}+${top_header}`;
									RCtoValueMap[key] = table[coords];
									table_flattener[key] = question;
								}
							}
						}
						row[colName] = RCtoValueMap;
						} else {
							row[colName] = '';
						}
					} else if ([1,2].includes(question_type)) {
						const optionsFilter = metadataOption.filter(vl => vl.parentId == question_id);
						let rowOptions = '';

						for (const _option of optionsFilter) {
							if ((_option.hasOwnProperty('studentAnswer') === true && _option.studentAnswer == true)) {								
									//If type is 1 multiple
									if (question_type === 1) {
										if (rowOptions == "") {
											rowOptions = _option.text;
										} else {
											rowOptions += ' & ' + _option.text;
										}
									}				
									//If type is 2 radio
									else if (question_type === 2) {
										rowOptions = _option.text;
									}
							}
						}
						row[colName] = rowOptions;
					}
				}
			});

		}

		data.push(row);

    // Saving previous row to merge with next user if its same
    prev_email = result.email;
    prev_row = row;
  });

	return {
		columns: Array.from(set_columns),
		data
	}
}