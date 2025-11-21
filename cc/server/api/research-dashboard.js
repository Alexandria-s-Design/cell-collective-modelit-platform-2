import moment from "moment";
import { QueryTypes } from 'sequelize';
import models from "../../models"
import { getCoverImage } from './model/utils';


const FETCH_DASHBOARD_CARDS_BASE_QUERY = `
SELECT DISTINCT 
	m.id, 
	m.name, 
	m.description, 
	m.tags, 
	m.userId, 
	m.author, 
	m.creationDate, 
	m.biologicUpdateDate, 
	m.knowledgeBaseUpdateDate, 
	m.updateDate, 
	m.components, 
	m.interactions,
	m.published AS public,
	m.cited, 
	m.type AS domainType, 
	m.originId, 
	m.modelType, 
	model_version.version AS modelVersion,
	model_version.name AS modelVersionName,
	model_version.id AS modelVersionId,
	model_version.selected,
	GREATEST(m.biologicUpdateDate, m.knowledgeBaseUpdateDate) as myupdatedate, 
	CASE WHEN m_score.citations IS NULL THEN 0 ELSE m_score.citations END as citations, 
	CASE WHEN m_score.score IS NULL THEN 0 ELSE m_score.score END as score 
FROM Model m 
LEFT OUTER JOIN model_score m_score ON m_score.id = m.id 
INNER JOIN model_version ON m.id = model_version.modelid 
WHERE type IN (:domains)
AND (model_version.selected = true OR model_version.version = 1)
AND model_version."_deleted" != true
AND m.published = true
`

const FETCH_MY_MODELS_QUERY = `
		SELECT DISTINCT 
		m.id, 
		m.name, 
		m.description, 
		m.tags, 
		m.userId, 
		m.author, 
		m.creationDate, 
		m.biologicUpdateDate, 
		m.knowledgeBaseUpdateDate, 
		m.updateDate,
		m.components, 
		m.interactions, 
		m.published, 
		m.cited, 
		m.type, 
		m.originId, 
		m.modelType, 
		model_version.version AS modelVersion,
		model_version.name AS modelVersionName,
		model_version.id AS modelVersionId,
		model_version.selected,
		CASE WHEN (m.biologicUpdateDate >= m.knowledgeBaseUpdateDate) THEN m.biologicUpdateDate ELSE m.knowledgeBaseUpdateDate END as myupdatedate 
		FROM Model m
		INNER JOIN model_version ON m.id = model_version.modelid WHERE (type IN (:domains))  AND (modeltype IN (:modelTypes)) AND
		(m.userId = :userId) AND (m._deleted = false)  AND model_version.modelid = fn_latest_version(model_version.modelid, m.modeltype)
		ORDER BY myupdatedate DESC
		LIMIT :limit OFFSET :offset
`;

const FETCH_SHARED_MODELS_QUERY = `
	SELECT DISTINCT
	m.id,
	m.name,
  m.description,
  m.tags,
  m.userId,
	m.author,
	m.creationDate,
	m.biologicUpdateDate,
	m.knowledgeBaseUpdateDate,
	m.updateDate,
	m.components,
	m.interactions,
	m.published,
	m.cited,
	m.type,
	m.originId,
	m.modelType,
	model_version.version AS modelVersion,
	model_version.name AS modelVersionName,
	model_version.id AS modelVersionId,
	model_version.selected,
	CASE WHEN (m.biologicUpdateDate >= m.knowledgeBaseUpdateDate) THEN m.biologicUpdateDate ELSE m.knowledgeBaseUpdateDate END as myupdatedate
	FROM Model m
  INNER JOIN model_version ON m.id = model_version.modelid WHERE (type IN (:domains)) AND  (modeltype IN (:modelTypes))  AND
  (m.id IN (SELECT ms.model_id FROM model_share ms WHERE ms.userId = :userId)) AND  (m._deleted = false)
	LIMIT :limit OFFSET :offset
`;

const ORDER_BY_UPDATE_DATE = " ORDER BY myupdatedate DESC "
const ORDER_BY_SCORE = " ORDER BY score DESC "
const ORDER_BY_CITATIONS = " ORDER BY citations DESC "
const LIMIT = " LIMIT :limit OFFSET :offset "

export const DashboardCategory = {
	RECENT: "RECENT",
	POPULAR: "POPULAR",
	RECOMMENDED: "RECOMMENDED",
	REFERENCED: "REFERENCED"
}

