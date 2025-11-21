/**
 * 
 */
package cc.dataaccess.main.repository;

import java.util.Calendar;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cc.common.data.model.Model;

/**
 * @author bkowal
 *
 */
public interface ModelRepository extends JpaRepository<Model, Long> {

//	public static String FETCH_MODELS_FIELDS = "SELECT DISTINCT m.id, m.name, m.description, m.tags, m.userId, m.author, m.creationDate, m.biologicUpdateDate, m.knowledgeBaseUpdateDate, m.updateDate, m.components, m.interactions, m.published, m.cited, m.type, m.originId, m.modelType, CASE WHEN (m.biologicUpdateDate >= m.knowledgeBaseUpdateDate) THEN m.biologicUpdateDate ELSE m.knowledgeBaseUpdateDate END as myupdatedate, ms.score FROM Model m LEFT JOIN ModelScore ms ON ms.id = m.id ";
	public static String FETCH_MODELS_FIELDS = 
						"SELECT DISTINCT "+
								"m.id, "+
								"m.name, "+
								"m.description, "+
								"m.tags, "+
								"m.userId, "+
								"m.author, "+
								"m.creationDate, "+
								"m.biologicUpdateDate, "+
								"m.knowledgeBaseUpdateDate, "+
								"m.updateDate, "+
								"m.components, "+
								"m.interactions, "+
								"m.published, "+
								"m.cited, "+
								"m.type, "+
								"m.originId, "+
								"m.modelType, "+
								"CASE WHEN (m.biologicUpdateDate >= m.knowledgeBaseUpdateDate) THEN m.biologicUpdateDate ELSE m.knowledgeBaseUpdateDate END as myupdatedate "+
//								"CASE WHEN m_score.cited IS NULL THEN m_score.score ELSE 0 END as cited, "+
//								"CASE WHEN m_score.score IS NULL THEN m_score.score ELSE 0 END as score "+
								"FROM Model m ";//+
//								"LEFT OUTER JOIN model_score m_score ON m_score.id = m.id ";

	public static final int ID_INDEX                = 0;
	public static final int NAME_IDX                = 1;
	public static final int DESCRIPTION_IDX         = 2;
	public static final int TAGS_IDX                = 3;
	public static final int USERID_IDX              = 4;
	public static final int AUTHOR_IDX              = 5;
	public static final int CREATIONDATE_IDX        = 6;
	public static final int BIOLOGICUPDATEDATE_IDX  = 7;
	public static final int KBUPDATEDATE_IDX        = 8;
	public static final int UPDATEDATE_IDX          = 9;
	public static final int COMPONENTS_IDX          = 10;
	public static final int INTERACTIONS_IDX        = 11;
	public static final int PUBLISHED_IDX           = 12;
	public static final int CITED_IDX               = 13;
	public static final int TYPE_IDX                = 14;
	public static final int ORIGINID_IDX            = 15;
	public static final int MODELTYPE_IDX           = 16;
	public static final int MYUPDATEDATE_IDX        = 17;
	public static final int SCORE_CITED_IDX         = 18;
	public static final int SCORE_SCORE_IDX         = 19;

	public static String FETCH_MODELS_FIELDS_COMPLETE = 
						"SELECT DISTINCT "+
								"m.id, "+
								"m.name, "+
								"m.description, "+
								"m.tags, "+
								"m.userId, "+
								"m.author, "+
								"m.creationDate, "+
								"m.biologicUpdateDate, "+
								"m.knowledgeBaseUpdateDate, "+
								"m.updateDate, "+
								"m.components, "+
								"m.interactions, "+
								"m.published, "+
								"m.cited, "+
								"m.type, "+
								"m.originId, "+
								"m.modelType, "+
								"CASE WHEN (m.biologicUpdateDate >= m.knowledgeBaseUpdateDate) THEN m.biologicUpdateDate ELSE m.knowledgeBaseUpdateDate END as myupdatedate, " +
								"CASE WHEN m_score.citations IS NULL THEN m_score.score ELSE 0 END as citations, "+
								"CASE WHEN m_score.score IS NULL THEN m_score.score ELSE 0 END as score "+
								"FROM Model m " +
								"LEFT OUTER JOIN model_score m_score ON m_score.id = m.id ";

