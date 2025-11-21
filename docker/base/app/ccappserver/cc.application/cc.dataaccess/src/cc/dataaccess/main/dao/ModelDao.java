/**
 * 
 */
package cc.dataaccess.main.dao;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.Map;
import java.util.Objects;
import java.util.HashMap;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.persistence.NoResultException;

import org.hibernate.Session;
import org.hibernate.SQLQuery;

import java.sql.Timestamp;

import org.apache.commons.collections4.CollectionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;

import cc.common.data.model.Model;
import cc.common.data.model.ModelDomainAccess;
import cc.common.data.model.ModelDomainAccessId;
import cc.common.data.model.ModelIdentifier;
import cc.common.data.model.ModelInitialState;
import cc.common.data.model.ModelShare;
import cc.dataaccess.DataAction;
import cc.dataaccess.main.repository.ModelDomainAccessRepository;
import cc.dataaccess.main.repository.ModelIdentifierRepository;
import cc.dataaccess.main.repository.ModelInitialStateRepository;
import cc.dataaccess.main.repository.ModelRepository;
import cc.dataaccess.main.repository.ModelShareRepository;

/**
 * @author bkowal
 *
 */
public class ModelDao {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ModelRepository modelRepository;

	@Autowired
	private ModelIdentifierRepository modelIdentifierRepository;

	@Autowired
	private ModelDomainAccessRepository modelDomainAccessRepository;

	@Autowired
	private ModelShareRepository modelShareRepository;

	@Autowired
	private ModelInitialStateRepository modelInitialStateRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	@Autowired
	@Qualifier("mainEntityManagerFactory")
	private EntityManager em;

	// -- BEGIN methods that could not be implemented with HQL --

	public List<Object> getVisibleModelsAuthenticated(Long userId) {
		return transactionTemplate.execute(new TransactionCallback<List<Object>>() {
			@Override
			public List<Object> doInTransaction(TransactionStatus status) {
				Session session = em.unwrap(Session.class);
				SQLQuery query = session.createSQLQuery(ModelRepository.FETCH_MODELS_FIELDS_COMPLETE + " WHERE (m.published = 'true') OR (m.userId = :userId) OR "
					+ "(m.id in (SELECT ms.model_id from model_share ms where ms.userId = :userId))");
				query.setParameter("userId", userId);
				List<Object> modelData = query.list();
				return modelData;
			}
		});
	}

	public List<Model> getAllModels(List<String> domains, List<String> modelTypes, Long userId) {
		if(userId == null){
			return transactionTemplate.execute(new TransactionCallback<List<Model>>() {
				@Override
				public List<Model> doInTransaction(TransactionStatus status) {
					List<String> translatedDomains = domains.stream().map(domain -> domain.equals("teaching") ? "learning" : domain).collect(Collectors.toList());

					String sql = String.format("%s WHERE%s AND %s AND %s",
							ModelRepository.FETCH_MODELS_FIELDS_COMPLETE, ModelRepository.DOMAINS_WHERE,
							ModelRepository.MODELTYPE_WHERE,
							ModelRepository.PUBLISHED_MODELS_WHERE);
					System.out.println(sql);
					Query query = em.createNativeQuery(sql);
					query.setParameter("domains", translatedDomains);
					query.setParameter("modelTypes", modelTypes);

					List<Object> returnValues = query.getResultList();

					List<Model> models = new ArrayList<>(returnValues.size());
					for (Object returnValue : returnValues) {
						models.add(buildModelFromRecord( buildRecordFromRaw( (Object[]) returnValue )  ));
					}

					return models;
				}
			});
		}

		return transactionTemplate.execute(new TransactionCallback<List<Model>>() {
			@Override
			public List<Model> doInTransaction(TransactionStatus status) {
				List<String> translatedDomains = domains.stream().map(domain -> domain.equals("teaching") ? "learning" : domain).collect(Collectors.toList());

				String sql = String.format("%s WHERE%s AND %s AND (%s OR %s OR %s OR %s)",
									ModelRepository.FETCH_MODELS_FIELDS_COMPLETE_FULL, ModelRepository.DOMAINS_WHERE,
						ModelRepository.MODELTYPE_WHERE,
						ModelRepository.PUBLISHED_MODELS_WHERE, ModelRepository.MY_MODELS_WHERE, ModelRepository.WORKSPACE_MODELS_WHERE, ModelRepository.SHARED_MODELS_WHERE);
				System.out.println(sql);
				Query query = em.createNativeQuery(sql);
				query.setParameter("domains", translatedDomains);
				query.setParameter("modelTypes", modelTypes);
				query.setParameter("userId", userId);

				List<Object> returnValues = query.getResultList();

				List<Model> models = new ArrayList<>(returnValues.size());
				for (Object returnValue : returnValues) {
					models.add(buildModelFromRecordDetail( buildRecordFromRaw( (Object[]) returnValue )  ));
				}

				return models;
			}
		});
	}