export const getModelCardData = async (domains, modelTypes, category, limit, offset, searchQuery = null) => {
	const categoryQueryMap = {
		RECENT: ORDER_BY_UPDATE_DATE,
		POPULAR: ORDER_BY_CITATIONS,
		RECOMMENDED: ORDER_BY_SCORE,
	}

  const order_by = categoryQueryMap[category] || categoryQueryMap[DashboardCategory.RECENT];

  let query = `${FETCH_DASHBOARD_CARDS_BASE_QUERY}`;

  // if (category === DashboardCategory.REFERENCED) {
  //   query += ` AND m.is_reference = true`; // is_reference is not available in m
  // }

	console.log('modelTypes here', modelTypes);
  if (modelTypes.length > 0) {
    const lowerCaseModelToFilter = modelTypes.map(type => type.toLowerCase());
    query += ` AND m.modelType IN (:lowerCaseModelToFilter)`;
  }
	
	if (searchQuery) {
    query += ` 
      AND (
        m.name ILIKE '%' || :searchQuery || '%' 
        OR m.description ILIKE '%' || :searchQuery || '%' 
        OR m.author ILIKE '%' || :searchQuery || '%' 
        OR m.tags ILIKE '%' || :searchQuery || '%'
        OR model_version.name ILIKE '%' || :searchQuery || '%'
      )`;
  }

	// const modelToFilter = modelTypes;
	// const lowerCaseModelToFilter = modelToFilter.map(type => type.toLowerCase());

  query += ` ${order_by} ${LIMIT}`;
	const sql_data = await models.sequelize.query(query, {
		type: QueryTypes.SELECT,
		replacements: { domains, limit, offset, 
		...(modelTypes.length > 0 && { 
			lowerCaseModelToFilter: modelTypes.map(t => t.toLowerCase()) 
		}),
		...(searchQuery && { searchQuery })},
	})

	const modelData = []
	// models data
	const processedModelIds = new Set();
	for (const model of sql_data) {

		if (processedModelIds.has(model.id)) {
			// duplicate model. probably because the model_version 1 is not the default
			// if current being processed default, remove the previous one
			if (model.selected) {
				const index = response.findIndex(m => m.id === model.id);
				if (index !== -1) {
					response.splice(index, 1);
				}
			}
		}
		//sometimes author is null for some reason
		let author = model.author;
		if (!author) {
			const profile = await getUserProfile(model.userid);
			author = profile.firstname + ' ' + profile.lastname;
		}

		let mdata = {
			id: model.id,
			name: model.name,
			description: model.description,
			tags: model.tags,
			userId: model.userId,
			author: author,
			createdAt: formatDate(model.creationdate),
			biologicUpdateDate: formatDate(model.biologicupdatedate),
			knowledgeBaseUpdateDate: formatDate(model.knowledgebaseupdatedate),
			updateDate: formatDate(model.updatedate),
			components: model.components,
			interactions: model.interactions,
			public: model.public,
			cited: model.cited,
			domainType: model.domaintype,
			originId: model.originid,
			modelType: model.modeltype,
			version: model.modelversion,
			defaultVersionId: model.modelversionid, // could have another one. this is removed if it is not
			modelVersionName: model.modelversionname,
			updatedAt: formatDate(model.myupdatedate),
			citations: model.citations,
			score: model.score,
			hash: (new Date()).getTime() + '003',
			coverImage: await getCoverImage(`${model.id}`)
		}

		if (mdata.modelType === 'metabolic') {
			mdata = { ...mdata, ...await getAdditionalDataForMetabolicModels(model.id) };
		}

		processedModelIds.add(model.id);
		modelData.push(mdata);
	}
	return modelData
}

export const getMyModels = async function (domains, modelTypes, userId) {
	return await getUserModels(FETCH_MY_MODELS_QUERY, domains, modelTypes, userId);
}

export const getSharedModels = async (domains, modelTypes, userId) => {
	return await getUserModels(FETCH_SHARED_MODELS_QUERY, domains, modelTypes, userId);
}


export const getModelCount = async (domains, modelTypes, userId = 0) => {

	const lowerCaseModelTypes = modelTypes.map(type => type.toLowerCase());

	const query = `
	SELECT  
	 count(m.id) AS ncount
	FROM Model m 
	LEFT OUTER JOIN model_score m_score ON m_score.id = m.id 
	INNER JOIN model_version ON m.id = model_version.modelid 
	WHERE type IN (:domains) AND modeltype IN (:lowerCaseModelTypes) AND m.published = true 
	`
	const { ncount } = (await models.sequelize.query(query, {
		type: QueryTypes.SELECT,
		replacements: { domains, lowerCaseModelTypes: lowerCaseModelTypes},
	}))[0];

	let myModelCount = 0, sharedModelCount = 0;

	if (userId > 0) {
		myModelCount = await getMyModelCount(domains, modelTypes, userId);
		sharedModelCount = await getSharedModelCount(domains, modelTypes, userId);
	}
	return {
		"published": ncount,
		"my_model": myModelCount,
		"shared": sharedModelCount
	}
}