	public static String FETCH_MODELS_FIELDS_COMPLETE_FULL =
			"SELECT DISTINCT "+
					"m.id, "+
					"m.name, "+
					"m.description, "+
					"m.tags, "+
					"m.userId, "+
					"m.author, "+
					"m.creationDate, "+
					"m.biologicUpdateDate, "+
					"m.knowledgeBaseUpdateDate, "+
					"m.updateDate, "+
					"m.components, "+
					"m.interactions, "+
					"m.published, "+
					"m.cited, "+
					"m.type, "+
					"m.originId, "+
					"m.modelType, "+
					"CASE WHEN (m.biologicUpdateDate >= m.knowledgeBaseUpdateDate) THEN m.biologicUpdateDate ELSE m.knowledgeBaseUpdateDate END as myupdatedate, " +
					"CASE WHEN m_score.citations IS NULL THEN m_score.score ELSE 0 END as citations, "+
					"CASE WHEN m_score.score IS NULL THEN m_score.score ELSE 0 END as score, "+
					"(m.id IN (SELECT ms.model_id FROM model_share ms WHERE ms.userId = :userId)) as isShared,"+
					"(m.id IN (SELECT mda.modelid FROM model_domain_access mda WHERE mda.userId = :userId)) as isWorkspace "+
					"FROM Model m " +
					"LEFT OUTER JOIN model_score m_score ON m_score.id = m.id ";

	public static String FETCH_MODELS_FIELDS_FOR_SORTING = 
			"SELECT DISTINCT "+
										"m.id, "+
										"m.name, "+
										"m.description, "+
										"m.tags, "+
										"m.userId, "+
										"m.author, "+
										"m.creationDate, "+
										"m.biologicUpdateDate, "+
										"m.knowledgeBaseUpdateDate, "+
										"m.updateDate, "+
										"m.components, "+
										"m.interactions, "+
										"m.published, "+
										"m.cited, "+
										"m.type, "+
										"m.originId, "+
										"m.modelType, "+
										"GREATEST(m.biologicUpdateDate, m.knowledgeBaseUpdateDate) as myupdatedate, " +
										"CASE WHEN m_score.citations IS NULL THEN 0 ELSE m_score.citations END as citations, "+
										"CASE WHEN m_score.score IS NULL THEN 0 ELSE m_score.score END as score "+
										"FROM Model m " +
										"LEFT OUTER JOIN model_score m_score ON m_score.id = m.id ";


	public static String COUNT_MODELS_FIELDS = "SELECT COUNT(DISTINCT (SELECT id FROM model_version mv WHERE mv.modelid=m.id LIMIT 1)) FROM Model m";
	public static String GET_IDS_MODELS = "SELECT DISTINCT m.id FROM Model m";
	public static String GET_IDS_MODEL_VERSIONS = "SELECT DISTINCT " +
				"  (CASE \n" + 
				"     WHEN m.modelType = 'boolean' THEN model_version.id \n" +
				"     ELSE m.id \n" +
				"  END) AS id \n" +
				" FROM model m";

	public static String FETCH_MODELS_IDS_FIELDS_FOR_SORTING_AND_PUBLISHED_MODELS_PREDICATE = 
			"SELECT "+
				"id "+
			"FROM ("+
				"SELECT DISTINCT "+
					"m.id, "+
					"CASE WHEN m_score.citations IS NULL THEN 0 ELSE m_score.citations END as citations, "+
					"GREATEST(m.biologicUpdateDate, m.knowledgeBaseUpdateDate) as myupdatedate, "+
					"CASE WHEN m_score.score IS NULL THEN 0 ELSE m_score.score END as score "+
				"FROM Model m " +
				"LEFT OUTER JOIN model_score m_score ON m_score.id = m.id " +
				"INNER JOIN model_version ON m.id = model_version.modelid " +
				"WHERE "+
					"(type IN (:domains)) "+
					"AND (modeltype IN (:modelTypes) "+
					"AND (m.published = 'true') "+
					"AND (m._deleted = false) "+
					"AND model_version.modelid = use_version(model_version.modelid)" +
			")) AS sub ";

