/**
 * 
 */
package cc.dataaccess.main.dao;

import java.util.Calendar;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;

import javax.persistence.EntityManager;
import javax.persistence.ParameterMode;
import javax.persistence.StoredProcedureQuery;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionCallbackWithoutResult;
import org.springframework.transaction.support.TransactionTemplate;
import org.apache.commons.collections4.MapUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.commons.collections4.CollectionUtils;

import cc.common.data.ModelStatisticTypesConstants;
import cc.common.data.biologic.Condition;
import cc.common.data.biologic.Regulator;
import cc.common.data.biologic.RegulatorIdentifier;
import cc.common.data.biologic.Species;
import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.biologic.SubCondition;
import cc.common.data.knowledge.Content;
import cc.common.data.knowledge.ContentReference;
import cc.common.data.knowledge.ModelReferenceTypes;
import cc.common.data.knowledge.Page;
import cc.common.data.knowledge.PageReference;
import cc.common.data.knowledge.Reference;
import cc.common.data.knowledge.Section;
import cc.common.data.metadata.AbstractSetValue;
import cc.common.data.metadata.AttachmentValue;
import cc.common.data.metadata.BoolValue;
import cc.common.data.metadata.DecimalValue;
import cc.common.data.metadata.EntityValue;
import cc.common.data.metadata.IntegerValue;
import cc.common.data.metadata.TextValue;
import cc.common.data.metadata.Value;
import cc.common.data.model.Layout;
import cc.common.data.model.LayoutNode;
import cc.common.data.model.LearningActivity;
import cc.common.data.model.LearningActivityGroup;
import cc.common.data.model.Model;
import cc.common.data.model.ModelChangeset;
import cc.common.data.model.ModelInitialState;
import cc.common.data.model.ModelLink;
import cc.common.data.model.ModelLink.LINK_ACCESS;
import cc.common.data.model.ModelReference;
import cc.common.data.model.ModelShare;
import cc.common.data.model.ModelShareNotification;
import cc.common.data.model.ModelStatistic;
import cc.common.data.model.ModelVersion;
import cc.common.data.simulation.AnalysisActivity;
import cc.common.data.simulation.AnalysisEnvironment;
import cc.common.data.simulation.CalcInterval;
import cc.common.data.simulation.ComponentPair;
import cc.common.data.simulation.Course;
import cc.common.data.simulation.CourseActivity;
import cc.common.data.simulation.CourseMutation;
import cc.common.data.simulation.CourseRange;
import cc.common.data.simulation.Experiment;
import cc.common.data.simulation.ExperimentData;
import cc.common.data.simulation.InitialState;
import cc.common.data.simulation.RealtimeActivity;
import cc.common.data.simulation.RealtimeEnvironment;
import cc.common.data.simulation.SpeciesMutation;
import cc.common.simulate.settings.SimulationSettingsJAXBManager;
import cc.common.simulate.settings.dynamic.ActivityLevelRange;
import cc.common.simulate.settings.dynamic.DynamicSimulationSettings;
import cc.dataaccess.ConditionSpecies;
import cc.dataaccess.DataAction;
import cc.dataaccess.Dominance;
import cc.dataaccess.EntityMetadataRangeId;
import cc.dataaccess.ExperimentSettingsData;
import cc.dataaccess.IdReturnValue;
import cc.dataaccess.InitialStateSpecies;
import cc.dataaccess.ModelBiologic;
import cc.dataaccess.ModelBiologicIdMap;
import cc.dataaccess.ModelMappedData;
import cc.dataaccess.ModelMetadata;
import cc.dataaccess.ModelSize;
import cc.dataaccess.SubConditionSpecies;
import cc.dataaccess.exception.ModelBiologicDataException;
import cc.dataaccess.main.repository.AnalysisActivityRepository;
import cc.dataaccess.main.repository.AnalysisEnvironmentRepository;
import cc.dataaccess.main.repository.CalcIntervalRepository;
import cc.dataaccess.main.repository.ComponentPairRepository;
import cc.dataaccess.main.repository.ConditionRepository;
import cc.dataaccess.main.repository.ContentReferenceRepository;
import cc.dataaccess.main.repository.ContentRepository;
import cc.dataaccess.main.repository.CourseActivityRepository;
import cc.dataaccess.main.repository.CourseMutationRepository;
import cc.dataaccess.main.repository.CourseRangeRepository;
import cc.dataaccess.main.repository.CourseRespository;
import cc.dataaccess.main.repository.EntityValueRepository;
import cc.dataaccess.main.repository.ExperimentDataRepository;
import cc.dataaccess.main.repository.ExperimentRepository;
import cc.dataaccess.main.repository.InitialStateRepository;
import cc.dataaccess.main.repository.LayoutNodeRepository;
import cc.dataaccess.main.repository.LayoutRepository;
import cc.dataaccess.main.repository.LearningActivityRepository;
import cc.dataaccess.main.repository.LearningActivityGroupRepository;
import cc.dataaccess.main.repository.ModelInitialStateRepository;
import cc.dataaccess.main.repository.ModelLinkRepository;
import cc.dataaccess.main.repository.ModelReferenceRepository;
import cc.dataaccess.main.repository.ModelReferenceTypesRepository;
import cc.dataaccess.main.repository.ModelRepository;
import cc.dataaccess.main.repository.ModelShareNotificationRepository;
import cc.dataaccess.main.repository.ModelShareRepository;
import cc.dataaccess.main.repository.ModelStatisticRepository;
import cc.dataaccess.main.repository.ModelVersionRepository;
import cc.dataaccess.main.repository.PageReferenceRepository;
import cc.dataaccess.main.repository.PageRepository;
import cc.dataaccess.main.repository.RealtimeActivityRepository;
import cc.dataaccess.main.repository.RealtimeEnvironmentRepository;
import cc.dataaccess.main.repository.ReferenceRepository;
import cc.dataaccess.main.repository.RegulatorRepository;
import cc.dataaccess.main.repository.SectionRepository;
import cc.dataaccess.main.repository.SpeciesRepository;
import cc.dataaccess.main.repository.SubConditionRepository;
import cc.dataaccess.main.repository.ValueRepository;
import cc.dataaccess.main.repository.SetValueRepository;

/**
 * @author bkowal
 */
public class ModelBiologicDao {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ModelRepository modelRepository;

	@Autowired
	private ModelInitialStateRepository modelInitialStateRepository;

	@Autowired
	private SpeciesRepository speciesRepository;

	@Autowired
	private RegulatorRepository regulatorRepository;

	@Autowired
	private ConditionRepository conditionRepository;

	@Autowired
	private SubConditionRepository subConditionRepository;

	@Autowired
	private InitialStateRepository initialStateRepository;

	@Autowired
	private ModelShareRepository modelShareRepository;

	@Autowired
	private ModelLinkRepository modelLinkRepository;

	@Autowired
	private ReferenceRepository referenceRepository;

	@Autowired
	private ContentReferenceRepository contentReferenceRepository;

	@Autowired
	private ContentRepository contentRepository;

	@Autowired
	private SectionRepository sectionRepository;

	@Autowired
	private PageReferenceRepository pageReferenceRepository;

	@Autowired
	private PageRepository pageRepository;

	@Autowired
	private ModelReferenceRepository modelReferenceRepository;

	@Autowired
	private ExperimentRepository experimentRepository;

	@Autowired
	private ExperimentDataRepository experimentDataRepository;

	@Autowired
	private ModelStatisticRepository modelStatisticRepository;

	@Autowired
	private ValueRepository valueRepository;

	@Autowired
	private SetValueRepository<IntegerValue> setIntegerValueRepository;

	@Autowired
	private SetValueRepository<DecimalValue> setDecimalValueRepository;

	@Autowired
	private SetValueRepository<TextValue> setTextValueRepository;

	@Autowired
	private SetValueRepository<BoolValue> setBoolValueRepository;

	@Autowired
	private SetValueRepository<AttachmentValue> setAttachmentValueRepository;

	@Autowired
	private EntityValueRepository entityValueRepository;

	@Autowired
	private CourseRespository courseRespository;