	// -- END --

	public ModelInitialState getModelInitialState(final Long id) {
		return transactionTemplate.execute(new TransactionCallback<ModelInitialState>() {
			@Override
			public ModelInitialState doInTransaction(TransactionStatus status) {
				return modelInitialStateRepository.findOne(id);
			}
		});
	}

	public List<ModelInitialState> getModelInitialStates(final Iterable<Long> ids) {
		if (!ids.iterator().hasNext()) {
			return Collections.emptyList();
		}
		return transactionTemplate.execute(new TransactionCallback<List<ModelInitialState>>() {
			@Override
			public List<ModelInitialState> doInTransaction(TransactionStatus status) {
				return modelInitialStateRepository.findAll(ids);
			}
		});
	}

	public List<Model> getViewableModels(final Long userId) {
		return transactionTemplate.execute(new TransactionCallback<List<Model>>() {
			@Override
			public List<Model> doInTransaction(TransactionStatus status) {
				List<Object> returnValues;
				if (userId == null) {
					returnValues = modelRepository.getVisibleModelsAnonymous();
				} else {
					returnValues = modelRepository.getVisibleModelsAuthenticated(userId);

					// test new getVisibleModelsAuthenticated method
					getVisibleModelsAuthenticated(userId);
				}
				if (CollectionUtils.isEmpty(returnValues)) {
					return Collections.emptyList();
				}
				List<Model> models = new ArrayList<>(returnValues.size());
				for (Object returnValue : returnValues) {
					models.add(buildModelFromRecord((Object[]) returnValue));
				}

				return models;
			}
		});
	}

	public List<Model> getModelsForCards(final String domain, final List<String> modelTypes, final String type, final String orderBy, final Long _userId, final int limit, final int offset) {
		final String translatedDomain = domain.equals("teaching") ? "learning" : domain;
		final Long userId = _userId == null ? -1 : _userId;
		return transactionTemplate.execute(new TransactionCallback<List<Model>>() {
			@Override
			public List<Model> doInTransaction(TransactionStatus status) {
				List<Object> returnValues;


				ArrayList<String> domains = new ArrayList<String>( 
            Arrays.asList(translatedDomain));

				if(type.equals("published")){

					// if(domain.equals("learning")){
					// 	//learn gets in published also research models :)
					// 	domains.add("research");
					// }

					if(orderBy != null && orderBy.equals("popular")){
						returnValues = modelRepository.getPublishedModelsOrderByPopular(domains, modelTypes, limit, offset);
					}else if(orderBy != null && orderBy.equals("recommended")){
						returnValues = modelRepository.getPublishedModelsOrderByRecommended(domains, modelTypes, limit, offset);
					}else{
						returnValues = modelRepository.getPublishedModelsOrderByRecent(domains, modelTypes, limit, offset);
					}
				}else if(type.equals("my")){
					returnValues = modelRepository.getMyModels(domains, modelTypes, userId, limit, offset);
				}else if(type.equals("shared")){
					returnValues = modelRepository.getSharedWithMeModels(domains, modelTypes, userId, limit, offset);
				}else if(type.equals("workspace")){
					returnValues = modelRepository.getWorkspaceModels(domains, modelTypes, userId, limit, offset);
				}else{
					return Collections.emptyList();
				}

				if (CollectionUtils.isEmpty(returnValues)) {
					return Collections.emptyList();
				}
				List<Model> models = new ArrayList<>(returnValues.size());
				for (Object returnValue : returnValues) {
					models.add(buildModelFromRecord( buildRecordFromRaw( (Object[]) returnValue )  ));
				}

				return models;
			}
		});
	}