	//	public static String FETCH_MODELS_FIELDS = "SELECT DISTINCT m.\"id\", m.\"name\", m.\"description\", m.\"tags\", m.\"userId\", m.\"author\", m.\"creationdate\", m.\"biologicupdatedate\", m.\"knowledgebaseupdatedate\", m.\"updatedate\", m.\"components, m.interactions, m.published, m.cited, m.type, m.originId, m.\"modelType\" FROM Model m";

	/**
	 * Returns a {@link List} of {@link Model}s that are viewable to the anonymous
	 * user.
	 * 
	 * @return a {@link List} of visible {@link Model}s.
	 */
	@Query("SELECT m.id, m.name, m.description, m.tags, m.userId, m.author, m.creationDate, m.biologicUpdateDate, m.knowledgeBaseUpdateDate, m.updateDate, m.components, m.interactions, m.published, m.cited, m.type, m.originId, m.modelType FROM Model m WHERE m.published = 'true'")
	public List<Object> getVisibleModelsAnonymous();

	@Query("SELECT m.id, m.name, m.description, m.tags, m.userId, m.author, m.creationDate, m.biologicUpdateDate, m.knowledgeBaseUpdateDate, m.updateDate, m.components, m.interactions, m.published, m.cited, m.type, m.originId, m.modelType FROM Model m WHERE (m.published = 'true') AND lower(m.name) LIKE lower(:nameLike)")
	public List<Object> searchVisibleModelsAnonymous(@Param("nameLike") String nameLike);

	@Query("SELECT m.id, m.name, m.description, m.tags, m.userId, m.author, m.creationDate, m.biologicUpdateDate, m.knowledgeBaseUpdateDate, m.updateDate, m.components, m.interactions, m.published, m.cited, m.type, m.originId, m.modelType FROM Model m WHERE (m.published = 'true') AND m.id IN (SELECT s.model.id FROM SpeciesIdentifier s WHERE lower(s.name) LIKE lower(:nameLike))")
	public List<Object> searchVisibleModelsAnonymousWithSpecies(@Param("nameLike") String nameLike);

	@Query("SELECT DISTINCT m.id, m.name, m.description, m.tags, m.userId, m.author, m.creationDate, m.biologicUpdateDate, m.knowledgeBaseUpdateDate, m.updateDate, m.components, m.interactions, m.published, m.cited, m.type, m.originId, m.modelType FROM Model m WHERE (m.published = 'true') AND m.id IN (SELECT s.model.id FROM SpeciesIdentifier s WHERE s.id IN (SELECT p.id FROM Page p WHERE p.id IN (SELECT se.page.id FROM Section se WHERE se.id IN (SELECT c.section.id FROM Content c WHERE lower(c.text) LIKE lower(:contentLike)))))")
	public List<Object> searchVisibleModelsAnonymousWithKnowledgeContent(@Param("contentLike") String contentLike);

	// Model category queries
	@Query("SELECT COUNT(DISTINCT id) FROM Model m WHERE type = :type AND published = 'true'")
	public Integer getPublicModelCount(@Param("type") String type);

	/**
	 * Returns a {@link List} of all {@link Model}s that are viewable to the
	 * currently authenticated user.
	 * 
	 * @param userId
	 *            the id of the currently authenticated user.
	 * @return a {@link List} of visible {@link Model}s.
	 */
	@Query(nativeQuery=true, value = FETCH_MODELS_FIELDS+" WHERE (m.published = 'true') OR (m.userId = :userId) OR (m.id IN (SELECT ms.model_id FROM ModelShare ms WHERE ms.userId = :userId))")
	public List<Object> getVisibleModelsAuthenticated(@Param("userId") long userId);



	/* Paginated */
	/* Important: These queries depend on a SQL function defined by the Node server upon initialization (use_version) */
	public static String ORDER_BY_RECENT = "  ORDER BY myupdatedate DESC";	
	public static String ORDER_BY_POPULAR = "  ORDER BY citations DESC";
	public static String ORDER_BY_RECOMMENDED = "  ORDER BY score DESC";
	public static String PAGINATION_ORDER_LIMIT = " LIMIT :limit OFFSET :offset";

	public static String NOT_DELETED_WHERE = " (m._deleted = false)";
	public static String MY_MODELS_WHERE = " (m.userId = :userId) AND " + NOT_DELETED_WHERE;	
	public static String DOMAINS_WHERE = " (type IN (:domains)) ";
	public static String MODELTYPE_WHERE = " (modeltype IN (:modelTypes)) ";