	@Autowired
	private CourseRangeRepository courseRangeRepository;

	@Autowired
	private CourseActivityRepository courseActivityRepository;

	@Autowired
	private CourseMutationRepository courseMutationRepository;

	@Autowired
	private CalcIntervalRepository calcIntervalRepository;

	@Autowired
	private ModelShareNotificationRepository modelShareNotificationRepository;

	@Autowired
	private ComponentPairRepository componentPairRepository;

	@Autowired
	private ModelReferenceTypesRepository modelReferenceTypesRepository;

	@Autowired
	private TransactionTemplate transactionTemplate;

	@Autowired
	private LayoutRepository layoutRepository;

	@Autowired
	private LayoutNodeRepository layoutNodeRepository;

	@Autowired
	private ModelVersionRepository modelVersionRepository;

	@Autowired
	private LearningActivityRepository learningActivityRepository;

	@Autowired
	private LearningActivityGroupRepository learningActivityGroupRepository;

	@Autowired
	private RealtimeEnvironmentRepository realtimeEnvironmentRepository;

	@Autowired
	private RealtimeActivityRepository realtimeActivityRepository;

	@Autowired
	private AnalysisEnvironmentRepository analysisEnvironmentRepository;

	@Autowired
	private AnalysisActivityRepository analysisActivityRepository;

	@Autowired
	@Qualifier("mainEntityManagerFactory")
	private EntityManager em;

	public Model getModel(final long id) {
		return transactionTemplate.execute(new TransactionCallback<Model>() {
			@Override
			public Model doInTransaction(TransactionStatus status) {
				return modelRepository.findOne(id);
			}
		});
	}

	public LearningActivityGroup getLearningActivityGroupById(final long id){
		return transactionTemplate.execute(new TransactionCallback<LearningActivityGroup>() {
			@Override
			public LearningActivityGroup doInTransaction(TransactionStatus status) {
				return learningActivityGroupRepository.findOne(id);
			}
		});
	}

	public IdReturnValue saveModelBiologic(final Iterable<ModelBiologic> modelBiologicIterable,
			final Map<String, ModelMappedData> modelMappedDataMap, final Map<String, ModelMetadata> modelMetadataMap,
			final Map<String, ExperimentSettingsData> experimentDataMap, final String operationIdentifier) {
		return transactionTemplate.execute(new TransactionCallback<IdReturnValue>() {
			@Override
			public IdReturnValue doInTransaction(TransactionStatus status) {
				String action = null;
				String logId = null;
				Map<String, ModelBiologicIdMap> idMap = new HashMap<>();
				Map<Integer, Long> numericIdMap = new HashMap<>();
				final List<String> dataActionList = new LinkedList<>();
				final Map<Integer, Long> model0VersionMap = new HashMap<>();
				try {
					final Calendar updateDate = Calendar.getInstance();

					for (ModelBiologic modelBiologic : modelBiologicIterable) {
						final ModelMappedData modelMappedData = modelMappedDataMap.get(modelBiologic.getKey());
						final ModelMetadata modelMetadata = modelMetadataMap.get(modelBiologic.getKey());
						final ExperimentSettingsData experimentSettingsData = experimentDataMap
								.get(modelBiologic.getKey());
						ModelBiologicIdMap modelBiologicIdMap = new ModelBiologicIdMap();
						/*
						 * Get the id for exception reporting purposes.
						 */
						logId = Integer.toString(modelBiologic.getModelId());

						/*
						 * Model-Mapped Data
						 */
						if (CollectionUtils.isEmpty(modelMappedData.getInitialStatesToDelete()) == false) {
							action = "delete Initial States";
							for (InitialState initialState : modelMappedData.getInitialStatesToDelete()) {
								initialStateRepository.delete(initialState);
							}
						}

						if (CollectionUtils.isEmpty(modelMappedData.getSharesToDelete()) == false) {
							action = "delete Model Share";
							for (ModelShare share : modelMappedData.getSharesToDelete()) {
								modelShareRepository.delete(share);
								dataActionList
										.add(String.format(DataAction.DELETE.getLogMsgFormat(), share.toString()));
							}
						}

						if (CollectionUtils.isEmpty(modelMappedData.getLinksToDelete()) == false) {
							action = "delete Model Link";
							for (ModelLink link : modelMappedData.getLinksToDelete()) {
								modelLinkRepository.delete(link);
								dataActionList.add(String.format(DataAction.DELETE.getLogMsgFormat(), link.toString()));
							}
						}

						if (CollectionUtils.isEmpty(modelMappedData.getContentReferencesToDelete()) == false) {
							action = "delete Content Reference";
							for (ContentReference contentReference : modelMappedData.getContentReferencesToDelete()) {
								contentReference.setReference(null);
								contentReferenceRepository.delete(contentReference);
							}
						}

						if (CollectionUtils.isEmpty(modelMappedData.getContentsToDelete()) == false) {
							action = "delete Content";
							for (Content content : modelMappedData.getContentsToDelete()) {
								content.setReferences(null);
								contentRepository.delete(content);
							}
						}

						if (CollectionUtils.isEmpty(modelMappedData.getSectionsToDelete()) == false) {
							action = "delete Section";
							for (Section section : modelMappedData.getSectionsToDelete()) {
								section.setContents(null);
								sectionRepository.delete(section);
							}
						}

						if (CollectionUtils.isEmpty(modelMappedData.getPageReferencesToDelete()) == false) {
							action = "delete Page Reference";
							for (PageReference pageReference : modelMappedData.getPageReferencesToDelete()) {
								pageReference.setReference(null);
								pageReferenceRepository.delete(pageReference);
							}
						}

						if (CollectionUtils.isEmpty(modelMappedData.getPagesToDelete()) == false) {
							action = "delete Page";
							for (Page page : modelMappedData.getPagesToDelete()) {
								page.setSections(null);
								page.setReferences(null);
								pageRepository.delete(page);
								dataActionList.add(String.format(DataAction.DELETE.getLogMsgFormat(), page.toString()));
							}
						}

						if (CollectionUtils.isEmpty(modelMappedData.getModelReferencesToDelete()) == false) {
							action = "delete Model Reference";
							for (ModelReference modelReference : modelMappedData.getModelReferencesToDelete()) {
								modelReference.setReference(null);
								modelReferenceRepository.delete(modelReference);
							}
						}

						if (CollectionUtils.isEmpty(modelMappedData.getReferencesToDelete()) == false) {
							action = "delete Reference";
							for (Reference reference : modelMappedData.getReferencesToDelete()) {
								referenceRepository.delete(reference);
							}
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getCourseMutationsToDelete())) {
							for (CourseMutation courseMutation : experimentSettingsData.getCourseMutationsToDelete()
									.values()) {
								dataActionList.add(
										String.format(DataAction.DELETE.getLogMsgFormat(), courseMutation.toString()));
							}
							courseMutationRepository
									.delete(experimentSettingsData.getCourseMutationsToDelete().values());
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getCourseActivitiesToDelete())) {
							for (CourseActivity courseActivity : experimentSettingsData.getCourseActivitiesToDelete()
									.values()) {
								dataActionList.add(
										String.format(DataAction.DELETE.getLogMsgFormat(), courseActivity.toString()));
							}
							courseActivityRepository
									.delete(experimentSettingsData.getCourseActivitiesToDelete().values());
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getCourseRangesToDelete())) {
							for (CourseRange courseRange : experimentSettingsData.getCourseRangesToDelete().values()) {
								dataActionList.add(
										String.format(DataAction.DELETE.getLogMsgFormat(), courseRange.toString()));
							}
							courseRangeRepository.delete(experimentSettingsData.getCourseRangesToDelete().values());
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getCoursesToDelete())) {
							for (Course course : experimentSettingsData.getCoursesToDelete().values()) {
								dataActionList
										.add(String.format(DataAction.DELETE.getLogMsgFormat(), course.toString()));
							}
							courseRespository.delete(experimentSettingsData.getCoursesToDelete().values());
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getCalcIntervalsToDelete())) {
							for (CalcInterval calcInterval : experimentSettingsData.getCalcIntervalsToDelete()
									.values()) {
								dataActionList.add(
										String.format(DataAction.DELETE.getLogMsgFormat(), calcInterval.toString()));
							}
							calcIntervalRepository.delete(experimentSettingsData.getCalcIntervalsToDelete().values());
						}

						if (CollectionUtils.isEmpty(modelMappedData.getExperimentsToDelete()) == false) {
							action = "delete Experiments";
							modelMappedData.getExperimentsToDelete().parallelStream()
									.forEach(new Consumer<Experiment>() {
										@Override
										public void accept(Experiment experiment) {
											dataActionList.add(String.format(DataAction.DELETE.getLogMsgFormat(),
													experiment.toString()));
											deleteExperiment(experiment);
										}
									});
						}
						if (MapUtils.isNotEmpty(experimentSettingsData.getComponentPairsToDelete())) {
							action = "delete Component Pair";
							for (ComponentPair componentPair : experimentSettingsData.getComponentPairsToDelete()
									.values()) {
								dataActionList.add(
										String.format(DataAction.DELETE.getLogMsgFormat(), componentPair.toString()));
							}
							componentPairRepository.delete(experimentSettingsData.getComponentPairsToDelete().values());
						}
						if (MapUtils.isNotEmpty(modelMappedData.getModelReferenceTypesToDelete())) {
							action = "delete Model Reference Types";
							modelReferenceTypesRepository
									.delete(modelMappedData.getModelReferenceTypesToDelete().values());
						}
						if (MapUtils.isNotEmpty(modelMappedData.getLearningActivitiesToDelete())) {
							learningActivityRepository.delete(modelMappedData.getLearningActivitiesToDelete().values());
						}
						if (MapUtils.isNotEmpty(modelMappedData.getLearningActivityGroupsToDelete())) {
							learningActivityGroupRepository
									.delete(modelMappedData.getLearningActivityGroupsToDelete().values());
						}

						/*
						 * Model Biologic
						 */
						Model model = modelBiologic.getModel();
						if (modelBiologic.isDelete()) {
							action = "delete Model";
							modelRepository.deleteModelById(model.getId());
							/*
							 * No point to check for Biologic changes because the entire Model has been
							 * removed.
							 */
							logger.info("{} (Trx Id: {}).",
									String.format(DataAction.DELETE.getLogMsgFormat(), model.toString()),
									operationIdentifier);
							continue;
						} else {
							if (model.getCreationDate() == null) {
								if (model.getBiologicUpdateDate() == null) {
									model.setBiologicUpdateDate(updateDate);
								}
								model.setCreationDate(updateDate);
								if (model.isPublished() == null) {
									model.setPublished(Boolean.FALSE);
								}
								if (model.getComponents() == null) {
									model.setComponents(0);
								}
								if (model.getInteractions() == null) {
									model.setInteractions(0);
								}
							}
							if (model.getOriginId() != null && model.getOriginId() < 0) {
								final Long originModelId = numericIdMap.get(model.getOriginId().intValue());
								if (originModelId == null) {
									logger.warn("Unable to find the Origin Model Id associated with JS Origin Id: {}.",
											model.getOriginId());
								} else {
									model.setOriginId(originModelId);
								}
							}
							model.setUpdateDate(updateDate);

							if (model.getId() <= 0) {
								action = "save Model";
								model.setModelInitialState(null);
								modelRepository.save(model);

								if (modelBiologic.getModelVersion() != null) {
									ModelVersion modelVersion = modelBiologic.getModelVersion();
									if (modelVersion.getId().getId() <= 0) {
										if (model0VersionMap.containsKey(modelBiologic.getModelId())) {
											modelVersion.getId()
													.setId(model0VersionMap.get(modelBiologic.getModelId()));
										} else {
											modelVersion.getId().setId(model.getId());
											model0VersionMap.put(modelBiologic.getModelId(), model.getId());
										}
									}
									modelVersion.setModelId(model.getId());
									modelVersion.setCreationDate(updateDate);
									modelVersionRepository.save(modelVersion);
									dataActionList.add(
											String.format(DataAction.SAVE.getLogMsgFormat(), modelVersion.toString()));
								}
							} else {
								action = "update Model";
								modelRepository.updateModelRecord(model.getId(), model.getUpdateDate(),
										model.getBiologicUpdateDate(), model.getKnowledgeBaseUpdateDate(),
										model.getComponents(), model.getInteractions(), model.isPublished(),
										model.getName(), model.getDescription(), model.getTags(), model.getAuthor(),
										model.getType(), model.getOriginId());
							}
							if (modelBiologic.getChangeset() != null) {
								action = "save Statistic";
								ModelChangeset changeset = modelBiologic.getChangeset();
								changeset.setCreationDate(updateDate);
								changeset.setModel(model.getModelIdentifier());

								ModelStatistic statistic = new ModelStatistic();
								statistic.setModel(model.getModelIdentifier());
								statistic.setCreationDate(updateDate);
								statistic.setUserId(changeset.getUserId());
								statistic.setType(ModelStatisticTypesConstants.MODEL_EDIT_STAT);
								statistic.setMetadata(changeset.getChangeset());
								modelStatisticRepository.save(statistic);
							}
							modelBiologicIdMap.setId(model.getId());
							idMap.put(modelBiologic.getKey(), modelBiologicIdMap);
							numericIdMap.put(modelBiologic.getModelId(), model.getId());
						}

						if (MapUtils.isNotEmpty(modelMappedData.getLearningActivityGroups())) {
							for (Long id : modelMappedData.getLearningActivityGroups().keySet()) {
								LearningActivityGroup learningActivityGroup = modelMappedData
										.getLearningActivityGroups().get(id);
								if (learningActivityGroup.getMasterId() <= 0) {
									learningActivityGroup.setMasterId(modelBiologic.getModelVersion().getId().getId());
								}
								learningActivityGroupRepository.save(learningActivityGroup);
								if (id.longValue() <= 0) {
									modelBiologicIdMap.addLearningActivityGroupId(id.intValue(),
											learningActivityGroup.getId());
								}
							}
						}
					}