	public Boolean modelIsAccessableThroughCourse(final Long modelId, final Long userId) {
		return transactionTemplate.execute(new TransactionCallback<Boolean>() {
			@Override
			public Boolean doInTransaction(TransactionStatus status) {
				String sql = "Select 1 from \"UserCourses\" where \"UserId\"=:userId and \"UserCourses\".\"CourseId\" in (Select \"CourseId\" from \"ModelCourse\" where \"ModelId\" in (Select id from \"model_version\" where \"modelid\"=:id)) LIMIT 1";
				Query query = em.createNativeQuery(sql);
				query.setParameter("userId", userId);
				query.setParameter("id", modelId);

				try{
					query.getSingleResult();
					return true;
				}catch(NoResultException  e){
					return false;
				}
			}
		});
	}

	public List<Model> getSingleModel(final Long modelId, final Long userId, final Long mCourseId) {
		return transactionTemplate.execute(new TransactionCallback<List<Model>>() {
			@Override
			public List<Model> doInTransaction(TransactionStatus status) {
				Object returnValue;
				if(userId == null){
					returnValue = modelRepository.getSingleModelPublic(modelId);
				}else{
					String sql = "";
					if (mCourseId != null && mCourseId > 0) {
						sql = String.format("%s WHERE %s AND (m.id=55633 OR %s)", ModelRepository.FETCH_MODELS_FIELDS, ModelRepository.SINGLE_MODEL_WHERE, ModelRepository.NOT_DELETED_WHERE);
					} else {
						sql = String.format("%s WHERE %s AND (m.id=55633 OR %s OR %s)", ModelRepository.FETCH_MODELS_FIELDS, ModelRepository.SINGLE_MODEL_WHERE, ModelRepository.ALL_MODELS_WHERE_AUTHENTICATED, 
						"( m.id in (Select distinct \"ModelId\" from \"ModelCourse\" Join \"UserCourses\" on \"UserCourses\".\"CourseId\"=\"ModelCourse\".\"CourseId\" where \"UserCourses\".\"UserId\" = :userId))");
					}
					Query query = em.createNativeQuery(sql);
					if (mCourseId == null || mCourseId == 0) {
						query.setParameter("userId", userId);
					}
					query.setParameter("id", modelId);
					try {
						returnValue = query.getSingleResult();
					} catch(NoResultException  e) {
						logger.info("Model ID {} not found at getSingleModel().", modelId);
						returnValue = null;
					}
				}
				if (returnValue == null) {
					return Collections.emptyList();
				}
				
				List<Model> models = new ArrayList<>(1);
				models.add(buildModelFromRecord( buildRecordFromRaw( (Object[]) returnValue )  ));

				return models;
			}
		});
	}

	public List<Model> searchViewableModels(final Long userId, String name) {
		final String searchName = name = "%" + name.trim() + "%";
		return transactionTemplate.execute(new TransactionCallback<List<Model>>() {
			@Override
			public List<Model> doInTransaction(TransactionStatus status) {
				List<Object> returnValues = Collections.emptyList();
				if (userId == null) {
					returnValues = modelRepository.searchVisibleModelsAnonymous(searchName);
				} else {
					returnValues = modelRepository.searchVisibleModelsAuthenticated(userId, searchName);
				}
				if (CollectionUtils.isEmpty(returnValues)) {
					return Collections.emptyList();
				}
				List<Model> models = new ArrayList<>(returnValues.size());
				for (Object returnValue : returnValues) {
					models.add(buildModelFromRecord((Object[]) returnValue));
				}

				return models;
			}
		});
	}

	public List<Model> searchViewableModelsWithSpecies(final Long userId, String name) {
		final String searchName = name = "%" + name.trim() + "%";
		return transactionTemplate.execute(new TransactionCallback<List<Model>>() {
			@Override
			public List<Model> doInTransaction(TransactionStatus status) {
				List<Object> returnValues = Collections.emptyList();
				if (userId == null) {
					returnValues = modelRepository.searchVisibleModelsAnonymousWithSpecies(searchName);
				} else {
					returnValues = modelRepository.searchVisibleModelsAuthenticatedWithSpecies(userId, searchName);
				}
				List<Model> models = new ArrayList<>(returnValues.size());
				for (Object returnValue : returnValues) {
					models.add(buildModelFromRecord((Object[]) returnValue));
				}

				return models;
			}
		});
	}