	public static String MY_MODELS_PREDICATE = " INNER JOIN model_version ON m.id = model_version.modelid WHERE" + DOMAINS_WHERE + " AND " + MODELTYPE_WHERE + " AND "
	+ MY_MODELS_WHERE + " AND model_version.modelid = fn_latest_version(model_version.modelid, m.modeltype)";
	//+ MY_MODELS_WHERE + " AND model_version.modelid = use_version(model_version.modelid) ";
	@Query(nativeQuery=true, value = FETCH_MODELS_FIELDS + MY_MODELS_PREDICATE + ORDER_BY_RECENT + PAGINATION_ORDER_LIMIT)
	public List<Object> getMyModels(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes, @Param("userId") long userid, @Param("limit") int limit, @Param("offset") int offset);
	@Query(nativeQuery=true, value = COUNT_MODELS_FIELDS + MY_MODELS_PREDICATE)
	public Object getMyModelsCount(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes, @Param("userId") long userId);

	public static String PUBLISHED_MODELS_WHERE = " (m.published = 'true') AND " + NOT_DELETED_WHERE;	
	public static String PUBLISHED_MODELS_PREDICATE = " INNER JOIN model_version ON m.id = model_version.modelid WHERE " + DOMAINS_WHERE + " AND " + MODELTYPE_WHERE + " AND "
		+ PUBLISHED_MODELS_WHERE + " AND model_version.modelid = use_version(model_version.modelid)";
	@Query(nativeQuery=true, value = COUNT_MODELS_FIELDS + PUBLISHED_MODELS_PREDICATE)
	public Object getPublishedModelsCount(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes);
	@Query(nativeQuery=true, value = FETCH_MODELS_FIELDS_FOR_SORTING + PUBLISHED_MODELS_PREDICATE + ORDER_BY_POPULAR + PAGINATION_ORDER_LIMIT)
	public List<Object> getPublishedModelsOrderByPopular(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes, @Param("limit") int limit, @Param("offset") int offset);
	
	@Query(nativeQuery=true, value = FETCH_MODELS_IDS_FIELDS_FOR_SORTING_AND_PUBLISHED_MODELS_PREDICATE + ORDER_BY_POPULAR + PAGINATION_ORDER_LIMIT)
	public List<Long> getPublishedModelsIdsOrderByPopular(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes, @Param("limit") int limit, @Param("offset") int offset);

	@Query(nativeQuery=true, value = FETCH_MODELS_IDS_FIELDS_FOR_SORTING_AND_PUBLISHED_MODELS_PREDICATE + ORDER_BY_RECENT + PAGINATION_ORDER_LIMIT)
	public List<Long> getPublishedModelsIdsOrderByRecent(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes, @Param("limit") int limit, @Param("offset") int offset);

	@Query(nativeQuery=true, value = FETCH_MODELS_IDS_FIELDS_FOR_SORTING_AND_PUBLISHED_MODELS_PREDICATE + ORDER_BY_RECOMMENDED + PAGINATION_ORDER_LIMIT)
	public List<Long> getPublishedModelsIdsOrderByRecommended(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes, @Param("limit") int limit, @Param("offset") int offset);

	@Query(nativeQuery=true, value = FETCH_MODELS_FIELDS_FOR_SORTING + PUBLISHED_MODELS_PREDICATE + ORDER_BY_RECENT + PAGINATION_ORDER_LIMIT)
	public List<Object> getPublishedModelsOrderByRecent(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes, @Param("limit") int limit, @Param("offset") int offset);
	
	@Query(nativeQuery=true, value = FETCH_MODELS_FIELDS_FOR_SORTING + PUBLISHED_MODELS_PREDICATE + ORDER_BY_RECOMMENDED + PAGINATION_ORDER_LIMIT)
	public List<Object> getPublishedModelsOrderByRecommended(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes, @Param("limit") int limit, @Param("offset") int offset);