const getAdditionalDataForMetabolicModels = async (id) => {
	const data = (await models.sequelize.query(
		"SELECT " +
		'	(SELECT COUNT(*) FROM "MetaboliteConstraintBasedModel" WHERE "MetaboliteConstraintBasedModel"."ConstraintBasedModelId" = "ConstraintBasedModels"."id") nmetabolites,  ' +
		'	(SELECT COUNT(*) FROM "ReactionConstraintBasedModel" WHERE "ReactionConstraintBasedModel"."ConstraintBasedModelId" = "ConstraintBasedModels"."id") nreactions,  ' +
		'	(SELECT COUNT(*) FROM "GeneConstraintBasedModel" WHERE "GeneConstraintBasedModel"."ConstraintBasedModelId" = "ConstraintBasedModels"."id") ngenes										' +
		'	FROM "ConstraintBasedModels" ' +
		'	WHERE "ConstraintBasedModels"."id"= :id'
		, {
			type: QueryTypes.SELECT,
			replacements: { id: id },
		}
	))[0]

	if (data) {
		const { nmetabolites, nreactions, ngenes } = data
		return {
			n_metabolites: parseInt(nmetabolites),
			n_reactions: parseInt(nreactions),
			n_genes: parseInt(ngenes)
		}
	}
	return {
		n_metabolites: 0,
		n_reactions: 0,
		n_genes: 0
	}
}

const getUserModels = async function (fetch_query, domains, modelTypes, userId) {
	if (userId === 0) {
		return [];
	}
	const limit = 999999999
	const offset = 0
	const lowerCaseModelTypes = modelTypes.map(type => type.toLowerCase());
	const sql_data = await models.sequelize.query(fetch_query, {
		type: QueryTypes.SELECT,
		replacements: { domains, modelTypes: lowerCaseModelTypes, userId, limit, offset },
	})

	const modelData = []
	for (const model of sql_data) {
		let d = {
			id: model.id,
			name: model.name,
			description: model.description,
			tags: model.tags,
			userId: model.userId,
			author: model.author,
			createdAt: formatDate(model.creationdate),
			biologicUpdateDate: formatDate(model.biologicupdatedate),
			knowledgeBaseUpdateDate: formatDate(model.knowledgebaseupdatedate),
			updateDate: formatDate(model.updatedate),
			components: model.components,
			interactions: model.interactions,
			published: model.published,
			cited: model.cited,
			domainType: model.type,
			originId: model.originid,
			modelType: model.modeltype,
			modelVersionName: model.modelversionname,
			updatedAt: formatDate(model.myupdatedate),
			hash: (new Date()).getTime() + '003',
			coverImage: await getCoverImage(`${model.id}`)
		}
		if (d.modelType === 'metabolic') {
			d = { ...d, ...await getAdditionalDataForMetabolicModels(model.id) };
		}
		modelData.push(d);
	}

	return modelData;
}

const getMyModelCount = async (domains, modelTypes, userId) => {

	const lowerCaseModelTypes = modelTypes.map(type => type.toLowerCase());

	const query = `
		SELECT COUNT(DISTINCT (SELECT id FROM model_version mv WHERE mv.modelid=m.id LIMIT 1)) FROM Model m
		INNER JOIN model_version ON m.id = model_version.modelid WHERE (type IN (:domains))  AND (modeltype IN (:lowerCaseModelTypes)) AND
		(m.userId = :userId) AND (m._deleted = false)  AND model_version.modelid = fn_latest_version(model_version.modelid, m.modeltype)
	`

	const data = (await models.sequelize.query(query, {
		type: QueryTypes.SELECT,
		replacements: { domains, lowerCaseModelTypes , userId },
	}))[0];
	return data.count;
}

const getSharedModelCount = async (domains, modelTypes, userId) => {

	const lowerCaseModelTypes = modelTypes.map(type => type.toLowerCase());

	const query = `
		SELECT COUNT(DISTINCT (SELECT id FROM model_version mv WHERE mv.modelid=m.id LIMIT 1)) FROM Model m
	    INNER JOIN model_version ON m.id = model_version.modelid WHERE (type IN (:domains)) AND  (modeltype IN (:modelTypes))  AND
		(m.id IN (SELECT ms.model_id FROM model_share ms WHERE ms.userId = :userId)) AND  (m._deleted = false);
	`;
	const data = (await models.sequelize.query(query, {
		type: QueryTypes.SELECT,
		replacements: { domains, modelTypes: lowerCaseModelTypes, userId },
	}))[0];
	return data.count;
}

const formatDate = function (date) {
	if (date) {
		return moment(date).format('DD/MM/YYYY'); 
	}
  return '';
}

export const getInstitutions = async () => {
	const query = `
		SELECT name from "Institutions";
	`;
	const data = (await models.sequelize.query(query, {
		type: QueryTypes.SELECT,
	}));
	return data.map(d => d.name);
}


export const getUserProfile = async (userId) => {
	const user = models.Profile.findOne({ where: { user_id: userId } });
	return user
}