					for (ModelBiologic modelBiologic : modelBiologicIterable) {
						final ModelMappedData modelMappedData = modelMappedDataMap.get(modelBiologic.getKey());
						final ModelMetadata modelMetadata = modelMetadataMap.get(modelBiologic.getKey());
						final ExperimentSettingsData experimentSettingsData = experimentDataMap
								.get(modelBiologic.getKey());
						ModelBiologicIdMap modelBiologicIdMap;

						if(idMap.containsKey(modelBiologic.getKey())){
							modelBiologicIdMap = idMap.get(modelBiologic.getKey());
						}else{
							Model model = modelBiologic.getModel();
							modelBiologicIdMap = new ModelBiologicIdMap();
							idMap.put(modelBiologic.getKey(), modelBiologicIdMap);
							numericIdMap.put(modelBiologic.getModelId(), model.getId());
						}

						/*
						 * Get the id for exception reporting purposes.
						 */
						logId = Integer.toString(modelBiologic.getModelId());

						if (modelBiologic.isDelete()) {
							continue;
						}
						/*
						 * Model Biologic
						 */
						Model model = modelBiologic.getModel();

						if (MapUtils.isNotEmpty(modelMappedData.getLearningActivities())) {
							for (Long id : modelMappedData.getLearningActivities().keySet()) {
								LearningActivity learningActivity = modelMappedData.getLearningActivities().get(id);
								if (learningActivity.getMasterId() <= 0) {
									learningActivity.setMasterId(modelBiologic.getModelVersion().getId().getId());
								}
								learningActivity.setVersion((int) modelBiologic.getModelVersion().getId().getVersion());
								learningActivityRepository.save(learningActivity);
								if (id.longValue() <= 0) {
									modelBiologicIdMap.addLearningActivityId(id.intValue(), learningActivity.getId());
								}
							}
						}

						/*
						 * TODO: this will not be necessary after data management re-factoring for
						 * performance has taken place.
						 */
						Set<Long> deletedRegulatorIds = new HashSet<>();
						if (CollectionUtils.isEmpty(modelBiologic.getRegulatorsToDelete()) == false) {
							action = "delete Regulators";
							for (Regulator regulator : modelBiologic.getRegulatorsToDelete()) {
								regulator.setDominance(null);
								deletedRegulatorIds.add(regulator.getId());
							}
							regulatorRepository.delete(modelBiologic.getRegulatorsToDelete());
						}

						final Set<Long> deletedSpeciesIds = new HashSet<>();
						if (CollectionUtils.isEmpty(modelBiologic.getSpeciesToDelete()) == false) {
							action = "delete Species";
							Set<Long> speciesIds = new HashSet<>(modelBiologic.getSpeciesToDelete().size(), 1.0f);
							for (Species species : modelBiologic.getSpeciesToDelete()) {
								species.setRegulators(null);
								dataActionList
										.add(String.format(DataAction.DELETE.getLogMsgFormat(), species.toString()));
								speciesIds.add(species.getId());
								deletedSpeciesIds.add(species.getId());
							}
							speciesRepository.deleteSpeciesByIds(speciesIds);
						}

						if (MapUtils.isNotEmpty(modelMappedData.getLayoutNodesToDelete())) {
							action = "delete Layout Nodes";
							for (Long id : modelMappedData.getLayoutNodesToDelete().keySet()) {
								LayoutNode layoutNode = modelMappedData.getLayoutNodesToDelete().get(id);
								dataActionList
										.add(String.format(DataAction.DELETE.getLogMsgFormat(), layoutNode.toString()));
							}
							layoutNodeRepository.delete(modelMappedData.getLayoutNodesToDelete().values());
						}

						if (MapUtils.isNotEmpty(modelMappedData.getLayoutsToDelete())) {
							action = "delete Layouts";
							for (Long id : modelMappedData.getLayoutsToDelete().keySet()) {
								Layout layout = modelMappedData.getLayoutsToDelete().get(id);
								dataActionList
										.add(String.format(DataAction.DELETE.getLogMsgFormat(), layout.toString()));
							}
							layoutRepository.delete(modelMappedData.getLayoutsToDelete().values());
						}

						if (CollectionUtils.isEmpty(modelBiologic.getConditionsToDelete()) == false) {
							action = "delete Conditions";
							for (Condition condition : modelBiologic.getConditionsToDelete()) {
								condition.setSpecies(null);
								condition.setSubConditions(null);
							}
							conditionRepository.delete(modelBiologic.getConditionsToDelete());
						}

						if (CollectionUtils.isEmpty(modelBiologic.getSubConditionsToDelete()) == false) {
							action = "delete SubConditions";
							for (SubCondition subCondition : modelBiologic.getSubConditionsToDelete()) {
								subCondition.setSpecies(null);
							}
							subConditionRepository.delete(modelBiologic.getSubConditionsToDelete());
						}

						if (MapUtils.isNotEmpty(modelBiologic.getSpecies())) {
							action = "save Species";
							for (Number speciesId : modelBiologic.getSpecies().keySet()) {
								Species species = modelBiologic.getSpecies().get(speciesId);
								if (species.getCreationDate() == null) {
									species.setCreationDate(updateDate);
									if (species.isExternal() == null) {
										species.setExternal(Boolean.FALSE);
									}
								}
								if (species.getModel() == null) {
									species.setModel(model.getModelIdentifier());
								}
								if (species.getModel().getId() <= 0) {
									species.getModel().setId(model.getId());
								}
								species.setUpdateDate(updateDate);
							}
							speciesRepository.save(modelBiologic.getSpecies().values());
							modelBiologic.getSpecies().values().stream().forEach((s) -> dataActionList
									.add(String.format(DataAction.SAVE.getLogMsgFormat(), s.toString())));
						}
						modelBiologic.getSpecies().keySet().stream().filter((n) -> (n.intValue() <= 0))
								.forEach((n) -> modelBiologicIdMap.addSpeciesId(n.intValue(),
										modelBiologic.getSpecies().get(n).getId()));

						if (MapUtils.isNotEmpty(modelMappedData.getLayoutsToSave())) {
							for (Long id : modelMappedData.getLayoutsToSave().keySet()) {
								Layout layout = modelMappedData.getLayoutsToSave().get(id);
								if (layout.getCreationDate() == null) {
									layout.setCreationDate(updateDate);
								}
								if (layout.getModelId() <= 0) {
									layout.setModelId(model.getId());
								}
								layout.setUpdateDate(updateDate);
								layoutRepository.save(layout);
								dataActionList.add(String.format(DataAction.SAVE.getLogMsgFormat(), layout.toString()));
								if (id.intValue() < 0) {
									modelBiologicIdMap.addLayoutId(id.intValue(), layout.getId());
								}
							}
						}

						if (MapUtils.isNotEmpty(modelMappedData.getLayoutNodesToSave())) {
							for (Long id : modelMappedData.getLayoutNodesToSave().keySet()) {
								LayoutNode layoutNode = modelMappedData.getLayoutNodesToSave().get(id);
								if (layoutNode.getComponentId() < 0) {
									layoutNode.setComponentId(
											modelBiologic.getSpecies().get(layoutNode.getComponentId()).getId());
								}
								if (layoutNode.getLayoutId() < 0) {
									layoutNode.setLayoutId(
											modelBiologicIdMap.getLayoutIds().get((int) layoutNode.getLayoutId()));
								}
								layoutNodeRepository.save(layoutNode);
								dataActionList
										.add(String.format(DataAction.SAVE.getLogMsgFormat(), layoutNode.toString()));
								if (id.intValue() < 0) {
									modelBiologicIdMap.addLayoutNodeId(id.intValue(), layoutNode.getId());
								}
							}
						}

						if (MapUtils.isNotEmpty(modelBiologic.getRegulators())) {
							Map<Regulator, Set<RegulatorIdentifier>> dominanceMap = new HashMap<>();

							action = "flush Species";
							speciesRepository.flush();

							action = "save Regulators";
							for (Regulator regulator : modelBiologic.getRegulators().values()) {
								Set<RegulatorIdentifier> dominance = regulator.getDominance();
								regulator.setDominance(null);
								regulator.setConditions(null);
								regulatorRepository.save(regulator);
								if (dominance != null && dominance.isEmpty() == false) {
									dominanceMap.put(regulator, dominance);
								}
							}

							if (dominanceMap.isEmpty() == false) {
								regulatorRepository.flush();
								action = "save Dominance";
								for (Regulator regulator : dominanceMap.keySet()) {
									Set<RegulatorIdentifier> dominance = dominanceMap.get(regulator);
									Iterator<RegulatorIdentifier> itr = dominance.iterator();
									while (itr.hasNext()) {
										if (deletedRegulatorIds.contains(itr.next().getId())) {
											itr.remove();
										}
									}
									regulator.setDominance(dominance);
									regulatorRepository.save(regulator);
								}
							}
							modelBiologic.getRegulators().keySet().stream().filter((n) -> (n.intValue() <= 0))
									.forEach((n) -> modelBiologicIdMap.addRegulatorId(n.intValue(),
											modelBiologic.getRegulators().get(n).getId()));
						}

						if (MapUtils.isNotEmpty(modelBiologic.getConditions())) {
							action = "save Conditions";
							Map<Condition, Set<SpeciesIdentifier>> conditionSpeciesMap = new HashMap<>();
							for (Condition condition : modelBiologic.getConditions().values()) {
								Set<SpeciesIdentifier> conditionSpecies = condition.getSpecies();
								condition.setSpecies(null);
								condition.setSubConditions(null);
								conditionRepository.save(condition);
								if (conditionSpecies != null && conditionSpecies.isEmpty() == false) {
									conditionSpeciesMap.put(condition, conditionSpecies);
								}
							}
							if (conditionSpeciesMap.isEmpty() == false) {
								conditionRepository.flush();
								for (Condition condition : conditionSpeciesMap.keySet()) {
									Set<SpeciesIdentifier> conditionSpecies = conditionSpeciesMap.get(condition);
									Iterator<SpeciesIdentifier> itr = conditionSpecies.iterator();
									while (itr.hasNext()) {
										if (deletedSpeciesIds.contains(itr.next().getId())) {
											itr.remove();
										}
									}
									condition.setSpecies(conditionSpecies);
									conditionRepository.save(condition);
								}
							}
							modelBiologic.getConditions().keySet().stream().filter((n) -> (n.intValue() <= 0))
									.forEach((n) -> modelBiologicIdMap.addConditionId(n.intValue(),
											modelBiologic.getConditions().get(n).getId()));
						}

						if (MapUtils.isNotEmpty(modelBiologic.getSubConditions())) {
							action = "save SubConditions";
							Map<SubCondition, Set<SpeciesIdentifier>> subConditionSpeciesMap = new HashMap<>();
							for (SubCondition subCondition : modelBiologic.getSubConditions().values()) {
								Set<SpeciesIdentifier> subConditionSpecies = subCondition.getSpecies();
								subCondition.setSpecies(null);
								subConditionRepository.save(subCondition);
								if (subConditionSpecies != null && subConditionSpecies.isEmpty() == false) {
									subConditionSpeciesMap.put(subCondition, subConditionSpecies);
								}
							}
							if (subConditionSpeciesMap.isEmpty() == false) {
								subConditionRepository.flush();
								for (SubCondition subCondition : subConditionSpeciesMap.keySet()) {
									Set<SpeciesIdentifier> subConditionSpecies = subConditionSpeciesMap
											.get(subCondition);
									Iterator<SpeciesIdentifier> itr = subConditionSpecies.iterator();
									while (itr.hasNext()) {
										if (deletedSpeciesIds.contains(itr.next().getId())) {
											itr.remove();
										}
									}
									subCondition.setSpecies(subConditionSpecies);
									subConditionRepository.save(subCondition);
								}
							}
							modelBiologic.getSubConditions().keySet().stream().filter((n) -> (n.intValue() <= 0))
									.forEach((n) -> modelBiologicIdMap.addSubConditionId(n.intValue(),
											modelBiologic.getSubConditions().get(n).getId()));
						}

						if (MapUtils.isNotEmpty(modelBiologic.getConditionSpecies())) {
							for (Number id : modelBiologic.getConditionSpecies().keySet()) {
								ConditionSpecies conditionSpecies = modelBiologic.getConditionSpecies().get(id);
								modelBiologicIdMap.addConditionSpeciesId(id.intValue(),
										conditionSpecies.toJSIdentifier());
							}
						}

						if (MapUtils.isNotEmpty(modelBiologic.getSubConditionSpecies())) {
							for (Number id : modelBiologic.getSubConditionSpecies().keySet()) {
								SubConditionSpecies subConditionSpecies = modelBiologic.getSubConditionSpecies()
										.get(id);
								modelBiologicIdMap.addSubConditionSpeciesId(id.intValue(),
										subConditionSpecies.toJSIdentifier());
							}
						}

						if (MapUtils.isNotEmpty(modelBiologic.getDominance())) {
							for (Number id : modelBiologic.getDominance().keySet()) {
								Dominance dominance = modelBiologic.getDominance().get(id);
								modelBiologicIdMap.addDominanceId(id.intValue(), dominance.toJSIdentifier());
							}
						}

						/*
						 * Model-Mapped Data
						 */
						if (MapUtils.isNotEmpty(modelMappedData.getInitialStates())) {
							speciesRepository.flush();
							action = "save Initial States";
							for (Number id : modelMappedData.getInitialStates().keySet()) {
								InitialState initialState = modelMappedData.getInitialStates().get(id);
								if (initialState.getCreationDate() == null) {
									initialState.setCreationDate(updateDate);
								}
								if (initialState.getModel().getId() <= 0) {
									initialState.getModel().setId(model.getId());
								}
								initialState.setUpdateDate(updateDate);
								initialStateRepository.save(initialState);
								if (id.intValue() <= 0) {
									modelBiologicIdMap.addInitialStateId(id.intValue(), initialState.getId());
								}
							}
						}

						if (modelBiologic.getModelInitialState() != null) {
							ModelInitialState modelInitialState = modelBiologic.getModelInitialState();
							if (modelInitialState.getModelId() <= 0) {
								modelInitialState.setModelId(model.getId());
							}
							if (modelInitialState.getInitialStateId() != null
									&& modelInitialState.getInitialStateId().longValue() <= 0) {
								/*
								 * TODO: better validation that this information is actually available.
								 */
								Long initialStateId = modelMappedData.getInitialStates()
										.get(modelInitialState.getInitialStateId()).getId();
								modelInitialState.setInitialStateId(initialStateId);
							}
							if (modelInitialState.getLayoutId() != null
									&& modelInitialState.getLayoutId().longValue() <= 0) {
								Long layoutId = modelMappedData.getLayoutsToSave().get(modelInitialState.getLayoutId())
										.getId();
								modelInitialState.setLayoutId(layoutId);
							}
							dataActionList.add(
									String.format(DataAction.SAVE.getLogMsgFormat(), modelInitialState.toString()));
							modelInitialStateRepository.save(modelInitialState);
						}

						if (MapUtils.isNotEmpty(modelMappedData.getInitialStateSpecies())) {
							for (Number id : modelMappedData.getInitialStateSpecies().keySet()) {
								InitialStateSpecies initialStateSpecies = modelMappedData.getInitialStateSpecies()
										.get(id);
								modelBiologicIdMap.addInitialStateSpeciesId(id.intValue(),
										initialStateSpecies.toJSIdentifier());
							}
						}

						if (MapUtils.isNotEmpty(modelMappedData.getShares())) {
							action = "save Model Shares";
							for (Number id : modelMappedData.getShares().keySet()) {
								ModelShare share = modelMappedData.getShares().get(id);
								if (share.getModel_id() <= 0) {
									share.setModel_id(modelBiologic.getModelVersion().getId().getId());
								}
								if (share.getCreationDate() == null) {
									share.setCreationDate(updateDate);
								}
								share.setUpdateDate(updateDate);
								modelShareRepository.save(share);
								if (id.intValue() < 0) {
									modelBiologicIdMap.addShareId(id.intValue(), share.getId());
									dataActionList
											.add(String.format(DataAction.SAVE.getLogMsgFormat(), share.toString()));
								} else {
									dataActionList
											.add(String.format(DataAction.UPDATE.getLogMsgFormat(), share.toString()));
								}
							}
						}

						if (MapUtils.isNotEmpty(modelMappedData.getShareNotifications())) {
							for (Number id : modelMappedData.getShareNotifications().keySet()) {
								ModelShareNotification modelShareNotification = modelMappedData.getShareNotifications()
										.get(id);
								final Long modelShareId = modelMappedData.getShares().get(id).getId();
								if (modelShareNotification.getId().getModelId() <= 0) {
									modelShareNotification.getId()
											.setModelId(modelBiologic.getModelVersion().getId().getId());
								}
								modelShareNotification.setModelShareId(modelShareId);
								modelShareNotification.setCreationDate(updateDate);
								modelShareNotification.setUpdateDate(updateDate);
								modelShareNotificationRepository.save(modelShareNotification);
								dataActionList.add(String.format(DataAction.SAVE.getLogMsgFormat(),
										modelShareNotification.toString()));
							}
						}

						if (MapUtils.isNotEmpty(modelMappedData.getLinks())) {
							action = "save Model Links";
							for (Number id : modelMappedData.getLinks().keySet()) {
								ModelLink link = modelMappedData.getLinks().get(id);
								if (link.getModel_id() <= 0) {
									link.setModel_id(modelBiologic.getModelVersion().getId().getId());
								}
								if (link.getAccess() == null) {
									link.setAccess(LINK_ACCESS.VIEW);
								}
								if (link.getCreationDate() == null) {
									link.setCreationDate(updateDate);
								}
								link.setUpdateDate(updateDate);
								modelLinkRepository.save(link);
								if (id.intValue() < 0) {
									modelBiologicIdMap.addLinkId(id.intValue(), link.getId());
									dataActionList
											.add(String.format(DataAction.SAVE.getLogMsgFormat(), link.toString()));
								} else {
									dataActionList
											.add(String.format(DataAction.UPDATE.getLogMsgFormat(), link.toString()));
								}
							}
						}

						if (MapUtils.isNotEmpty(modelMappedData.getModelReferences())) {
							action = "save Model References";
							for (Number id : modelMappedData.getModelReferences().keySet()) {
								ModelReference modelReference = modelMappedData.getModelReferences().get(id);
								modelReference.setCreationDate(updateDate);
								if (modelReference.getModel().getId() <= 0) {
									modelReference.getModel().setId(model.getId());
								}
								modelReferenceRepository.save(modelReference);
								if (id.intValue() < 0) {
									modelBiologicIdMap.addModelReferenceId(id.intValue(), modelReference.getId());
								}
							}
						}

						if (MapUtils.isNotEmpty(modelMappedData.getPages())) {
							action = "save Pages";
							for (Number id : modelMappedData.getPages().keySet()) {
								Page page = modelMappedData.getPages().get(id);
								page.setSections(null);
								page.setReferences(null);
								if (page.getCreationDate() == null) {
									page.setCreationDate(updateDate);
								}
								page.setUpdateDate(updateDate);
								if (page.getId() <= 0) {
									page.setId(page.getSpecies().getId());
								}
								pageRepository.save(page);
								dataActionList.add(String.format(DataAction.SAVE.getLogMsgFormat(), page.toString()));
								if (id.intValue() < 0) {
									modelBiologicIdMap.addPageId(id.intValue(), page.getId());
								}
							}
						}

						if (MapUtils.isNotEmpty(modelMappedData.getPageReferences())) {
							action = "save Page References";
							for (Number id : modelMappedData.getPageReferences().keySet()) {
								PageReference reference = modelMappedData.getPageReferences().get(id);
								reference.setCreationDate(updateDate);
								pageReferenceRepository.save(reference);
								if (id.intValue() < 0) {
									modelBiologicIdMap.addPageReferenceId(id.intValue(), reference.getId());
								}
							}
						}

						if (MapUtils.isNotEmpty(modelMappedData.getSections())) {
							pageRepository.flush();
							action = "save Sections";
							for (Number id : modelMappedData.getSections().keySet()) {
								Section section = modelMappedData.getSections().get(id);
								section.setContents(null);
								if (section.getCreationDate() == null) {
									section.setCreationDate(updateDate);
								}
								section.setUpdateDate(updateDate);
								sectionRepository.save(section);
								if (id.intValue() < 0) {
									modelBiologicIdMap.addSectionId(id.intValue(), section.getId());
								}
							}
						}

						if (MapUtils.isNotEmpty(modelMappedData.getContents())) {
							sectionRepository.flush();
							action = "save Contents";
							for (Number id : modelMappedData.getContents().keySet()) {
								Content content = modelMappedData.getContents().get(id);
								content.setReferences(null);
								if (content.getCreationDate() == null) {
									content.setCreationDate(updateDate);
								}
								content.setUpdateDate(updateDate);
								content.setReferences(null);
								contentRepository.save(content);
								if (id.intValue() < 0) {
									modelBiologicIdMap.addContentId(id.intValue(), content.getId());
								}
							}
						}

						if (MapUtils.isNotEmpty(modelMappedData.getContentReferences())) {
							action = "save Content References";
							for (Number id : modelMappedData.getContentReferences().keySet()) {
								ContentReference reference = modelMappedData.getContentReferences().get(id);
								reference.setCreationDate(updateDate);
								contentReferenceRepository.save(reference);
								if (id.intValue() < 0) {
									modelBiologicIdMap.addContentReferenceId(id.intValue(), reference.getId());
								}
							}
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getCoursesToSave())) {
							experimentSettingsData.getCoursesToSave().values().stream()
									.filter((c) -> c.getModelId() <= 0).forEach((c) -> c.setModelId(model.getId()));
							courseRespository.save(experimentSettingsData.getCoursesToSave().values());
							for (Long id : experimentSettingsData.getCoursesToSave().keySet()) {
								Course course = experimentSettingsData.getCoursesToSave().get(id);
								if (id.longValue() < 0) {
									modelBiologicIdMap.addCourseId(id.intValue(), course.getId());
								}
								dataActionList.add(String.format(DataAction.SAVE.getLogMsgFormat(), course.toString()));
							}
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getCourseRangesToSave())) {
							for (Long id : experimentSettingsData.getCourseRangesToSave().keySet()) {
								CourseRange courseRange = experimentSettingsData.getCourseRangesToSave().get(id);
								if (courseRange.getCourseId() < 0) {
									courseRange.setCourseId(experimentSettingsData.getCoursesToSave()
											.get(courseRange.getCourseId()).getId());
								}
								courseRangeRepository.save(courseRange);
								if (id.longValue() < 0) {
									modelBiologicIdMap.addCourseRangeId(id.intValue(), courseRange.getId());
								}
								dataActionList
										.add(String.format(DataAction.SAVE.getLogMsgFormat(), courseRange.toString()));
							}
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getCourseActivitiesToSave())) {
							for (Long id : experimentSettingsData.getCourseActivitiesToSave().keySet()) {
								CourseActivity courseActivity = experimentSettingsData.getCourseActivitiesToSave()
										.get(id);
								if (courseActivity.getCourseRangeId() < 0) {
									courseActivity.setCourseRangeId(experimentSettingsData.getCourseRangesToSave()
											.get(courseActivity.getCourseRangeId()).getId());
								}
								if (courseActivity.getSpeciesId() < 0) {
									courseActivity.setSpeciesId(
											modelBiologic.getSpecies().get(courseActivity.getSpeciesId()).getId());
								}
								courseActivityRepository.save(courseActivity);
								if (id.longValue() <= 0) {
									modelBiologicIdMap.addCourseActivityId(id.intValue(), courseActivity.getId());
								}
								dataActionList.add(
										String.format(DataAction.SAVE.getLogMsgFormat(), courseActivity.toString()));
							}
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getCourseMutationsToSave())) {
							for (Long id : experimentSettingsData.getCourseMutationsToSave().keySet()) {
								CourseMutation courseMutation = experimentSettingsData.getCourseMutationsToSave()
										.get(id);
								if (courseMutation.getCourseRangeId() < 0) {
									courseMutation.setCourseRangeId(experimentSettingsData.getCourseRangesToSave()
											.get(courseMutation.getCourseRangeId()).getId());
								}
								if (courseMutation.getSpeciesId() < 0) {
									courseMutation.setSpeciesId(
											modelBiologic.getSpecies().get(courseMutation.getSpeciesId()).getId());
								}
								courseMutationRepository.save(courseMutation);
								if (id.longValue() < 0) {
									modelBiologicIdMap.addCourseMutationId(id.intValue(), courseMutation.getId());
								}
								dataActionList.add(
										String.format(DataAction.SAVE.getLogMsgFormat(), courseMutation.toString()));
							}
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getComponentPairsToSave())) {
							for (Long id : experimentSettingsData.getComponentPairsToSave().keySet()) {
								ComponentPair componentPair = experimentSettingsData.getComponentPairsToSave().get(id);
								if (componentPair.getFirstComponentId() < 0) {
									componentPair.setFirstComponentId(modelBiologic.getSpecies()
											.get(componentPair.getFirstComponentId()).getId());
								}
								if (componentPair.getSecondComponentId() < 0) {
									componentPair.setSecondComponentId(modelBiologic.getSpecies()
											.get(componentPair.getSecondComponentId()).getId());
								}
								dataActionList.add(
										String.format(DataAction.SAVE.getLogMsgFormat(), componentPair.toString()));
								componentPairRepository.save(componentPair);
								if (id.longValue() < 0) {
									modelBiologicIdMap.addComponentPairId(id.intValue(), componentPair.getId());
								}
							}
						}

						if (MapUtils.isNotEmpty(modelMappedData.getModelReferenceTypesToSave())) {
							action = "save Model Reference Types";
							for (Long id : modelMappedData.getModelReferenceTypesToSave().keySet()) {
								ModelReferenceTypes modelReferenceTypes = modelMappedData.getModelReferenceTypesToSave()
										.get(id);
								if (modelReferenceTypes.getModelId() <= 0) {
									modelReferenceTypes.setModelId(model.getId());
								}
								if (modelReferenceTypes.getReferenceId() < 0) {
									modelReferenceTypes.setReferenceId(modelMappedData.getReferences()
											.get(modelReferenceTypes.getReferenceId()).getId());
								}
								modelReferenceTypesRepository.save(modelReferenceTypes);
								if (id.longValue() < 0) {
									modelBiologicIdMap.addModelReferenceTypesId(id.intValue(),
											modelReferenceTypes.getId());
								}
							}
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getRealtimeEnvironmentsToDelete())) {
							realtimeEnvironmentRepository
									.delete(experimentSettingsData.getRealtimeEnvironmentsToDelete().values());
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getRealtimeActivitiesToDelete())) {
							realtimeActivityRepository
									.delete(experimentSettingsData.getRealtimeActivitiesToDelete().values());
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getAnalysisEnvironmentsToDelete())) {
							analysisEnvironmentRepository
									.delete(experimentSettingsData.getAnalysisEnvironmentsToDelete().values());
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getAnalysisActivitiesToDelete())) {
							analysisActivityRepository
									.delete(experimentSettingsData.getAnalysisActivitiesToDelete().values());
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getRealtimeEnvironmentsToSave())) {
							final Map<Long, RealtimeEnvironment> realtimeEnvironmentsToSave = experimentSettingsData
									.getRealtimeEnvironmentsToSave();
							for (Long id : realtimeEnvironmentsToSave.keySet()) {
								RealtimeEnvironment realtimeEnvironment = realtimeEnvironmentsToSave.get(id);
								if (realtimeEnvironment.getModelid() <= 0) {
									realtimeEnvironment.setModelid(model.getId());
								}
								realtimeEnvironmentRepository.save(realtimeEnvironment);
								if (id.intValue() <= 0) {
									modelBiologicIdMap.addRealtimeEnvironmentId(id.intValue(),
											realtimeEnvironment.getId());
								}
							}
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getRealtimeActivitiesToSave())) {
							final Map<Long, RealtimeActivity> realtimeActivitiesToSave = experimentSettingsData
									.getRealtimeActivitiesToSave();
							for (Long id : realtimeActivitiesToSave.keySet()) {
								RealtimeActivity realtimeActivity = realtimeActivitiesToSave.get(id);
								if (realtimeActivity.getParentId().longValue() <= 0) {
									realtimeActivity.setParentId(modelBiologicIdMap.getRealtimeEnvironmentIds()
											.get(realtimeActivity.getParentId().intValue()));
								}
								if (realtimeActivity.getComponentId().longValue() <= 0) {
									realtimeActivity.setComponentId(modelBiologicIdMap.getSpeciesIds()
											.get(realtimeActivity.getComponentId().intValue()));
								}
								realtimeActivityRepository.save(realtimeActivity);
								if (id.intValue() <= 0) {
									modelBiologicIdMap.addRealtimeActivityId(id.intValue(), realtimeActivity.getId());
								}
							}
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getAnalysisEnvironmentsToSave())) {
							final Map<Long, AnalysisEnvironment> analysisEnvironmentsToSave = experimentSettingsData
									.getAnalysisEnvironmentsToSave();
							for (Long id : analysisEnvironmentsToSave.keySet()) {
								AnalysisEnvironment analysisEnvironment = analysisEnvironmentsToSave.get(id);
								if (analysisEnvironment.getModelid() <= 0) {
									analysisEnvironment.setModelid(model.getId());
								}
								analysisEnvironmentRepository.save(analysisEnvironment);
								if (id.intValue() <= 0) {
									modelBiologicIdMap.addAnalysisEnvironmentId(id.intValue(),
											analysisEnvironment.getId());
								}
							}
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getAnalysisActivitiesToSave())) {
							final Map<Long, AnalysisActivity> analysisActivitiesToSave = experimentSettingsData
									.getAnalysisActivitiesToSave();
							for (Long id : analysisActivitiesToSave.keySet()) {
								AnalysisActivity analysisActivity = analysisActivitiesToSave.get(id);
								if (analysisActivity.getParentId().longValue() <= 0) {
									analysisActivity.setParentId(modelBiologicIdMap.getAnalysisEnvironmentIds()
											.get(analysisActivity.getParentId().intValue()));
								}
								if (analysisActivity.getComponentId().longValue() <= 0) {
									analysisActivity.setComponentId(modelBiologicIdMap.getSpeciesIds()
											.get(analysisActivity.getComponentId().intValue()));
								}
								analysisActivityRepository.save(analysisActivity);
								if (id.intValue() <= 0) {
									modelBiologicIdMap.addAnalysisActivityId(id.intValue(), analysisActivity.getId());
								}
							}
						}

						for (Number id : modelMappedData.getExperiments().keySet()) {
							action = "save Experiments";
							Experiment experiment = modelMappedData.getExperiments().get(id);
							if (experiment.getModel_id() <= 0) {
								experiment.setModel_id(model.getId());
							}
							if (experiment.getCreationDate() == null) {
								experiment.setCreationDate(updateDate);
							}
							if (experiment.isShared() == null) {
								experiment.setShared(Boolean.FALSE);
							}
							if (experiment.isPublished() == null) {
								experiment.setPublished(Boolean.FALSE);
							}
							if (experiment.getCourseId() != null && experiment.getCourseId().longValue() <= 0) {
								experiment.setCourseId(experimentSettingsData.getCoursesToSave()
										.get(experiment.getCourseId()).getId());
							}
							if (experiment.getEnvironmentId() != null
									&& experiment.getEnvironmentId().longValue() <= 0) {
								experiment.setEnvironmentId(experimentSettingsData.getAnalysisEnvironmentsToSave()
										.get(experiment.getEnvironmentId()).getId());
							}
							if (experiment.getLastRunEnvironmentId() != null
									&& experiment.getLastRunEnvironmentId().longValue() <= 0) {
								experiment
										.setLastRunEnvironmentId(experimentSettingsData.getAnalysisEnvironmentsToSave()
												.get(experiment.getLastRunEnvironmentId()).getId());
							}
							experiment.setUpdateDate(updateDate);
							DynamicSimulationSettings settings = modelMappedData.getExperimentSettingsMap().get(id);
							if (settings != null) {
								if (settings.getInitialStateId() != null && settings.getInitialStateId() < 0) {
									final Long initialStateId = modelBiologicIdMap.getInitialStateIds()
											.get(settings.getInitialStateId().intValue());
									settings.setInitialStateId(initialStateId);
								}
								if (settings.getActivityLevelRange() != null) {
									Map<Long, ActivityLevelRange> updatedActivityLevelRanges = new HashMap<>();
									Set<Long> idsToRemove = new HashSet<>();
									for (Long activityLevelId : settings.getActivityLevelRange().keySet()) {
										if (activityLevelId.intValue() < 0) {
											ActivityLevelRange range = settings.getActivityLevelRange()
													.get(activityLevelId);
											idsToRemove.add(activityLevelId);
											final Long speciesId = modelBiologicIdMap.getSpeciesIds()
													.get(activityLevelId.intValue());
											updatedActivityLevelRanges.put(speciesId, range);
										}
									}
									for (Long idToRemove : idsToRemove) {
										settings.getActivityLevelRange().remove(idToRemove);
									}
									if (updatedActivityLevelRanges.isEmpty() == false) {
										settings.getActivityLevelRange().putAll(updatedActivityLevelRanges);
									}
								}
								if (settings.getMutations() != null) {
									Map<Long, SpeciesMutation> updatedMutations = new HashMap<>();
									Set<Long> idsToRemove = new HashSet<>();
									for (Long mutationId : settings.getMutations().keySet()) {
										if (mutationId.intValue() < 0) {
											SpeciesMutation mutation = settings.getMutations().get(mutationId);
											idsToRemove.add(mutationId);
											final Long speciesId = modelBiologicIdMap.getSpeciesIds()
													.get(mutationId.intValue());
											updatedMutations.put(speciesId, mutation);
										}
									}
									for (Long idToRemove : idsToRemove) {
										settings.getMutations().remove(idToRemove);
									}
									if (updatedMutations.isEmpty() == false) {
										settings.getMutations().putAll(updatedMutations);
									}
								}
								if (settings.getX() != null && settings.getX() < 0) {
									Long componentId = modelBiologicIdMap.getSpeciesIds()
											.get(settings.getX().intValue());
									settings.setX(componentId);
								}
								if (settings.getY() != null && CollectionUtils.isNotEmpty(settings.getY())) {
									Set<Long> replacedComponentIds = new HashSet<>(settings.getY().size());
									Iterator<Long> yIterator = settings.getY().iterator();
									while (yIterator.hasNext()) {
										Long yComponentId = yIterator.next();
										if (yComponentId > 0) {
											continue;
										}
										Long componentId = modelBiologicIdMap.getSpeciesIds()
												.get(yComponentId.intValue());
										replacedComponentIds.add(componentId);
										yIterator.remove();
									}
									if (CollectionUtils.isNotEmpty(replacedComponentIds)) {
										settings.getY().addAll(replacedComponentIds);
									}
								}

								/*
								 * Update settings.
								 */
								final String settingsXML = SimulationSettingsJAXBManager.getInstance()
										.toXMLString(settings);
								experiment.setSettings(settingsXML);

							}
							experimentRepository.save(experiment);
							if (id.intValue() < 0) {
								modelBiologicIdMap.addExperimentId(id.intValue(), experiment.getId());
							}
							dataActionList.add(String.format(DataAction.SAVE.getLogMsgFormat(), experiment.toString()));
						}

						if (MapUtils.isNotEmpty(experimentSettingsData.getCalcIntervalsToSave())) {
							for (Long id : experimentSettingsData.getCalcIntervalsToSave().keySet()) {
								CalcInterval calcInterval = experimentSettingsData.getCalcIntervalsToSave().get(id);
								if (calcInterval.getExperimentId() < 0) {
									calcInterval.setExperimentId(modelMappedData.getExperiments()
											.get(calcInterval.getExperimentId()).getId());
								}
								calcIntervalRepository.save(calcInterval);
								if (id.longValue() < 0) {
									modelBiologicIdMap.addCalcIntervalId(id.intValue(), calcInterval.getId());
								}
								dataActionList
										.add(String.format(DataAction.SAVE.getLogMsgFormat(), calcInterval.toString()));
							}
						}

						/*
						 * Model Metadata
						 */
						handleMetadata(modelMetadata, modelBiologicIdMap, model, updateDate);

						/*
						 * Handle additional {@link ModelVersion}s.
						 */
						if (MapUtils.isNotEmpty(modelBiologic.getModelVersionsToDelete())) {
							modelVersionRepository.delete(modelBiologic.getModelVersionsToDelete().values());
						}
						if (MapUtils.isNotEmpty(modelBiologic.getModelVersionsToPersist())) {
							modelVersionRepository.save(modelBiologic.getModelVersionsToPersist().values());
						}

						modelBiologicIdMap.setCurrentVersion(modelBiologic.getModelVersion().getId().getVersion());
					}

					if (CollectionUtils.isNotEmpty(dataActionList)) {
						for (String dataAction : dataActionList) {
							logger.info("{} (Trx Id: {}).", dataAction, operationIdentifier);
						}
					}

					return new IdReturnValue(idMap, numericIdMap);
				} catch (Exception e) {
					status.setRollbackOnly();

					StringBuilder sb = new StringBuilder("Failed to save / update / delete Model: ");
					if (logId == null) {
						sb.append("?");
					} else {
						sb.append(logId);
					}
					sb.append("! Action = ").append(action);
					throw new ModelBiologicDataException(sb.toString(), e);
				}
			}
		});
	}

	private void handleMetadata(final ModelMetadata modelMetadata, final ModelBiologicIdMap idMap, final Model model,
			final Calendar updateDate) {
		if (MapUtils.isNotEmpty(modelMetadata.getValuesToDelete())) {
			this.valueRepository.delete(modelMetadata.getValuesToDelete().values());
		}

		if (CollectionUtils.isNotEmpty(modelMetadata.getEntityValuesToDelete())) {
			this.entityValueRepository.delete(modelMetadata.getEntityValuesToDelete());
		}

		if (MapUtils.isNotEmpty(modelMetadata.getValuesToSave())) {
			for (Value value : modelMetadata.getValuesToSave().values()) {
				value.setUpdateDate(updateDate);
				this.valueRepository.save(value);

				AbstractSetValue<?> setValue = value.getSetValue();
				if (setValue.getValueId() <= 0) {
					setValue.setValueId(value.getId());
				}

				switch (value.getDefinition().getType()) {
				case Bool:
					this.setBoolValueRepository.save((BoolValue) setValue);
					break;
				case Decimal:
					this.setDecimalValueRepository.save((DecimalValue) setValue);
					break;
				case Integer:
					this.setIntegerValueRepository.save((IntegerValue) setValue);
					break;
				case Text:
					this.setTextValueRepository.save((TextValue) setValue);
					break;
				case Attachment:
					this.setAttachmentValueRepository.save((AttachmentValue) setValue);
					break;
				default:
					break;
				}
			}
		}

		if (CollectionUtils.isNotEmpty(modelMetadata.getEntityValuesToSave())) {
			for (EntityValue entityValue : modelMetadata.getEntityValuesToSave()) {
				if (entityValue.getId().getEntity_id() <= 0) {
					entityValue.getId().setEntity_id(model.getId());
				}
				if (entityValue.getId().getValue_id() <= 0) {
					long valueId = modelMetadata.getValuesToSave().get(entityValue.getId().getValue_id()).getId();
					entityValue.getId().setValue_id(valueId);
				}
			}
			this.entityValueRepository.save(modelMetadata.getEntityValuesToSave());
		}

		modelMetadata.getValuesToSave().keySet().stream().filter((id) -> id <= 0).forEach(
				(id) -> idMap.addMetadataValueId(id.intValue(), modelMetadata.getValuesToSave().get(id).getId()));
		modelMetadata.getEntityValuesToSave().stream()
				.filter((ev) -> ev.getDefinition() != null && Boolean.TRUE.equals(ev.getDefinition().getRange())
						&& ev.getJsId() <= 0)
				.forEach((ev) -> idMap.addMetadataRangeId(ev.getJsId(),
						new EntityMetadataRangeId(model.getId(), ev.getId().getValue_id()).toJSIdentifier()));
	}

	private void deleteExperiment(final Experiment experiment) {
		List<ExperimentData> dataToDelete = this.experimentDataRepository.getDataForSimulation(experiment.getId());
		if (CollectionUtils.isEmpty(dataToDelete) == false) {
			this.experimentDataRepository.delete(dataToDelete);
		}
		this.experimentRepository.delete(experiment);
	}

	public void updateModelSize(final long modelId) {
		transactionTemplate.execute(new TransactionCallbackWithoutResult() {
			@Override
			protected void doInTransactionWithoutResult(TransactionStatus status) {
				em.createNativeQuery("CALL updateModelSize(:modelId);").setParameter("modelId", modelId)
						.executeUpdate();
			}
		});
	}

	public ModelSize getModelSizeStats(Model model) {
		return transactionTemplate.execute(new TransactionCallback<ModelSize>() {
			@Override
			public ModelSize doInTransaction(TransactionStatus status) {
				StoredProcedureQuery query = em.createStoredProcedureQuery("modelSize")
						.registerStoredProcedureParameter(0, Long.class, ParameterMode.IN)
						.registerStoredProcedureParameter(1, Integer.class, ParameterMode.OUT)
						.registerStoredProcedureParameter(2, Integer.class, ParameterMode.OUT)
						.setParameter(0, model.getId());
				query.execute();

				final int components = (Integer) query.getOutputParameterValue(1);
				final int interactions = (Integer) query.getOutputParameterValue(2);

				return new ModelSize(components, interactions);
			}
		});
	}
}