	public static String SHARED_MODELS_WHERE = " (m.id IN (SELECT ms.model_id FROM model_share ms WHERE ms.userId = :userId)) AND " + NOT_DELETED_WHERE;
	public static String SHARED_MODELS_PREDICATE = " INNER JOIN model_version ON m.id = model_version.modelid WHERE" + DOMAINS_WHERE + " AND " + MODELTYPE_WHERE + " AND "
		+ SHARED_MODELS_WHERE;
	@Query(nativeQuery=true, value = COUNT_MODELS_FIELDS+SHARED_MODELS_PREDICATE)
	public Object getSharedWithMeModelsCount(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes, @Param("userId") long userId);
	@Query(nativeQuery=true, value = FETCH_MODELS_FIELDS + SHARED_MODELS_PREDICATE + PAGINATION_ORDER_LIMIT)
	public List<Object> getSharedWithMeModels(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes, @Param("userId") long userId, @Param("limit") int limit, @Param("offset") long offset);

	public static String ALL_MODELS_WHERE_AUTHENTICATED = "("+SHARED_MODELS_WHERE+" OR "+MY_MODELS_WHERE+ " OR "+PUBLISHED_MODELS_WHERE+")";	
	public static String ALL_MODELS_WHERE_AUTHENTICATED_NOT_JUST_PUBLISHED = "("+SHARED_MODELS_WHERE+" OR "+MY_MODELS_WHERE+ " OR "+NOT_DELETED_WHERE+")";	

	public static String WORKSPACE_MODELS_WHERE = " (m.id IN (SELECT mda.modelid FROM model_domain_access mda WHERE mda.userId = :userId)) AND " + NOT_DELETED_WHERE;	
	public static String WORKSPACE_MODELS_PREDICATE = " INNER JOIN model_version ON m.id = model_version.modelid WHERE " + DOMAINS_WHERE + " AND " + MODELTYPE_WHERE + " AND "
		+ WORKSPACE_MODELS_WHERE + " AND " + ALL_MODELS_WHERE_AUTHENTICATED + " AND model_version.modelid = use_version(model_version.id)";
//	SELECT * FROM model_domain_access WHERE domain='TEACH' AND userId = ${userId}
	@Query(nativeQuery=true, value = COUNT_MODELS_FIELDS + WORKSPACE_MODELS_PREDICATE)
	public Object getWorkspaceModelsCount(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes, @Param("userId") long userId);
	@Query(nativeQuery=true, value = FETCH_MODELS_FIELDS + WORKSPACE_MODELS_PREDICATE + PAGINATION_ORDER_LIMIT)
	public List<Object> getWorkspaceModels(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes, @Param("userId") long userId, @Param("limit") int limit, @Param("offset") int offset);

	// Retrieve all model version IDs for a given user, domains and types
	@Query(nativeQuery=true, value = GET_IDS_MODEL_VERSIONS + MY_MODELS_PREDICATE)
	public List<Long> getMyModelsIds(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes, @Param("userId") long userId);

	@Query(nativeQuery=true, value = GET_IDS_MODELS + WORKSPACE_MODELS_PREDICATE)
	public List<Long> getWorkspaceModelsIds(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes, @Param("userId") long userId);
	
	// Retrieve all shared model version IDs for a given user, domains and types
	@Query(nativeQuery=true, value = GET_IDS_MODEL_VERSIONS+SHARED_MODELS_PREDICATE)
	public List<Long> getSharedWithMeModelsIds(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes, @Param("userId") long userId);
	@Query(nativeQuery=true, value = GET_IDS_MODELS + PUBLISHED_MODELS_PREDICATE)
	public List<Long> getPublishedModelsIds(@Param("domains") List<String> domains, @Param("modelTypes") List<String> modelTypes);
	
	//TODO: add domain restriction to queries :)
	public static String SINGLE_MODEL_WHERE = " m.id = :id";	
	@Query(nativeQuery=true, value = FETCH_MODELS_FIELDS+" WHERE "+SINGLE_MODEL_WHERE+" AND "+ALL_MODELS_WHERE_AUTHENTICATED)
	public Object getSingleModelAuthenticated(@Param("userId") long userId, @Param("id") long id);
	@Query(nativeQuery=true, value = FETCH_MODELS_FIELDS+" WHERE"+SINGLE_MODEL_WHERE+" AND ("+PUBLISHED_MODELS_WHERE+")")
	public Object getSingleModelPublic(@Param("id") long id);
	/**** End pagination */
	
