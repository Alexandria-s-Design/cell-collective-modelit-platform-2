import { Op } from 'sequelize';
import Immutable from 'immutable';
import Response from '../response';
import models, { db } from '../../models';
import { Seq } from 'immutable';
import buildSurvey, { gradeSurveyFull } from '../../util/survey';

/**
 * To calculate score model
 */
const createStudentScores = (scores, modelid, courseid=null) => {
	return Promise.all(Seq(scores).map((v, k) => {
		k = (k === 'null') ? null : parseInt(k);
		let prom;
		if (k !== null) {
			prom = models.LearningObjectiveAssoc.findOne({
				where: {
					sub: k,
					modelid
				}
			}).then(result => result ? result.origin : k);
		} else {
			prom = Promise.resolve(k);
		}
		return prom.then(objective => {
			const where = {
				modelid,
				courseid,
				'for': 'learn',
				objective
			};
			const record = {
				...where,
				score: models.sequelize.literal(`ROUND(${v}, 5)`),
				createdAt: models.sequelize.fn('NOW'),
				updatedAt: models.sequelize.fn('NOW')
			}
			return models.cached_score.customFindOrCreate({
				defaults: record,
				where
			}).then(result => result[0]);
		});
	}).toIndexedSeq().toArray());
}

const getStudentScores = async (modelid, createScore, courseid) => {
	const records = await models.cached_score.findAll({
		where: {
			modelid,
			'for': 'learn'
		}
	});
	
	if (records.length === 0) {

		const submitted = await models.model_initial_state.findOne({
			where: {modelid}
		});

		if (!submitted || submitted.survey == null) {
			return { null: 0 };
		}

		let scores = createScore(modelid);
		if (scores instanceof Promise) {
			scores = await scores;
		}

		if (scores !== null) {
			scores = { ...scores.objectives, [null]: scores.overall };
			let newScores = await createStudentScores(scores, modelid, courseid);
			return Seq(newScores).toKeyedSeq().mapEntries(([_, v]) => [v.objective, v.score]).toObject();
		} else {
			return null;
		}
	} else {
		return Seq(records).toKeyedSeq().mapEntries(([_, v]) => [v.objective, v.score]).toObject();
	}
};

const ModuleFetchQuery = (originmodelid, joins, conditions, columns, options = {}) => {
	if (!joins.some(join => join.table === 'model_version')) {
		joins.push({
			table: 'model_version',
			left: 'model.id',
			right: 'model_version.modelid'
		});
	}
	const conditionString = conditions.concat(options.conditions || []).map(condition => ` AND ${condition.left} ${condition.op || '='} ${condition.right}`).join('');
	const joinString = joins.map(join => ` INNER JOIN ${join.table} ON ${join.left} = ${join.right} `).join('');

	let sql = `SELECT ${columns} FROM model\
		${joinString}\
		WHERE model.id = use_version(model_version.id)\
		${conditionString}`;

	if (originmodelid !== null) {
		sql += ` AND model.originid='${originmodelid}'`
	}

	return sql;	
	
};

const getPercentileForQuery = async (base_query, modelmeta) => {
	const all_query = base_query(modelmeta);

	if (all_query instanceof Error) {
		return {
			value: 0,
			percentile: 0,
			maxPercentile: 0,
			hide: true
		}
	}
	let scoreValue = parseFloat(`${(modelmeta.dataValues.score || 0)}`);
	const studentScores = await db.query(all_query);
	const all = studentScores[0].count;	
	
	const below_query = base_query(modelmeta, {
		conditions: [{
			left: 'ROUND(CAST(cached_scores.score AS numeric), 5)',
			op: '<=',
			right: `ROUND(${scoreValue}, 5)`
		}, modelmeta.dataValues.exclude_institution && {
			left: 'profile.institution_id',
			op: '!=',
			right: modelmeta.dataValues.institution_id
		}].filter(condition => condition)
	});
	let belowOrEqual = (await db.query(below_query))[0].count;

	if (all === 0 && belowOrEqual === 0) {
		return {
			value: null,
			percentile: null,
			maxPercentile: null,
			hide: true,
			ctAllScores: all,
			ctBelowOrEqualScores: belowOrEqual
		}
	}

	let percentile = 100;
	if (all > 0) {
		percentile = Math.round((belowOrEqual / all) * 100);
	}
	if (!scoreValue) {
		percentile = 0;
	}
	return {
		value: percentile,
		ctAllScores: all,
		ctBelowOrEqualScores: belowOrEqual
	}
};