	public List<Model> searchViewableModelsWithKnowledgeContent(final Long userId, final String name) {
		final String searchName = "%" + name.trim() + "%";
		return transactionTemplate.execute(new TransactionCallback<List<Model>>() {
			@Override
			public List<Model> doInTransaction(TransactionStatus status) {
				List<Object> returnValues = Collections.emptyList();
				if (userId == null) {
					returnValues = modelRepository.searchVisibleModelsAnonymousWithKnowledgeContent(searchName);
				} else {
					returnValues = modelRepository.searchVisibleModelsAuthenticatedWithKnowledgeContent(userId,
							searchName);
				}
				List<Model> models = new ArrayList<>(returnValues.size());
				for (Object returnValue : returnValues) {
					models.add(buildModelFromRecord((Object[]) returnValue));
				}

				return models;
			}
		});
	}

	public List<ModelDomainAccess> getModelDomainAccessForUser(final Long userId) {
		if (userId == null) {
			return Collections.emptyList();
		}

		return transactionTemplate.execute(new TransactionCallback<List<ModelDomainAccess>>() {
			@Override
			public List<ModelDomainAccess> doInTransaction(TransactionStatus status) {
				return modelDomainAccessRepository.findByUserId(userId);
			}
		});
	}

	public ModelDomainAccess getModelDomainAccessById(final ModelDomainAccessId id) {
		return transactionTemplate.execute(new TransactionCallback<ModelDomainAccess>() {
			@Override
			public ModelDomainAccess doInTransaction(TransactionStatus status) {
				return modelDomainAccessRepository.findOne(id);
			}
		});
	}