	@Query(FETCH_MODELS_FIELDS+" WHERE ((m.published = 'true') OR m.userId = :userId OR m.id IN (SELECT ms.model_id FROM ModelShare ms WHERE ms.userId = :userId)) AND lower(m.name) LIKE lower(:nameLike) AND " + NOT_DELETED_WHERE)
	public List<Object> searchVisibleModelsAuthenticated(@Param("userId") long userId,
			@Param("nameLike") String nameLike);

	@Query(FETCH_MODELS_FIELDS+" WHERE ((m.published = 'true') OR m.userId = :userId OR m.id IN (SELECT ms.model_id FROM ModelShare ms WHERE ms.userId = :userId)) AND m.id IN (SELECT s.model.id FROM SpeciesIdentifier s WHERE lower(s.name) LIKE lower(:nameLike)) AND " + NOT_DELETED_WHERE)
	public List<Object> searchVisibleModelsAuthenticatedWithSpecies(@Param("userId") long userId,
			@Param("nameLike") String nameLike);

	@Query(FETCH_MODELS_FIELDS+" WHERE ((m.published = 'true') OR m.userId = :userId OR m.id IN (SELECT ms.model_id FROM ModelShare ms WHERE ms.userId = :userId)) AND m.id IN (SELECT s.model.id FROM SpeciesIdentifier s WHERE s.id IN (SELECT p.id FROM Page p WHERE p.id IN (SELECT se.page.id FROM Section se WHERE se.id IN (SELECT c.section.id FROM Content c WHERE lower(c.text) LIKE lower(:contentLike))))) AND " + NOT_DELETED_WHERE)
	public List<Object> searchVisibleModelsAuthenticatedWithKnowledgeContent(@Param("userId") long userId,
			@Param("contentLike") String contentLike);

	@Query("SELECT m.id, m.name, m.description, m.tags, m.userId, m.author, m.creationDate, m.biologicUpdateDate, m.knowledgeBaseUpdateDate, m.updateDate, m.components, m.interactions, m.published, m.cited, m.type, m.originId, m.modelType FROM Model m WHERE m.id = :id")
	public Object getModelRecordById(@Param("id") long id);

	@Query("SELECT m.id FROM Model m WHERE (SELECT ms FROM ModelScore ms WHERE ms.id = m.id) IS NULL OR (SELECT ms FROM ModelScore ms WHERE ms.id = m.id AND m.updateDate > ms.lastCalculationDate) IS NOT NULL")
	public List<Long> getOutdatedScores();

	@Query("SELECT m.id FROM Model m WHERE m.name = :name AND m.userId = :userId AND m.creationDate = :creationDate AND " + NOT_DELETED_WHERE)
	public List<Long> findLegacyMatch(@Param("name") String name, @Param("userId") Long userId,
			@Param("creationDate") Calendar creationDate);

	@Query("SELECT m.id FROM Model m WHERE m.name = :name AND m.published = 'true' AND " + NOT_DELETED_WHERE)
	public List<Long> findPublishedLegacyMatch(@Param("name") String name);

	@Modifying
	@Query("UPDATE Model m SET m.updateDate = :updateDate, m.biologicUpdateDate = :biologicUpdateDate, m.knowledgeBaseUpdateDate = :knowledgeBaseUpdateDate, m.components = :components, m.interactions = :interactions, m.published = :published, m.name = :name, m.description = :description, m.tags = :tags, m.author = :author, m.type = :type, m.originId = :originId WHERE m.id = :id")
	public void updateModelRecord(@Param("id") long id, @Param("updateDate") Calendar updateDate,
			@Param("biologicUpdateDate") Calendar biologicUpdateDate,
			@Param("knowledgeBaseUpdateDate") Calendar knowledgeBaseUpdateDate, @Param("components") int components,
			@Param("interactions") int interactions, @Param("published") boolean published, @Param("name") String name,
			@Param("description") String description, @Param("tags") String tags, @Param("author") String author,
			@Param("type") String type, @Param("originId") Long originId);

	@Modifying
	@Query("UPDATE Model m SET m.updateDate = :updateDate WHERE m.id = :id")
	public void updateModelRecord(@Param("id") long id, @Param("updateDate") Calendar updateDate);

	@Modifying
	@Query("DELETE FROM Model m WHERE m.id = :id")
	public void deleteModelById(@Param("id") long id);
}