const getStudentCoursePercentile = getPercentileForQuery.bind(null, (modelmeta, options) => {
	return ModuleFetchQuery(null, [{
		table: 'cached_scores',
		left: 'model.id',
		right: 'cached_scores.modelid AND cached_scores.for = \'learn\' AND cached_scores.objective IS NULL'
	}], [{
		left: 'cached_scores.courseid',
		op: '=',
		right: `${modelmeta.dataValues.courseid}`
	}], 'COUNT(model.id), MIN(cached_scores.score) as "minScore", MAX(cached_scores.score) as "maxScore"', options)
});

const getInstitutionPercentile = getPercentileForQuery.bind(null, (modelmeta, options) => {
	if (modelmeta.dataValues.institution_id === null) {
		return new Error();
	}
	return ModuleFetchQuery(modelmeta.originid, [{
		table: 'cached_scores',
		left: 'model.id',
		right: 'cached_scores.modelid AND cached_scores.for = \'learn\' AND cached_scores.objective IS NULL'
	}, {
		table: 'profile',
		left: 'model.userid',
		right: 'profile.user_id'
	}], [{
		left: 'profile.institution_id',
		right: `${modelmeta.dataValues.institution_id}`
	}], 'COUNT(model.id), MIN(cached_scores.score) as "minScore", MAX(cached_scores.score) as "maxScore"', options)
});

const getPeerInstitutionsPercentile = getPercentileForQuery.bind(null, (modelmeta, options) => {
	const q = ModuleFetchQuery(modelmeta.originid, [{
		table: 'cached_scores',
		left: 'model.id',
		right: 'cached_scores.modelid AND cached_scores.for = \'learn\' AND cached_scores.objective IS NULL'
	}, {
		table: 'profile',
		left: 'model.userid',
		right: 'profile.user_id'
	}, {
		table: '"Institutions"',
		left: '"Institutions".id',
		right: 'profile.institution_id'
	}], [{
		left: '"Institutions".category',
		right: `'${modelmeta.dataValues.category}'`
	}], 'COUNT(model.id), MIN(cached_scores.score) as "minScore", MAX(cached_scores.score) as "maxScore"', options);
	return q;
})

const getAllInstitutionsPercentile = getPercentileForQuery.bind(null, (modelmeta, options) => {
	return ModuleFetchQuery(modelmeta.originid, [{
		table: 'cached_scores',
		left: 'model.id',
		right: 'cached_scores.modelid AND cached_scores.for = \'learn\' AND cached_scores.objective IS NULL'
	}, {
		table: 'profile',
		left: 'model.userid',
		right: 'profile.user_id'
	}], [], 'COUNT(model.id), MIN(cached_scores.score) as "minScore", MAX(cached_scores.score) as "maxScore"', options);
});