	public void saveModelDomainAccess(final ModelDomainAccess modelDomainAccess, final String operationIdentifier)
			throws Exception {
		transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				try {
					final List<String> dataActionList = new LinkedList<>();
					modelDomainAccessRepository.save(modelDomainAccess);
					dataActionList.add(String.format(DataAction.SAVE.getLogMsgFormat(), modelDomainAccess.toString()));

					if (!CollectionUtils.isEmpty(dataActionList)) {
						for (String dataAction : dataActionList) {
							logger.info("{} (Trx Id: {}).", dataAction, operationIdentifier);
						}
					}
				} catch (Exception e) {
					status.setRollbackOnly();
					throw e;
				}
			}
		});
	}

	public void saveModelAccessLearn(final ModelDomainAccess modelDomainAccess, final ModelShare modelShare,
			final String operationIdentifier) throws Exception {
		transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				try {
					final Calendar updateDate = Calendar.getInstance();
					modelDomainAccess.setCreationDate(updateDate);
					modelShare.setCreationDate(updateDate);
					modelShare.setUpdateDate(updateDate);

					final List<String> dataActionList = new LinkedList<>();
					modelDomainAccessRepository.save(modelDomainAccess);
					dataActionList.add(String.format(DataAction.SAVE.getLogMsgFormat(), modelDomainAccess.toString()));
					modelShareRepository.save(modelShare);
					dataActionList.add(String.format(DataAction.SAVE.getLogMsgFormat(), modelShare.toString()));

					if (!CollectionUtils.isEmpty(dataActionList)) {
						for (String dataAction : dataActionList) {
							logger.info("{} (Trx Id: {}).", dataAction, operationIdentifier);
						}
					}
				} catch (Exception e) {
					status.setRollbackOnly();
					throw e;
				}
			}
		});
	}

	public void deleteModelDomainAccess(final ModelDomainAccess modelDomainAccess,
			final Collection<ModelShare> modelShares, final String operationIdentifier) throws Exception {
		transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				try {
					final List<String> dataActionList = new LinkedList<>();
					modelDomainAccessRepository.delete(modelDomainAccess);
					dataActionList
							.add(String.format(DataAction.DELETE.getLogMsgFormat(), modelDomainAccess.toString()));
					if (CollectionUtils.isNotEmpty(modelShares)) {
						modelShares.forEach((ms) -> dataActionList
								.add(String.format(DataAction.DELETE.getLogMsgFormat(), ms.toString())));
						modelShareRepository.delete(modelShares);
					}

					if (!CollectionUtils.isEmpty(dataActionList)) {
						for (String dataAction : dataActionList) {
							logger.info("{} (Trx Id: {}).", dataAction, operationIdentifier);
						}
					}
				} catch (Exception e) {
					status.setRollbackOnly();
					throw e;
				}
			}
		});
	}

	public Model getModel(final long id) {
		return transactionTemplate.execute(new TransactionCallback<Model>() {
			@Override
			public Model doInTransaction(TransactionStatus status) {
				Object returnValue = modelRepository.getModelRecordById(id);
				if (returnValue == null) {
					return null;
				}

				return buildModelFromRecord((Object[]) returnValue);
			}
		});
	}

	public ModelIdentifier getModelIdentifier(final long id) {
		return transactionTemplate.execute(new TransactionCallback<ModelIdentifier>() {
			@Override
			public ModelIdentifier doInTransaction(TransactionStatus status) {
				return modelIdentifierRepository.findOne(id);
			}
		});
	}

	public List<Long> identifyOutdatedScores() {
		return transactionTemplate.execute(new TransactionCallback<List<Long>>() {
			@Override
			public List<Long> doInTransaction(TransactionStatus status) {
				return modelRepository.getOutdatedScores();
			}
		});
	}

	public Set<Long> getVisibleUsers(final Long shareUserId) {
		List<?> results = transactionTemplate.execute(new TransactionCallback<List<?>>() {
			@Override
			public List<?> doInTransaction(TransactionStatus status) {
				return em
						.createNativeQuery(
								"SELECT share_user_id, model_id, owner_user_id FROM public.model_share_owner WHERE share_user_id = ?1 OR owner_user_id = ?2")
						.setParameter(1, shareUserId).setParameter(2, shareUserId).getResultList();
			}
		});

		if (CollectionUtils.isEmpty(results)) {
			return Collections.emptySet();
		}

		Set<Long> visibleUserIds = new HashSet<>(results.size(), 1.0f);
		for (Object result : results) {
			Object[] resultValues = (Object[]) result;
			final Long ownerUserId = getLongFromRecord(resultValues[MODEL_SHARE_OWNER_INDEX.OWNER_USER_ID_INDEX]);
			if (shareUserId.equals(ownerUserId)) {
				Object userIdObject = resultValues[MODEL_SHARE_OWNER_INDEX.SHARE_USER_ID_INDEX];
				if (userIdObject != null) {
					visibleUserIds.add(getLongFromRecord(userIdObject));
				}
			} else {
				if (ownerUserId == null) {
					continue;
				}
				visibleUserIds.add(ownerUserId);
				final Long modelId = getLongFromRecord(resultValues[MODEL_SHARE_OWNER_INDEX.MODEL_ID_INDEX]);
				if (modelId != null) {
					List<?> resultsStep2 = transactionTemplate.execute(new TransactionCallback<List<?>>() {
						@Override
						public List<?> doInTransaction(TransactionStatus status) {
							return em
									.createNativeQuery(
											"SELECT share_user_id, model_id, owner_user_id FROM public.model_share_owner WHERE model_id = ?1 AND owner_user_id = ?2")
									.setParameter(1, modelId).setParameter(2, ownerUserId).getResultList();
						}
					});
					if (!CollectionUtils.isEmpty(resultsStep2)) {
						for (Object result2 : resultsStep2) {
							Object[] resultValues2 = (Object[]) result2;
							Object userIdObject = resultValues2[MODEL_SHARE_OWNER_INDEX.SHARE_USER_ID_INDEX];
							if (userIdObject != null) {
								visibleUserIds.add(getLongFromRecord(userIdObject));
							}
						}
					}
				}
			}
		}

		return visibleUserIds;
	}

	private Long getLongFromRecord(Object value) {
		if (value instanceof BigInteger) {
			return ((BigInteger) value).longValue();
		}

		return (Long) value;
	}

	public static enum CatalogArrangement {
		PUBLISHED, POPULAR, RECOMMENDED;

		public String getOrderBy() {
			switch(this) {
			case POPULAR:
				return "cited";
			case PUBLISHED:
			case RECOMMENDED:
				// nothing for now lol
			default:
				return "id";
			}
		}
	}

	// private static String MODEL_PAGE_QUERY = "WITH extended AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY mv.id ORDER BY mv.version DESC) AS rk FROM model_version mv) "
	// 																					+ "SELECT m.id, m.name, m.description, m.tags, m.userId, m.author, m.creationDate, m.biologicUpdateDate, m.knowledgeBaseUpdateDate, "
	// 																					+ "m.updateDate, m.components, m.interactions, m.published, m.cited, m.type, m.originId, m.\"modelType\" FROM model m "
	// 																					+ "WHERE id IN (SELECT s.modelid FROM extended s WHERE s.rk=1) AND type = :domain AND (published = 'true')";

	// private static String MODEL_COUNT_QUERY = "SELECT COUNT(DISTINCT id) FROM model WHERE type = :domain AND published = 'true'";

	public Map<String, Integer> getModelCount(String domain, final List<String> modelTypes, Long userId) {
		final String translatedDomain = domain.equals("teaching") ? "learning" : domain;
		return transactionTemplate.execute(new TransactionCallback<Map<String, Integer>>() {
			@Override
			public Map<String, Integer> doInTransaction(TransactionStatus status) {
				Map<String, Integer> models = new HashMap<>();

				ArrayList<String> domains = new ArrayList<String>( 
						Arrays.asList(translatedDomain));
					
				// if(domain.equals("learning")){
				// 	//learn gets in published also research models :)
				// 	models.put("published", ((BigInteger) modelRepository.getPublishedModelsCount(new ArrayList<String>( 
				// 		Arrays.asList(translatedDomain, "research")), modelTypes)).intValue());
				// }else{
					models.put("published", ((BigInteger) modelRepository.getPublishedModelsCount(domains, modelTypes)).intValue());
				// }
				if(userId != null){
					models.put("shared", ((BigInteger) modelRepository.getSharedWithMeModelsCount(domains, modelTypes, userId)).intValue());
					models.put("workspace", ((BigInteger) modelRepository.getWorkspaceModelsCount(domains, modelTypes, userId)).intValue());
					models.put("my", ((BigInteger) modelRepository.getMyModelsCount(domains, modelTypes, userId)).intValue());	
				}
				return models;
			}
		});
	}

	public Map<String, List<Long>> getModelIds(String domain, final List<String> modelTypes, Long userId) {
		final String translatedDomain = domain.equals("teaching") ? "learning" : domain;
		return transactionTemplate.execute(new TransactionCallback<Map<String, List<Long>>>() {
			@Override
			public Map<String, List<Long>> doInTransaction(TransactionStatus status) {
				Map<String, List<Long>> models = new HashMap<>();

				ArrayList<String> domains = new ArrayList<String>( 
						Arrays.asList(translatedDomain));
					
				models.put("published", modelRepository.getPublishedModelsIds(domains, modelTypes));
				if(domain.equals("research")){
					models.put("{\"category\":\"published\",\"orderBy\":\"recent\"}", modelRepository.getPublishedModelsIdsOrderByRecent(domains, modelTypes, 99999999, 0));
					models.put("{\"category\":\"published\",\"orderBy\":\"popular\"}", modelRepository.getPublishedModelsIdsOrderByPopular(domains, modelTypes, 99999999, 0));
					models.put("{\"category\":\"published\",\"orderBy\":\"recommended\"}", modelRepository.getPublishedModelsIdsOrderByRecommended(domains, modelTypes, 99999999, 0));
				}
				
				if(userId != null){
						models.put("shared", modelRepository.getSharedWithMeModelsIds(domains, modelTypes, userId));
						models.put("my", modelRepository.getMyModelsIds(domains, modelTypes, userId));
				}
				return models;
			}
		});
	}

	public List<Integer> findCoursesByModelLearning(final Long modelId, final Long userId) {
		return transactionTemplate.execute(new TransactionCallback<List<Integer>>() {
			@Override
			public List<Integer> doInTransaction(TransactionStatus status) {
				String sql = "WITH model_versions AS (" +
             "    SELECT mv2.modelid " +
             "    FROM model_version mv " +
             "    INNER JOIN model_version mv2 ON mv2.id = mv.id " +
             "    WHERE mv.modelid = :model " +
             ") " +
             "SELECT mc.\"CourseId\" AS course_id " +
             "FROM \"ModelCourse\" mc " +
             "INNER JOIN \"UserCourses\" uc ON uc.\"CourseId\" = mc.\"CourseId\" " +
             "INNER JOIN authority a ON a.user_id = uc.\"UserId\" " +
             "INNER JOIN model_versions mvs ON mvs.modelid = mc.\"ModelId\" " +
             "WHERE a.user_id = :user AND a.role_id IN (2, 3) " +
             "GROUP BY 1";
				Query query = em.createNativeQuery(sql);
				query.setParameter("model", modelId);
				query.setParameter("user", userId);

				List<Object> resultList = query.getResultList();
				List<Integer> courseIds = new ArrayList<>();
				for (Object result : resultList) {
						Integer courseId = ((Number) result).intValue();
						courseIds.add(courseId);
				}
				return courseIds;
			}
		});
	}

	// public List<Model> getModelPage(String domain, int start, int cards, CatalogArrangement arrangement) {
	// 	return transactionTemplate.execute(new TransactionCallback<List<Model>>() {
	// 		@Override
	// 		public List<Model> doInTransaction(TransactionStatus status) {
	// 			Session session = em.unwrap(Session.class);
	// 			SQLQuery query = session.createSQLQuery(ModelDao.MODEL_PAGE_QUERY + " ORDER BY " + (arrangement == null ? "id" : arrangement.getOrderBy()) + " DESC NULLS LAST");
	// 			query.setParameter("domain", domain);
	// 			query.setFirstResult(start);
	// 			query.setMaxResults(cards);
	// 			List<Object> modelData = query.list();
	// 			if( modelData == null || modelData.isEmpty() ) {
	// 				return Collections.emptyList();
	// 			} else {

	// 				// Convert raw data to model objects (far faster than using query.addEntity)
	// 				List<Model> models = new ArrayList<>();
	// 				for( Object data : modelData ) {
	// 					Object[] row = (Object[]) data;

	// 					// Convert BigInteger to Long
	// 					row[0]  = row[0] == null ? null : ((BigInteger)row[0]).longValue();
	// 					row[4]  = row[4] == null ? null : ((BigInteger)row[4]).longValue();
	// 					row[15] = row[15] == null ? null : ((BigInteger)row[15]).longValue();

	// 					// Convert Timestamp to Calendar
	// 					for( int i = 6; i <= 9; i++ ) {
	// 						if( row[i] == null ) continue;
	// 						Calendar row_i = Calendar.getInstance();
	// 						row_i.setTimeInMillis(((Timestamp)row[i]).getTime());
	// 						row[i] = row_i;
	// 					}

	// 					models.add(buildModelFromRecord((Object[]) data));
	// 				}

	// 				// TODO: You HAVE to do this sorting *IN THE QUERY*, not AFTER THE FACT IDIOT!

	// 				return models;
	// 			}
	// 		}
	// 	});
	// }

	private Object[] buildRecordFromRaw(Object[] row) {
			// Convert BigInteger to Long
			row[0]  = row[0] == null ? null : ((BigInteger)row[0]).longValue();
			row[4]  = row[4] == null ? null : ((BigInteger)row[4]).longValue();
			row[15] = row[15] == null ? null : ((BigInteger)row[15]).longValue();

			// Convert Timestamp to Calendar
			for( int i = 6; i <= 9; i++ ) {
				if( row[i] == null ) continue;
				Calendar row_i = Calendar.getInstance();
				row_i.setTimeInMillis(((Timestamp)row[i]).getTime());
				row[i] = row_i;
			}
			return row;
	}

	private Model buildModelFromRecord(Object[] objects) {
		Model model = new Model();
		model.setId((Long) objects[0]);
		model.setName((String) objects[1]);
		model.setDescription((String) objects[2]);
		model.setTags((String) objects[3]);
		model.setUserId((Long) objects[4]);
		model.setAuthor((String) objects[5]);
		model.setCreationDate((Calendar) objects[6]);
		model.setBiologicUpdateDate((Calendar) objects[7]);
		model.setKnowledgeBaseUpdateDate((Calendar) objects[8]);
		model.setUpdateDate((Calendar) objects[9]);
		model.setComponents((Integer) objects[10]);
		model.setInteractions((Integer) objects[11]);
		model.setPublished((Boolean) objects[12]);
		model.setCited((Integer) objects[13]);
		model.setType((String) objects[14]);
		model.setOriginId((Long) objects[15]);
		model.setModelType((String)objects[16]);

		return model;
	}

	private Model buildModelFromRecordDetail(Object[] objects) {
		Model model = buildModelFromRecord(objects);

		//isShared
		model.setIsShared((Boolean)objects[20]);
		//isShared
		model.setIsWorkspace((Boolean)objects[21]);

		return model;
	}

	private static class MODEL_SHARE_OWNER_INDEX {

		public static final int SHARE_USER_ID_INDEX = 0;

		public static final int MODEL_ID_INDEX = 1;

		public static final int OWNER_USER_ID_INDEX = 2;

	}
}