const getModuleScoreForCourse = async (modelid, courseid, instructorUserId) => {
	let scores = await models.cached_score.findAll({
		where: {
			modelid,
			'for': 'teach',
			courseid
		},
		attributes: [
			'id', 'modelid', 'score', 'createdAt', 'updatedAt', 'courseid', 'objective',
			[models.sequelize.literal(
				`to_timestamp(CONCAT(to_char(NOW(),'YYYY-MM-DD'), ' ', to_char("updatedAt", 'HH24:MI:SS')), 'YYYY-MM-DD HH24:MI:SS')`
				), 'updatedAtUTC']
		],
		order: [['"updatedAt"', 'DESC']]
	});

	modelid = parseInt(modelid);
	courseid = parseInt(courseid);

	const base_query = ModuleFetchQuery.bind(null, modelid, [
		{
			table: 'model_version',
			left: 'model.id',
			right: 'model_version.modelid'
		},
		{
			table: 'model_statistic',
			left: 'model.id',
			right: 'model_statistic.model_id AND model_statistic.type = \'Model Edit\' AND \
model_statistic.id IN (SELECT MAX(id) FROM model_statistic WHERE model_id = model_version.modelid)'
		},
		{
			table: 'model_share',
			left: 'model.id',
			right: `model_share.model_id AND model_share.userid = ${parseInt(instructorUserId)}`
		}
	], [{
		left: 'model.userid',
		op: 'IN',
		right: `(SELECT "UserId" from "UserCourses" WHERE "CourseId" = '${courseid}')`
	}]);

	if (isNaN(modelid) || isNaN(courseid)) {
		throw {
			type: Response.Error.BAD_REQUEST,
			message: 'Model ID and Course ID must be valid integers.'
		};
	}

	// get most recent update among student model_initial_states (only looking at the relevant base models)
	

	let calculate = true;
	if (scores.length > 0) {
		// decide if we need to re-calculate
		const date_query = base_query('max(model.updatedate)');

		const data = (await db.query(date_query))[0];
		if (data === null || data === undefined) {
			return { [null]: 100 }; // no results;
		}
		if (new Date(scores[0].updatedAtUTC).getTime() >= new Date(data.max).getTime()) {
			calculate = false;
		}
	}
	
	if (calculate) {
		const model_query = base_query("model_statistic.metadata, model.id");
		const data = (await db.query(model_query)).map(result => ({modelid: result.id, score: gradeSurveyFull(buildSurvey(JSON.parse(result.metadata).survey), true)}));

		for (const _score of data) {
			const { score, modelid: surveyModelId } = _score;
			const scoreData = { ...score.objectives, [null]: score.overall };			
			await createStudentScores(scoreData, surveyModelId, courseid);
		}

		let toMap = Seq();
		Seq(data).map(ent => ent.score).forEach(score => {
			toMap = toMap.concat(Immutable.fromJS(score).get("objectives").keySeq());
		});
		toMap = toMap.toArray();

		const assocs = await models.LearningObjectiveAssoc.findAll({
			where: {
				sub: {
					[Op.in]: toMap
				}
			}
		});

		const assocMap = {};
		assocs.forEach(result => {
			assocMap[result.sub] = result.origin;
		});

		const totalEntries = data.length;

		const average = Seq(Seq(data).reduce((accumulator, cur) => {
			const scoreData = { ...cur.score.objectives, [null]: cur.score.overall };
			Seq(scoreData).forEach((v, k) => {
				const key = k === 'null' ? null : assocMap[k];
				accumulator[key] = (accumulator[key] || 0) + v
			});
			return accumulator;
		}, {})).map(v => v / totalEntries);

		let promises = [];
		if (scores.length === 0) {
				promises = average.map((v, k) => {
						const key = k === 'null' ? null : parseInt(k);
						const record = {
							modelid,
							'for': 'teach',
							score: v,
							objective: key,
							createdAt: models.sequelize.fn('NOW'),
							updatedAt: models.sequelize.fn('NOW'),
							courseid
						};

						return models.cached_score.customFindOrCreate({
							defaults: record,
							where: {
								objective: key,
								'for': 'teach',
								modelid,
								courseid
							}
					});
				});
		} else {
			promises = scores.map(sc => {
				const updated = average.get(sc.objective);
				sc.score = updated;
				sc.updatedAt = models.sequelize.fn('NOW');
				return sc.save();
			});
		}
		await Promise.all(promises);
		return average.toObject();
	} else {
		return Seq(scores).toKeyedSeq().mapEntries(([k, v]) => [v.objective, v.score]).toObject();
	}
};

const getInstructorScore = (modelid, courseid, instructorUserId) => {
	const query = `select	avg(cs.score) as score
		from model m
		inner join cached_scores cs on cs.modelid = m.id
			and cs."for" = 'learn' and cs.objective is null `;

	return {
		forCourse: async () => {
			const moduleQuery = query + `inner join model m_orig on m_orig.id = m.originid
			inner join "ModelCourse" mc on mc."ModelId" = m.originid
			inner join "Courses" c on c.id = mc."CourseId" and c."_createdBy" = mc."_createdBy"
			where mc."CourseId" = :courseid`;
			const scoreValue = await db.query(moduleQuery, {courseid});
			return { value: Math.round(scoreValue[0].score) };
		},
		forInstitution: async () => {
			const moduleQuery = query + `inner join profile pteach on pteach.user_id = :instructorUserId
			inner join profile plearn on plearn.user_id = m.userid
				and plearn.institution_id = pteach.institution_id
			where m.originid = :modelid`;
			const scoreValue = await db.query(moduleQuery, {modelid, instructorUserId});
			return { value: Math.round(scoreValue[0].score) };
		},
		forAllInstitutions: async () => {
			const moduleQuery = query + `where m.originid = :modelid`;
			const scoreValue = await db.query(moduleQuery, {modelid});
			return { value: Math.round(scoreValue[0].score) };
		},
		forPeerInstitutions: async () => {
			const moduleQuery = query + `inner join profile pteach on pteach.user_id = :instructorUserId
			inner join profile plearn on plearn.user_id = m.userid
			inner join "Institutions" iteach on iteach.id = pteach.institution_id
			inner join "Institutions" ilearn on ilearn.id = plearn.institution_id
				and ilearn.category = iteach.category
			where m.originid = :modelid`;
			const scoreValue = await db.query(moduleQuery, {modelid, instructorUserId});
			return { value: Math.round(scoreValue[0].score) };
		}
	}
}


export {
	getStudentScores,
	getStudentCoursePercentile,
	getInstitutionPercentile,
	getAllInstitutionsPercentile,
	getPeerInstitutionsPercentile,
	getModuleScoreForCourse,
	getInstructorScore
};