/**
 * 
 */
package cc.application.main.controller;

import java.io.IOException;
import java.math.BigInteger;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

import javax.annotation.PostConstruct;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.MapUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.apache.commons.lang3.math.NumberUtils;
import org.apache.commons.lang3.time.StopWatch;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import cc.application.main.CurrentVersion;
import cc.application.main.cache.LocalDefinitionCacheManager;
import cc.application.main.cache.LocalUploadCacheManager;
import cc.application.main.exception.EntityNotFoundException;
import cc.application.main.exception.InvalidMetadataValue;
import cc.application.main.exception.ModelAccessDeniedException;
import cc.application.main.json.AnalysisActivityJSON;
import cc.application.main.json.AnalysisEnvironmentJSON;
import cc.application.main.json.CalcIntervalJSON;
import cc.application.main.json.ComponentPairJSON;
import cc.application.main.json.ContentMap;
import cc.application.main.json.ContentReferenceMap;
import cc.application.main.json.CourseActivityJSON;
import cc.application.main.json.CourseJSON;
import cc.application.main.json.CourseMutationJSON;
import cc.application.main.json.CourseRangeJSON;
import cc.application.main.json.ExperimentMap;
import cc.application.main.json.FilteredModelChangesetMap;
import cc.application.main.json.InitialStateMap;
import cc.application.main.json.LayoutJSON;
import cc.application.main.json.LayoutNodeJSON;
import cc.application.main.json.LearningActivityGroupJSON;
import cc.application.main.json.LearningActivityJSON;
import cc.application.main.json.ModelBiologicMap;
import cc.application.main.json.ModelJSON;
import cc.application.main.json.ModelLinkAccess;
import cc.application.main.json.ModelLinkJSON;
import cc.application.main.json.ModelPermissions;
import cc.application.main.json.ModelReferenceMap;
import cc.application.main.json.ModelReferenceTypesJSON;
import cc.application.main.json.ModelShareMap;
import cc.application.main.json.ModelVersionJSON;
import cc.application.main.json.PageMap;
import cc.application.main.json.PageReferenceMap;
import cc.application.main.json.RealtimeActivityJSON;
import cc.application.main.json.RealtimeEnvironmentJSON;
import cc.application.main.json.ReferenceMap;
import cc.application.main.json.SectionMap;
import cc.application.main.json.UploadJSON;
import cc.application.main.json.ViewableModel;
import cc.application.main.json.metadata.EntityMetadataRangeJSON;
import cc.application.main.json.metadata.EntityMetadataValueJSON;
import cc.application.simulation.DynamicSimulationManager;
import cc.common.data.TCCDomain.Domain;
import cc.common.data.biologic.Species;
import cc.common.data.biologic.SpeciesIdentifier;
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
import cc.common.data.metadata.Definition;
import cc.common.data.metadata.EntityValue;
import cc.common.data.metadata.EntityValueId;
import cc.common.data.metadata.IntegerValue;
import cc.common.data.metadata.TextValue;
import cc.common.data.metadata.Value;
import cc.common.data.metadata.ValueType;
import cc.common.data.model.Layout;
import cc.common.data.model.LayoutNode;
import cc.common.data.model.LearningActivity;
import cc.common.data.model.LearningActivityGroup;
import cc.common.data.model.Model;
import cc.common.data.model.ModelChangeset;
import cc.common.data.model.ModelDomainAccess;
import cc.common.data.model.ModelDomainAccessId;
import cc.common.data.model.ModelInitialState;
import cc.common.data.model.ModelLink;
import cc.common.data.model.ModelLink.LINK_ACCESS;
import cc.common.data.model.ModelReference;
import cc.common.data.model.ModelShare;
import cc.common.data.model.ModelShare.SHARE_ACCESS;
import cc.common.data.model.ModelShareNotification;
import cc.common.data.model.ModelShareNotificationId;
import cc.common.data.model.ModelVersion;
import cc.common.data.model.ModelVersionId;
import cc.common.data.simulation.AnalysisActivity;
import cc.common.data.simulation.AnalysisEnvironment;
import cc.common.data.simulation.CalcInterval;
import cc.common.data.simulation.ComponentPair;
import cc.common.data.simulation.Course;
import cc.common.data.simulation.CourseActivity;
import cc.common.data.simulation.CourseMutation;
import cc.common.data.simulation.CourseRange;
import cc.common.data.simulation.Experiment;
import cc.common.data.simulation.InitialState;
import cc.common.data.simulation.RealtimeActivity;
import cc.common.data.simulation.RealtimeEnvironment;
import cc.common.simulate.settings.SimulationSettingsJAXBManager;
import cc.common.simulate.settings.dynamic.DynamicSimulationSettings;
import cc.dataaccess.EntityMetadataRangeId;
import cc.dataaccess.EntityMetadataValue;
import cc.dataaccess.ExperimentSettingsData;
import cc.dataaccess.IdReturnValue;
import cc.dataaccess.InitialStateSpecies;
import cc.dataaccess.InitialStateSpeciesId;
import cc.dataaccess.ModelBiologic;
import cc.dataaccess.ModelBiologicIdMap;
import cc.dataaccess.ModelMappedData;
import cc.dataaccess.ModelMetadata;
import cc.dataaccess.main.dao.ContentDao;
import cc.dataaccess.main.dao.ContentReferenceDao;
import cc.dataaccess.main.dao.ExperimentDao;
import cc.dataaccess.main.dao.InitialStateDao;
import cc.dataaccess.main.dao.LayoutDao;
import cc.dataaccess.main.dao.ModelReferenceDao;
import cc.dataaccess.main.dao.ModelScoreDao;
import cc.dataaccess.main.dao.PageReferenceDao;
import cc.dataaccess.main.dao.ReferenceDao;
import cc.dataaccess.main.dao.SectionDao;
import java.util.concurrent.atomic.AtomicInteger;
import cc.dataaccess.user.dao.UserDao;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

import static cc.dataaccess.main.dao.ModelDao.CatalogArrangement;

/**
 * @author bkowal
 */
@Controller
@RequestMapping("/model")
public class ModelController extends AbstractModelController {

	private static final String DOWNLOAD_SECRET = "DOWNLOAD";

	private final Logger jsonResponseLogger = LoggerFactory.getLogger("jsonResponseLogger");

	private final ObjectMapper objectMapper = new ObjectMapper();

	public static enum SEARCH_FOR {
		model, species, knowledge
	}

	@Autowired
	private InitialStateDao initialStateDao;

	@Autowired
	private ReferenceDao referenceDao;

	@Autowired
	private ModelReferenceDao modelReferenceDao;

	@Autowired
	private PageReferenceDao pageReferenceDao;

	@Autowired
	private SectionDao sectionDao;

	@Autowired
	private ContentDao contentDao;

	@Autowired
	private ContentReferenceDao contentReferenceDao;

	@Autowired
	private ExperimentDao experimentDao;

	@Autowired
	private UserDao userDao;

	@Autowired
	private ModelScoreDao modelScoreDao;

	@Autowired
	private LayoutDao layoutDao;

	@Autowired
	private DynamicSimulationManager dynamicSimulationManager;

	private final ConcurrentMap<Long, ModelBiologicMap> cachedModelMap = new ConcurrentHashMap<>();

	private final ConcurrentMap<Long, Map<Long, EntityMetadataValue>> modelEntityMetadataMap = new ConcurrentHashMap<>();

	public static final String ID_FORMAT = "%d/%d";

	@PostConstruct
	public void initialize() {
		if (Files.exists(this.ccFileManager.getCcExportPath()) == false) {
			/*
			 * Attempt to create the export path.
			 */
			try {
				Files.createDirectories(this.ccFileManager.getCcExportPath());
			} catch (IOException e) {
				final String msg = "Failed to create the CC Exports directory: "
						+ this.ccFileManager.getCcExportPath().toString() + "!";
				logger.error(msg, e);
				throw new RuntimeException(msg, e);
			}
		}

		logger.info("Pre-loading the Entity Metadata repository ...");
		long start = System.currentTimeMillis();
		metadataValueDao.getEntityMetadataMap(modelEntityMetadataMap);
		logger.info("Entity Metadata repository pre-load complete. Elapsed time = {} ms.",
				(System.currentTimeMillis() - start));
	}

	@RequestMapping(value = "/access/{accessCode}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody ResponseEntity<Object> getModelAccess(@PathVariable String accessCode, ServletRequest req) {
		/*
		 * Attempt to retrieve the associated {@link ModelLink}.
		 */
		ModelLink modelLink = this.modelLinkDao.getForAccessCode(accessCode);
		if (modelLink == null) {
			return new ResponseEntity<Object>("Invalid Access Code!", HttpStatus.BAD_REQUEST);
		}
		/*
		 * Verify that the {@link ModelLink} has not expired.
		 */
		if (modelLink.getEndDate() != null && Calendar.getInstance().after(modelLink.getEndDate())) {
			return new ResponseEntity<Object>("The Access Code has expired!", HttpStatus.BAD_REQUEST);
		}

		/*
		 * Is this {@link ModelLink} associated with the SHARE access?
		 */
		if (modelLink.getAccess() == LINK_ACCESS.SHARE) {
			final Long userId = getAuthenticatedUserId();
			if (userId == null) {
				return new ResponseEntity<Object>("You must be authenticated to complete this action!",
						HttpStatus.FORBIDDEN);
			}

			final Domain domain = getOrigin(req, userId);
			if (domain == null || domain != Domain.LEARN) {
				return new ResponseEntity<Object>("Invalid Access Code!", HttpStatus.BAD_REQUEST);
			}

			/*
			 * Verify that the {@link Model} has not already been shared with the user using
			 * the provided {@link ModelLink}.
			 */
			List<ModelShare> existing = modelShareDao.getShareForUserAndModelLink(userId, modelLink.getId());
			if (CollectionUtils.isNotEmpty(existing)) {
				return new ResponseEntity<Object>(new ModelLinkAccess(modelLink.getModel_id(), modelLink.getStartDate(),
						modelLink.getEndDate(), generateAccessToken(accessCode)), HttpStatus.OK);
			}

			/*
			 * Create a {@link ModelShare} record and a {@link ModelDomainAccess} record.
			 */
			ModelDomainAccess mda = new ModelDomainAccess(modelLink.getModel_id(), userId, domain);
			mda.setModelLinkId(modelLink.getId());
			ModelShare ms = new ModelShare();
			ms.setModel_id(modelLink.getModel_id());
			ms.setUserId(userId);
			ms.setAccess(SHARE_ACCESS.VIEW);
			ms.setModelLinkId(modelLink.getId());

			final String operationIdentifier = UUID.randomUUID().toString().toUpperCase();
			try {
				modelDao.saveModelAccessLearn(mda, ms, operationIdentifier);
			} catch (Exception e) {
				logger.error("Failed to save: " + mda.toString() + " and " + ms.toString() + " (Trx Id: "
						+ operationIdentifier + ").", e);
				return new ResponseEntity<Object>(
						"Failed to handle request. Reference Trx Id: " + operationIdentifier + ".",
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
			return new ResponseEntity<Object>(new ModelLinkAccess(modelLink.getModel_id()), HttpStatus.OK);
		}

		return new ResponseEntity<Object>(new ModelLinkAccess(modelLink.getModel_id(), modelLink.getStartDate(),
				modelLink.getEndDate(), generateAccessToken(accessCode)), HttpStatus.OK);
	}

	private String generateAccessToken(final String accessCode) {
		return Jwts.builder().setSubject(accessCode).signWith(SignatureAlgorithm.HS512, TEMP_SECRET).compact();
	}

	@RequestMapping(value = "/edu/add/{id}", method = RequestMethod.GET)
	public @ResponseBody ResponseEntity<Object> addModelDomainAccess(@PathVariable Long id, ServletRequest req) {
		return this.addOrRemoveModelDomainAccess(id, req, false);
	}

	@RequestMapping(value = "/edu/remove/{id}", method = RequestMethod.GET)
	public @ResponseBody ResponseEntity<Object> removeModelDomainAccess(@PathVariable Long id, ServletRequest req) {
		return this.addOrRemoveModelDomainAccess(id, req, true);
	}

	private @ResponseBody ResponseEntity<Object> addOrRemoveModelDomainAccess(final Long modelId, ServletRequest req,
			boolean remove) {
		final Long userId = this.getAuthenticatedUserId();
		if (userId == null) {
			return new ResponseEntity<Object>("This method is only available to authenticated users.",
					HttpStatus.FORBIDDEN);
		}

		final Domain domain = this.getOrigin(req, userId);
		if (domain == null) {
			return new ResponseEntity<Object>("Request was made from an unrecognized origin.", HttpStatus.BAD_REQUEST);
		}

		Model model = this.modelDao.getModel(modelId);
		if (model == null) {
			return new ResponseEntity<Object>("Unable to find Model with id: " + modelId + ".", HttpStatus.NOT_FOUND);
		}
		ModelVersion modelVersion = modelVersionDao.getVersionIdForModel(model.getId());
		if (modelVersion == null) {
			return new ResponseEntity<Object>("Failed to find version information for Model: " + model.getId() + ".",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}
		ModelPermissions permissions = this.determineModelPermissions(model, modelVersion, userId, null);
		if (permissions.isView() == false) {
			return new ResponseEntity<Object>("Access to Model: " + modelId + " is forbidden.", HttpStatus.FORBIDDEN);
		}

		ResponseEntity<Object> responseObject = null;
		final String operationIdentifier = UUID.randomUUID().toString().toUpperCase();
		if (remove) {
			final ModelDomainAccessId id = new ModelDomainAccessId(modelId, userId, domain);
			try {
				ModelDomainAccess modelDomainAccess = this.modelDao.getModelDomainAccessById(id);
				if (modelDomainAccess == null) {
					return new ResponseEntity<Object>("Unable to find Model Domain Access for Model: " + modelId + ".",
							HttpStatus.NOT_FOUND);
				}
				this.modelDao.deleteModelDomainAccess(modelDomainAccess,
						modelShareDao.getShareForUserAndModelLink(userId, modelDomainAccess.getModelLinkId()),
						operationIdentifier);
				logger.info("Successfully deleted Model Domain Access: " + modelDomainAccess.toString() + ".");
			} catch (Exception e) {
				logger.error("Failed to delete Model Domain Access with id: " + id.toString() + ".", e);
				responseObject = new ResponseEntity<Object>(
						"Failed to remove Model Domain Access to Model: " + modelId + ".",
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} else {
			ModelDomainAccess modelDomainAccess = new ModelDomainAccess(model.getId(), userId, domain);
			try {
				this.modelDao.saveModelDomainAccess(modelDomainAccess, operationIdentifier);
				logger.info("Successfully saved Model Domain Access: " + modelDomainAccess.toString() + ".");
			} catch (Exception e) {
				logger.error("Failed to save Model Domain Access: " + modelDomainAccess.toString() + ".", e);
				responseObject = new ResponseEntity<Object>(
						"Failed to add Model Domain Access to Model: " + modelId + ".",
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}

		if (responseObject == null) {
			return new ResponseEntity<Object>("Success.", HttpStatus.CREATED);
		} else {
			return responseObject;
		}
	}

	@RequestMapping(value = "/cards/count/{domain}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody ResponseEntity<Object> getCardCount(
		@RequestParam(value = "modelTypes", required = false) String modelType,
		@PathVariable String domain, ServletRequest request
	) {
		final StopWatch timer = new StopWatch();
		timer.start();
		
		final Long userId = this.getAuthenticatedUserId();

		List<String> modelTypes;
		if(modelType == null){
			modelTypes = Arrays.asList(new String[]{"boolean", "metabolic"});
		}else{
			modelTypes = Arrays.asList(modelType.split("&"));
		}

		String domainAsString = this.getOriginStr(domain, request, userId);

		Map<String, Integer> models = this.modelDao.getModelCount(domainAsString, modelTypes, userId);
		
		timer.stop();
		this.performanceLogger.info("Card count query ran in {} ms.", timer.getTime());

		return new ResponseEntity<Object>(models, HttpStatus.OK);
	}

	@RequestMapping(value = "/cards/ids/{domain}", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody ResponseEntity<Object> getCardIds(
		@RequestParam(value = "modelTypes", required = false) String modelType,
		@PathVariable String domain, ServletRequest request
	) {
		final StopWatch timer = new StopWatch();
		timer.start();
		
		final Long userId = this.getAuthenticatedUserId();

		List<String> modelTypes;
		if(modelType == null){
			modelTypes = Arrays.asList(new String[]{"boolean", "metabolic"});
		}else{
			modelTypes = Arrays.asList(modelType.split("&"));
		}

		String domainAsString = this.getOriginStr(domain, request, userId);
		Map<String, List<Long>> models = this.modelDao.getModelIds(domainAsString, modelTypes, userId);

		timer.stop();
		this.performanceLogger.info("Card count query ran in {} ms.", timer.getTime());

		return new ResponseEntity<Object>(models, HttpStatus.OK);
	}

	protected String getOriginStr(String domain, ServletRequest req, final Long userId){
		final Domain origin = this.getOrigin(req, userId);
		String domainAsString = domain;
		if(domainAsString == null){
			switch(origin){
				case LEARN:
					domainAsString = "learning";
					break;
				case TEACH:
					domainAsString = "teaching";
					break;
				case RESEARCH:
					domainAsString = "research";
					break;
			}
		}
		return domainAsString;
	}

	protected Model getModelFromVersionList(
		final List<ModelVersion> versions,
		final Map<Long, Model> modelIdToModelMap
	){
		ModelVersion currentModelVersion = versions.iterator().next();
		Model model = modelIdToModelMap.get(currentModelVersion.getModelId());
		if (model == null) {
			model = modelIdToModelMap.get(currentModelVersion.getId().getId());
		}
		return model;
	}

	protected Map<Long, List<ModelVersion>> parseData(
			Set<Model> models
	){
		Map<Long, List<ModelVersion>> versionIdToModelVersionsMap = new LinkedHashMap<>();
		if (CollectionUtils.isNotEmpty(models)) {
			/*
			 * Retrieve information about the {@link ModelVersion}s for any discovered
			 * {@link Model}s.
			 */
			final Set<Long> modelIds = new LinkedHashSet<>(models.size(), 1.0f);
			final Map<Long, Long> modelIdsToVersions = new LinkedHashMap<>(models.size(), 1.0f);
			models.forEach((m) -> {
				modelIds.add(m.getId());
				modelIdsToVersions.put(m.getId(), null);
			});

			final List<ModelVersion> availableModelVersions = modelVersionDao.getPossibleVersionsForModels(modelIds);
			for (ModelVersion modelVersion : availableModelVersions) {
				final Long versionId = modelVersion.getId().getId();
				if (!versionIdToModelVersionsMap.containsKey(versionId)) {
					versionIdToModelVersionsMap.put(versionId, new LinkedList<>());
				}
				modelIdsToVersions.put(modelVersion.getModelId(), versionId);
				versionIdToModelVersionsMap.get(versionId).add(modelVersion);
			}

			/*
			 * Identify any {@link Model}s that version information was not retrieved for.
			 */
			if (!modelIds.isEmpty()) {
				final Set<Long> possibleFirstVersionRemovedModelIds = new HashSet<>(modelIds);
				for (Long id : modelIds) {
					if (!possibleFirstVersionRemovedModelIds.contains(id)) {
						continue;
					}
					final ModelVersion modelVersion = modelVersionDao.getVersionIdForModel(id);
					if (modelVersion == null) {
						possibleFirstVersionRemovedModelIds.remove(id);
						continue;
					}
					/*
					 * Get all possible versions associated with the retrieved version.
					 */
					final Set<Long> modelVersionIds = new HashSet<>();
					modelVersionIds.add(modelVersion.getId().getId());
					final List<ModelVersion> remainingModelVersions = modelVersionDao
							.getPossibleVersionsForModels(modelVersionIds);
					Iterator<ModelVersion> iterator = remainingModelVersions.iterator();
					final ModelVersion latestModelVersion = iterator.next();
					versionIdToModelVersionsMap.put(latestModelVersion.getModelId(), new LinkedList<>());
					versionIdToModelVersionsMap.get(latestModelVersion.getModelId()).add(latestModelVersion);
					modelIdsToVersions.put(id, latestModelVersion.getModelId());
					possibleFirstVersionRemovedModelIds.remove(latestModelVersion.getModelId());
					while (iterator.hasNext()) {
						final ModelVersion nextModelVersion = iterator.next();
						versionIdToModelVersionsMap.get(latestModelVersion.getModelId()).add(nextModelVersion);
						possibleFirstVersionRemovedModelIds.remove(nextModelVersion.getModelId());
					}
				}
			}

			//to preserve ordering in which the models are inputted
			Map<Long, List<ModelVersion>> newlist = new LinkedHashMap<>();
			modelIdsToVersions.forEach((v, id) -> {
				if(id != null){
					newlist.put(id, versionIdToModelVersionsMap.get(id));
				}
			});
			return newlist;
		}

		return versionIdToModelVersionsMap;


//		https://git.unl.edu/helikarlab/cellcollective/-/blob/develop/cc/client/app/component/home/modelsView.js#L482
	}

	@RequestMapping(value = "/get", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody ResponseEntity<Object> getModels(
			@RequestParam(value = "search", required = false) SEARCH_FOR[] searchForArray,
			@RequestParam(value = "name", required = false) String name, 
			@RequestParam(value = "id", required = false) Integer specificId,
			@RequestParam(value = "domain", required = false) String domain,
			@RequestParam(value = "modelTypes", required = false) String modelType,
			@RequestParam(value = "start", required = false) Integer start,
			@RequestParam(value = "cards", required = false) Integer cards,
			@RequestParam(value = "category", required = false) String category,
			@RequestParam(value = "orderBy", required = false) String orderBy,
			@RequestParam(value = "addCourse", required = false) String addCourse,
			@RequestParam(value = "mCourseId", required = false) Long mCourseId,
			ServletRequest request) {
		
		if (searchForArray != null && (name == null || name.trim().isEmpty())) {
			return new ResponseEntity<Object>(
					"The 'name' parameter is required when the 'search' parameter is present.", HttpStatus.BAD_REQUEST);
		}

		List<String> modelTypes;
		if(modelType == null){
			modelTypes = Arrays.asList(new String[]{"boolean", "metabolic"});
		}else{
			modelTypes = Arrays.asList(modelType.split("&"));
		}		

		final StopWatch timer = new StopWatch();
		Long tempModelId = this.checkForTempAccess(request);

		timer.start();

		final Long userId = this.getAuthenticatedUserId();

		int _start = start == null ? 0 : start;
		int _cards = cards == null ? 99999999 : cards;

		Set<Model> models = Collections.emptySet();

		if(specificId != null){
			logger.info("Retrieving single visible specific model for user: {} ...", userId);
			models = new HashSet<>(this.modelDao.getSingleModel(new Long(specificId), userId, mCourseId));

			//TODO: figure out the temporary model ID		
			/*
			* Retrieve the {@link Model} that the user has temporary access to, if
			* applicable.
			*/
			if (tempModelId != null) {
				logger.info("Retrieving Temporary Access Model with id: {} ...", tempModelId);
				Model model = this.modelDao.getModel(tempModelId);

				if (model != null) {
					tempModelId = model.getId();
					model = this.modelDao.getModel(tempModelId);
				}

	//			Model model = modelIdToModelMap.get();
				if (model != null) {
					models.add(model);
				}
			}



		}else if (searchForArray == null || searchForArray.length == 0) {
			if(addCourse == null){
			if(cards == null){
				return new ResponseEntity<Object>(
					"You must specify cards parameter.", HttpStatus.BAD_REQUEST);
			}
		}
			logger.info("Retrieving all visible Model(s) for user: {} ...", userId);

			if(category == null || !(category.equals("my") || category.equals("published") || category.equals("shared") ) ){
				return new ResponseEntity<Object>(
					"Invalid or missing 'category' parameter.", HttpStatus.BAD_REQUEST);
			}

//			Integer _start2 = start == null ? 0 : start;
//			Integer _cards2 = cards == null ? 99999999 : cards;
			Integer _start2 = 0;
			Integer _cards2 = 99999999;

			String domainAsString = this.getOriginStr(domain, request, userId);
			models = new LinkedHashSet<>(this.modelDao.getModelsForCards(domainAsString, modelTypes, category, orderBy, userId, _cards2, _start2));
//			final AtomicInteger count = new AtomicInteger();
//			models.forEach(model -> {
//				if(count.incrementAndGet() < 5) {
//					System.out.println("MODEL " + model.getId());
//				}
////				Long id = la.getMasterId();
//			});
		} else {
			models = new HashSet<>();
			for (SEARCH_FOR searchFor : searchForArray) {
				if (searchFor == SEARCH_FOR.model) {
					models.addAll(modelDao.searchViewableModels(userId, name));
				} else if (searchFor == SEARCH_FOR.species) {
					models.addAll(modelDao.searchViewableModelsWithSpecies(userId, name));
				} else if (searchFor == SEARCH_FOR.knowledge) {
					models.addAll(modelDao.searchViewableModelsWithKnowledgeContent(userId, name));
				}
			}
		}

		Map<Long, List<ModelVersion>> versionIdToModelVersionsMap = parseData(models);	
	

		if (!models.isEmpty() && versionIdToModelVersionsMap.isEmpty()) {
			logger.error(
					"Failed to determine the available Model Versions for visible Models requested by user: {}. Please verify the database has not been corrupted.",
					userId);
			return new ResponseEntity<Object>("Failed to determine the available Model versions.",
					HttpStatus.INTERNAL_SERVER_ERROR);
		}

		final Map<Long, Model> modelIdToModelMap = new HashMap<>(models.size(), 1.0f);
		models.forEach((m) -> modelIdToModelMap.put(m.getId(), m));

		//TODO (ales) the pagination is done here on application level. Better to do it in the DB, but the logic
		// above currently is messing with simple LIMIT OFFSET query
		Map<Long, List<ModelVersion>> versionIdToModelVersionsMap2 = new LinkedHashMap<>();
		int modelNo = 0;
		for (Long versionId : versionIdToModelVersionsMap.keySet()) {
			// modelNo++;
			// if (modelNo <= _start)
			// 	continue;
			// if (modelNo >= _start + _cards + 1)
			// 	break;
			versionIdToModelVersionsMap2.put(versionId, versionIdToModelVersionsMap.get(versionId));
		}
		versionIdToModelVersionsMap = versionIdToModelVersionsMap2;


		// --BEGIN-- optimize batch SQL queries
		Map<Long, ModelInitialState> modelIdToModelInitialStatesMap = new HashMap<>(models.size(), 1.0f);
		modelDao.getModelInitialStates(models.stream().map(m -> m.getId()).collect(Collectors.toList()))
				.forEach(mis -> modelIdToModelInitialStatesMap.put(mis.getModelId(), mis));
		List<Long> lastestMasterIds = versionIdToModelVersionsMap.values().stream()
				.map(mv -> mv.iterator().next().getId().getId()).collect(Collectors.toList());

		Map<Long, List<LearningActivity>> masterIdToLearningActivityMap = new HashMap<>(lastestMasterIds.size(), 1.0f);
		modelVersionDao.getLearningActivityByMasterIds(lastestMasterIds).forEach(la -> {
			Long id = la.getMasterId();
			List<LearningActivity> listLA = masterIdToLearningActivityMap.get(id);
			if (listLA == null) {
				listLA = new ArrayList<>();
				masterIdToLearningActivityMap.put(id, listLA);
			}
			listLA.add(la);
		});

		Map<Long, List<LearningActivityGroup>> masterIdToLearningActivityGroupMap = new HashMap<>(
				lastestMasterIds.size(), 1.0f);
		modelVersionDao.getLearningActivityGroupByMasterIds(lastestMasterIds).forEach(lag -> {
			Long id = lag.getMasterId();
			List<LearningActivityGroup> listLAG = masterIdToLearningActivityGroupMap.get(id);
			if (listLAG == null) {
				listLAG = new ArrayList<>();
				masterIdToLearningActivityGroupMap.put(id, listLAG);
			}
			listLAG.add(lag);
		});

		Map<Long, List<ModelShare>> masterIdToModelShareMap = new HashMap<>(lastestMasterIds.size(), 1.0f);
		final List<ModelShare> EMPTY_MODEL_SHARE_LIST = new ArrayList<>();
		modelShareDao.getShareForUserAndModelIds(userId, lastestMasterIds).forEach(ms -> {
			Long id = ms.getModel_id();
			List<ModelShare> listMS = masterIdToModelShareMap.get(id);
			if (listMS == null) {
				listMS = new ArrayList<>();
				masterIdToModelShareMap.put(id, listMS);
			}
			listMS.add(ms);
		});
		// --END-- optimize batch SQL queries

		List<ViewableModel> viewableModels;
		ModelVersion currentModelVersion = null;
		if (models.isEmpty()) {
			viewableModels = Collections.emptyList();
		} else {
			viewableModels = new ArrayList<>();

			for (Long versionId : versionIdToModelVersionsMap.keySet()) {
				List<ModelVersion> availableModelVersions = versionIdToModelVersionsMap.get(versionId);
				/*
				 * The first {@link Model} in the {@link List} should be the latest model
				 * version.
				 */
				currentModelVersion = availableModelVersions.iterator().next();
				/*
				 * Already have the current (latest) version of the Model, so remove it so that
				 * only additional versions will remain.
				 */
				Model model = modelIdToModelMap.get(currentModelVersion.getModelId());
				if (model == null) {
					model = modelIdToModelMap.get(currentModelVersion.getId().getId());
				}
				if(model == null){
					//TODO: dirty (Ales)
					continue;
				}

				HashCodeBuilder builder = new HashCodeBuilder().append(userId).append(model.getUpdateDate());
				for (ModelVersion version : availableModelVersions) {
					Model m = modelIdToModelMap.get(version.getModelId());
					if (m == null) {
						m = modelIdToModelMap.get(version.getId().getId());
					}
					if(m == null){
						//TODO: dirty (Ales)
						continue;
					}
					builder = builder.append(m.getUpdateDate());
				}

				final String hash = Integer
						.toString(builder.append(CurrentVersion.getInstance().getStartupDate()).toHashCode());
				final Map<Long, EntityMetadataValueJSON> metadataMap = new HashMap<>();
				this.buildMetadataValueMap(model.getId(), true, metadataMap);
				final Map<Long, ModelVersionJSON> modelVersionMap = new HashMap<>();
				final Map<Long, LearningActivityJSON> learningActivityMap = new HashMap<>();
				final Map<Long, LearningActivityGroupJSON> learningActivityGroupMap = new HashMap<>();
				availableModelVersions.stream()
						.forEach((v) -> modelVersionMap.put(v.getId().getVersion(), new ModelVersionJSON(v)));
				model.setId(currentModelVersion.getId().getId());
				ModelJSON modelJSON = new ModelJSON(model, currentModelVersion.getId().getVersion(), modelVersionMap);
				ModelInitialState modelInitialState = modelIdToModelInitialStatesMap.get(model.getId()); // modelDao.getModelInitialState(model.getId());
				if (modelInitialState != null) {
					if (modelInitialState.getWorkspaceLayout() != null) {
						/*
						 * Convert the Workspace Layout JSON String to a JSON object.
						 */
						try {
							modelInitialState.setWorkspaceLayoutAsJSON(
									objectMapper.readValue(modelInitialState.getWorkspaceLayout(), Object.class));
						} catch (IOException e) {
							logger.error("Model retrieval failed for user: " + userId
									+ ". Failed to complete JSON conversion of workspaceLayout for: "
									+ modelInitialState.toString() + ".", e);
							return new ResponseEntity<Object>("Failed to complete JSON conversion of workspaceLayout.",
									HttpStatus.INTERNAL_SERVER_ERROR);
						}
					}
					if (modelInitialState.getSurvey() != null) {
						/*
						 * Convert the Survey JSON String to a JSON object.
						 */
						try {
							modelInitialState.setSurveyAsJSON(
									objectMapper.readValue(modelInitialState.getSurvey(), Object.class));
						} catch (IOException e) {
							logger.error("Model retrieval failed for user: " + userId
									+ ". Failed to complete JSON conversion of survey for: "
									+ modelInitialState.toString() + ".", e);
							return new ResponseEntity<Object>("Failed to complete JSON conversion of survey.",
									HttpStatus.INTERNAL_SERVER_ERROR);
						}
					}
					if (modelInitialState.getContent() != null) {
						/*
						 * Convert the Content JSON String to a JSON object.
						 */
						try {
							modelInitialState.setContentAsJSON(
									objectMapper.readValue(modelInitialState.getContent(), Object.class));
						} catch (IOException e) {
							logger.error("Model retrieval failed for user: " + userId
									+ ". Failed to complete JSON conversion of content for: "
									+ modelInitialState.toString() + ".", e);
							return new ResponseEntity<Object>("Failed to complete JSON conversion of content.",
									HttpStatus.INTERNAL_SERVER_ERROR);
						}
					}

				}
				modelJSON.setModelInitialState(modelInitialState);

				/*
				 * Retrieve any available learning activities.
				 */
				final List<LearningActivity> learningActivities =
						// modelVersionDao.getLearningActivityByMasterId(currentModelVersion.getId().getId());
						masterIdToLearningActivityMap.get(currentModelVersion.getId().getId());
				if (CollectionUtils.isNotEmpty(learningActivities)) {
					for (LearningActivity learningActivity : learningActivities) {
						Object learningActivityAsJSON = null;
						Object viewsAsJSON = null;
						if (learningActivity.getWorkspaceLayout() != null) {
							try {
								learningActivityAsJSON = objectMapper
										.readValue(learningActivity.getWorkspaceLayout().getBytes(), Object.class);
							} catch (Exception e) {
							}
						}
						if (learningActivity.getViews() != null) {
							try {
								viewsAsJSON = objectMapper.readValue(learningActivity.getViews().getBytes(),
										Object.class);
							} catch (Exception e) {
							}
						}
						learningActivityMap.put(learningActivity.getId(),
								new LearningActivityJSON(learningActivity, learningActivityAsJSON, viewsAsJSON));
					}
				}

				final List<LearningActivityGroup> learningActivitiesGroups =
						// modelVersionDao.getLearningActivityGroupByMasterId(currentModelVersion.getId().getId());
						masterIdToLearningActivityGroupMap.get(currentModelVersion.getId().getId());
				if (CollectionUtils.isNotEmpty(learningActivitiesGroups)) {
					for (LearningActivityGroup learningActivityGroup : learningActivitiesGroups) {
						learningActivityGroupMap.put(learningActivityGroup.getId(),
								new LearningActivityGroupJSON(learningActivityGroup));
					}
				}

				Map<String, EntityMetadataRangeJSON> metadataRangeMap = new HashMap<>();
				this.buildMetadataRangeMap(model.getId(), true, metadataRangeMap);
				ModelPermissions modelPermissions = this.determineModelPermissions(model, currentModelVersion, userId,
						tempModelId, masterIdToModelShareMap.getOrDefault(currentModelVersion.getId().getId(),
								EMPTY_MODEL_SHARE_LIST));
				viewableModels.add(new ViewableModel(modelJSON, modelPermissions, hash, metadataMap, metadataRangeMap,
						this.buildUploadMap(model.getId(), metadataMap, userId), learningActivityMap,
						learningActivityGroupMap));
			}
		}
		logger.info("Successfully retrieved {} visible Model(s) for user: {}.", models.size(), userId);
		timer.stop();
		this.performanceLogger.info("cc.application.main.controller.ModelController.getModels() finished in {} ms.",
				timer.getTime());
		return new ResponseEntity<Object>(viewableModels, HttpStatus.OK);
	}

	private void getShareInformation(final Long userId, final Model model, final ModelVersion modelVersion,
			final ModelBiologicMap modelBiologicMap) {
		/*
		 * Determine if share information needs to be retrieved.
		 */
		if (userId == null || model.getUserId() == null) {
			return;
		}

		final Long versionId = modelVersion.getId().getId();

		/*
		 * Verify that the user actually owns the model or that the model has been
		 * shared with the user.
		 */
		if (!model.getUserId().equals(userId)) {
			if (this.modelShareDao.getShareAccess(userId, versionId) == null) {
				/*
				 * The user does not own the Model and the Model has not been shared with the
				 * user => the user has temporary Model access; do not retrieve share
				 * information.
				 */
				return;
			}
		}

		List<ModelShare> shares = this.modelShareDao.getForModel(versionId);
		if (CollectionUtils.isNotEmpty(shares)) {
			modelBiologicMap.constructShareMapping(shares);
		}

		List<ModelLink> links = this.modelLinkDao.getForModel(versionId);
		if (CollectionUtils.isNotEmpty(links)) {
			modelBiologicMap.constructLinkMapping(links);
		}
	}

	private void getVisibleExperiments(final Long userId, final Model model, final ModelVersion modelVersion,
			final ModelBiologicMap modelBiologicMap) {
		List<Experiment> experiments = this.experimentDao.getVisibleExperiments(model.getId(), userId);
		if (CollectionUtils.isEmpty(experiments)) {
			return;
		}
		modelBiologicMap.setExperimentMap(this.buildExperimentMap(experiments, modelBiologicMap));
	}

	private void getLayoutInformation(final Model model, final ModelBiologicMap modelBiologicMap) {
		final List<Layout> layouts = layoutDao.getLayoutsForModel(model);
		if (CollectionUtils.isEmpty(layouts)) {
			return;
		}
		modelBiologicMap.constructLayoutMapping(layouts);
		for (Layout layout : layouts) {
			final List<LayoutNode> layoutNodes = layoutDao.getLayoutNodesForLayout(layout);
			if (CollectionUtils.isEmpty(layoutNodes)) {
				continue;
			}
			modelBiologicMap.constructLayoutNodeMapping(layoutNodes);
		}
	}

	@RequestMapping(value = "/get/{id}", method = RequestMethod.GET, produces = {
			MediaType.APPLICATION_JSON_VALUE + "; charset=UTF-8" })
	public @ResponseBody ResponseEntity<Object> getModel(
			@PathVariable Long id,
			@RequestParam(value = "version", required = false) Long version, 
			@RequestParam(value = "description", defaultValue="false", required = false) boolean description, 
			@RequestParam(value = "mCourseId", required = false) Long mCourseId,
			ServletResponse res,
			ServletRequest request) {
		Long tempModelId = this.checkForTempAccess(request);
		final Long userId = this.getAuthenticatedUserId();
		if (tempModelId != null) {
			Model model = this.modelDao.getModel(tempModelId);
		}
		final boolean hasModelCourse = (mCourseId != null && mCourseId > 0) ? true : false;
		/*
		 * Determine which version of the {@link Model} has been requested.
		 */
		ModelVersion modelVersion = null;
		if (version == null) {
			/*
			 * A specific version has not been specified. Retrieve the latest {@link
			 * ModelVersion}.
			 */
			modelVersion = modelVersionDao.getLatestVersionForVersionId(id);
		} else {
			/*
			 * A specific version has been specified. Verify that a {@link ModelVersion}
			 * actually exists.
			 */
			modelVersion = modelVersionDao.getById(new ModelVersionId(id, version));
		}
		if (modelVersion == null) {
			String responseMsg = "Unable to find Model with id: " + id;
			if (version == null) {
				responseMsg += ".";
			} else {
				responseMsg += " and version: " + version + ".";
			}
			return new ResponseEntity<Object>(responseMsg, HttpStatus.NOT_FOUND);
		}

		final Long modelId = modelVersion.getModelId();
		if (this.cachedModelMap.containsKey(modelId) && !description) {
			logger.info(
					"Found Model with id: " + id + "; version: " + modelVersion.getId().toString() + " in the cache.");
			Model model = this.modelDao.getModel(modelId);

			ModelPermissions permissions = this.determineModelPermissions(model, modelVersion, userId, tempModelId);
			if (permissions.isView() == false && hasModelCourse == false) {
				return new ResponseEntity<Object>("Access to Model: " + id + " is forbidden.", HttpStatus.FORBIDDEN);
			}

			Map<String, ModelBiologicMap> modelMap = new HashMap<>(1, 1.0f);
			ModelBiologicMap modelBiologicMap = new ModelBiologicMap(
					this.cachedModelMap.get(modelVersion.getModelId()));
			this.getShareInformation(userId, model, modelVersion, modelBiologicMap);
			this.getLayoutInformation(model, modelBiologicMap);

			this.loadKBInformation(id, modelBiologicMap);
			modelBiologicMap.setPermissions(permissions);
			/*
			 * Retrieve experiments the user has access to.
			 */
			getVisibleExperiments(userId, model, modelVersion, modelBiologicMap);
			buildEnvironmentMap(userId, model, modelVersion, modelBiologicMap);
			modelBiologicMap.setScore(this.modelScoreDao.getScoreForModel(id));
			final Map<Long, EntityMetadataValueJSON> metadataMap = new HashMap<>();
			this.buildMetadataValueMap(model.getId(), false, metadataMap);
			this.buildMetadataValueMap(model.getId(), true, metadataMap);
			modelBiologicMap.setMetadataValueMap(metadataMap);
			final Map<String, EntityMetadataRangeJSON> metadataRangeMap = new HashMap<>();
			this.buildMetadataRangeMap(model.getId(), false, metadataRangeMap);
			this.buildMetadataRangeMap(model.getId(), true, metadataRangeMap);
			modelBiologicMap.setMetadataRangeMap(metadataRangeMap);
			modelBiologicMap.setUploadMap(this.buildUploadMap(model.getId(), metadataMap, userId));
			buildComponentPairMap(modelBiologicMap);
			buildModelReferenceTypesMap(id, modelBiologicMap);
			this.buildModelVersionMap(modelId, modelBiologicMap);
			ModelInitialState modelInitialState = modelDao.getModelInitialState(model.getId());
			if (modelInitialState != null) {
				if (modelInitialState.getWorkspaceLayout() != null) {
					/*
					 * Convert the Workspace Layout JSON String to a JSON object.
					 */
					try {
						modelInitialState.setWorkspaceLayoutAsJSON(
								objectMapper.readValue(modelInitialState.getWorkspaceLayout(), Object.class));
					} catch (IOException e) {
						logger.error("Model retrieval failed for user: " + userId
								+ ". Failed to complete JSON conversion of workspaceLayout for: "
								+ modelInitialState.toString() + ".", e);
						return new ResponseEntity<Object>("Failed to complete JSON conversion of workspaceLayout.",
								HttpStatus.INTERNAL_SERVER_ERROR);
					}
				}
				if (modelInitialState.getSurvey() != null) {
					/*
					 * Convert the Survey JSON String to a JSON object.
					 */
					try {
						modelInitialState
								.setSurveyAsJSON(objectMapper.readValue(modelInitialState.getSurvey(), Object.class));
					} catch (IOException e) {
						logger.error("Model retrieval failed for user: " + userId
								+ ". Failed to complete JSON conversion of survey for: " + modelInitialState.toString()
								+ ".", e);
						return new ResponseEntity<Object>("Failed to complete JSON conversion of survey.",
								HttpStatus.INTERNAL_SERVER_ERROR);
					}
				}
				if (modelInitialState.getContent() != null) {
					/*
					 * Convert the Content JSON String to a JSON object.
					 */
					try {
						modelInitialState
								.setContentAsJSON(objectMapper.readValue(modelInitialState.getContent(), Object.class));
					} catch (IOException e) {
						logger.error("Model retrieval failed for user: " + userId
								+ ". Failed to complete JSON conversion of content for: " + modelInitialState.toString()
								+ ".", e);
						return new ResponseEntity<Object>("Failed to complete JSON conversion of content.",
								HttpStatus.INTERNAL_SERVER_ERROR);
					}
				}

			}
			if (modelInitialState != null) {
				modelBiologicMap.setModelInitialState(modelInitialState);
			}
			modelMap.put(String.format(ID_FORMAT, modelVersion.getId().getId(), modelVersion.getId().getVersion()),
					modelBiologicMap);
//			this.addCacheControlResponse(res);

			return new ResponseEntity<Object>(modelMap, HttpStatus.OK);
		}

		final StopWatch timer = new StopWatch();
		timer.start();
		logger.info("Retrieving Model {} with version {} for user: {} ...", id, modelVersion.getId().toString(),
				userId);
		Model model = this.modelBiologicDao.getModel(modelId);
		/*
		 * Verify that the requested {@link Model} exists.
		 */
		if (model == null) {
			logger.warn("Unable to find Model with id: " + id + ".");
			return new ResponseEntity<Object>(
					"Unable to find Model with id: " + id + " and version: " + modelVersion.getId().getVersion() + ".",
					HttpStatus.NOT_FOUND);
		}
		/*
		 * Verify that the user has access to the {@link Model}.
		 */
		//final long idd = model.getId();
		ModelPermissions permissions = this.determineModelPermissions(model, modelVersion, userId, tempModelId);

		if (permissions.isView() == false && hasModelCourse == false) {
			return new ResponseEntity<Object>("Access to Model: " + id + " is forbidden.", HttpStatus.FORBIDDEN);
		}

		Map<String, ModelBiologicMap> modelMap = new HashMap<>(1, 1.0f);
		ModelBiologicMap modelBiologicMap = new ModelBiologicMap(model);
		ModelInitialState modelInitialState = modelBiologicMap.getModelInitialState();
		if (modelInitialState != null) {
			if (modelInitialState.getWorkspaceLayout() != null) {
				/*
				 * Convert the Workspace Layout JSON String to a JSON object.
				 */
				Object workspaceLayoutAsJSON;
				try {
					workspaceLayoutAsJSON = objectMapper.readValue(modelInitialState.getWorkspaceLayout().getBytes(),
							Object.class);
					modelBiologicMap.setWorkspaceLayout(workspaceLayoutAsJSON);
				} catch (IOException e) {
					logger.error("Model retrieval failed for user: " + userId
							+ ". Failed to complete JSON conversion of workspaceLayout for: "
							+ modelInitialState.toString() + ".", e);
					return new ResponseEntity<Object>("Failed to complete JSON conversion of workspaceLayout.",
							HttpStatus.INTERNAL_SERVER_ERROR);
				}
			}
			if (modelInitialState.getSurvey() != null) {
				/*
				 * Convert the Survey JSON String to a JSON object.
				 */
				Object surveyAsJSON;
				try {
					surveyAsJSON = objectMapper.readValue(modelInitialState.getSurvey().getBytes(), Object.class);
					modelBiologicMap.setSurvey(surveyAsJSON);
				} catch (IOException e) {
					logger.error("Model retrieval failed for user: " + userId
							+ ". Failed to complete JSON conversion of survey for: " + modelInitialState.toString()
							+ ".", e);
					return new ResponseEntity<Object>("Failed to complete JSON conversion of survey.",
							HttpStatus.INTERNAL_SERVER_ERROR);
				}
			}
			if (modelInitialState.getContent() != null) {
				/*
				 * Convert the Content JSON String to a JSON object.
				 */
				Object contentAsJSON;
				try {
					contentAsJSON = objectMapper.readValue(modelInitialState.getContent().getBytes(), Object.class);
					modelBiologicMap.setContent(contentAsJSON);
				} catch (IOException e) {
					logger.error("Model retrieval failed for user: " + userId
							+ ". Failed to complete JSON conversion of content for: " + modelInitialState.toString()
							+ ".", e);
					return new ResponseEntity<Object>("Failed to complete JSON conversion of content.",
							HttpStatus.INTERNAL_SERVER_ERROR);
				}
			}
		}
		this.cachedModelMap.put(modelId, new ModelBiologicMap(modelBiologicMap));
		/*
		 * Determine if share information needs to be retrieved.
		 */
		if (tempModelId == null) {
			getShareInformation(userId, model, modelVersion, modelBiologicMap);
		}
		this.getLayoutInformation(model, modelBiologicMap);
		this.loadKBInformation(modelId, modelBiologicMap);
		modelBiologicMap.setPermissions(permissions);
		/*
		 * Retrieve experiments the user has access to.
		 */
		getVisibleExperiments(userId, model, modelVersion, modelBiologicMap);
		buildEnvironmentMap(userId, model, modelVersion, modelBiologicMap);
		final Map<Long, EntityMetadataValueJSON> metadataMap = new HashMap<>();
		this.buildMetadataValueMap(model.getId(), false, metadataMap);
		this.buildMetadataValueMap(model.getId(), true, metadataMap);
		modelBiologicMap.setMetadataValueMap(metadataMap);
		final Map<String, EntityMetadataRangeJSON> metadataRangeMap = new HashMap<>();
		this.buildMetadataRangeMap(modelId, false, metadataRangeMap);
		this.buildMetadataRangeMap(modelId, true, metadataRangeMap);
		modelBiologicMap.setMetadataRangeMap(metadataRangeMap);
		modelBiologicMap.setUploadMap(this.buildUploadMap(model.getId(), metadataMap, userId));
		buildComponentPairMap(modelBiologicMap);
		buildModelReferenceTypesMap(modelId, modelBiologicMap);
		modelBiologicMap.setScore(model.getScore());
		this.buildModelVersionMap(modelId, modelBiologicMap);
		modelInitialState = modelDao.getModelInitialState(model.getId());
		if (modelInitialState != null) {
			if (modelInitialState.getWorkspaceLayout() != null) {
				/*
				 * Convert the Workspace Layout JSON String to a JSON object.
				 */
				try {
					modelInitialState.setWorkspaceLayoutAsJSON(
							objectMapper.readValue(modelInitialState.getWorkspaceLayout(), Object.class));
				} catch (IOException e) {
					logger.error("Model retrieval failed for user: " + userId
							+ ". Failed to complete JSON conversion of workspaceLayout for: "
							+ modelInitialState.toString() + ".", e);
					return new ResponseEntity<Object>("Failed to complete JSON conversion of workspaceLayout.",
							HttpStatus.INTERNAL_SERVER_ERROR);
				}
			}
			if (modelInitialState.getSurvey() != null) {
				/*
				 * Convert the Survey JSON String to a JSON object.
				 */
				try {
					modelInitialState
							.setSurveyAsJSON(objectMapper.readValue(modelInitialState.getSurvey(), Object.class));
				} catch (IOException e) {
					logger.error("Model retrieval failed for user: " + userId
							+ ". Failed to complete JSON conversion of survey for: " + modelInitialState.toString()
							+ ".", e);
					return new ResponseEntity<Object>("Failed to complete JSON conversion of survey.",
							HttpStatus.INTERNAL_SERVER_ERROR);
				}
			}
			if (modelInitialState.getContent() != null) {
				/*
				 * Convert the Content JSON String to a JSON object.
				 */
				try {
					modelInitialState
							.setContentAsJSON(objectMapper.readValue(modelInitialState.getContent(), Object.class));
				} catch (IOException e) {
					logger.error("Model retrieval failed for user: " + userId
							+ ". Failed to complete JSON conversion of content for: " + modelInitialState.toString()
							+ ".", e);
					return new ResponseEntity<Object>("Failed to complete JSON conversion of content.",
							HttpStatus.INTERNAL_SERVER_ERROR);
				}
			}

		}
		if (modelInitialState != null) {
			modelBiologicMap.setModelInitialState(modelInitialState);
		}
		modelMap.put(String.format(ID_FORMAT, modelVersion.getId().getId(), modelVersion.getId().getVersion()),
				modelBiologicMap);

		logger.info("Successfully retrieved Model {} with version {} for user: {}.", id,
				modelVersion.getId().toString(), userId);
		timer.stop();
		this.performanceLogger.info("cc.application.main.controller.ModelController.getModel({}) finished in {} ms.",
				id, timer.getTime());

//		this.addCacheControlResponse(res);

		return new ResponseEntity<Object>(modelMap, HttpStatus.OK);
	}

	private void buildEnvironmentMap(final Long userId, final Model model, final ModelVersion modelVersion,
			final ModelBiologicMap modelBiologicMap) {
		if (userId == null) {
			return;
		}
		List<RealtimeEnvironment> realtimeEnvironments = experimentDao
				.getRealtimeEnvironmentsForModelAndUser(model.getId(), userId);
		if (CollectionUtils.isNotEmpty(realtimeEnvironments)) {
			final List<Long> environmentIds = new ArrayList<>(realtimeEnvironments.size());
			for (RealtimeEnvironment realtimeEnvironment : realtimeEnvironments) {
				modelBiologicMap.getRealtimeEnvironmentMap().put(realtimeEnvironment.getId(),
						new RealtimeEnvironmentJSON(realtimeEnvironment));
				environmentIds.add(realtimeEnvironment.getId());
			}
			List<RealtimeActivity> realtimeActivities = experimentDao
					.getRealtimeActivitiesByEnvironmentIds(environmentIds);
			for (RealtimeActivity realtimeActivity : realtimeActivities) {
				if (!modelBiologicMap.getSpeciesMap().containsKey(realtimeActivity.getComponentId())) {
					continue;
				}
				modelBiologicMap.getRealtimeActivityMap().put(realtimeActivity.getId(),
						new RealtimeActivityJSON(realtimeActivity));
			}
		}
		List<AnalysisEnvironment> analysisEnvironments = experimentDao
				.getAnalysisEnvironmentsForModelAndUser(model.getId(), userId);
		final List<Long> environmentIds = new ArrayList<>();
		if (CollectionUtils.isNotEmpty(analysisEnvironments)) {
			for (AnalysisEnvironment analysisEnvironment : analysisEnvironments) {
				modelBiologicMap.getAnalysisEnvironmentMap().put(analysisEnvironment.getId(),
						new AnalysisEnvironmentJSON(analysisEnvironment));
				environmentIds.add(analysisEnvironment.getId());
			}
		}
		/*
		 * Iterate through any Experiments and ensure that the necessary environment
		 * information has been or will be retrieved for them.
		 */
		if (MapUtils.isNotEmpty(modelBiologicMap.getExperimentMap())) {
			final List<Long> missingEnvironmentIds = new ArrayList<>();
			for (ExperimentMap experimentJSON : modelBiologicMap.getExperimentMap().values()) {
				if (experimentJSON.getEnvironmentId() != null
						&& !environmentIds.contains(experimentJSON.getEnvironmentId())) {
					missingEnvironmentIds.add(experimentJSON.getEnvironmentId());
				}
			}
			if (CollectionUtils.isNotEmpty(missingEnvironmentIds)) {
				for (Long id : missingEnvironmentIds) {
					final AnalysisEnvironment analysisEnvironment = experimentDao.getAnalysisEnvironmentById(id);
					if (analysisEnvironment != null) {
						modelBiologicMap.getAnalysisEnvironmentMap().put(analysisEnvironment.getId(),
								new AnalysisEnvironmentJSON(analysisEnvironment));
						environmentIds.add(analysisEnvironment.getId());
					}
				}
			}
		}

		if (CollectionUtils.isNotEmpty(environmentIds)) {
			List<AnalysisActivity> analysisActivities = experimentDao
					.getAnalysisActivitiesByEnvironmentIds(environmentIds);
			for (AnalysisActivity analysisActivity : analysisActivities) {
				if (!modelBiologicMap.getSpeciesMap().containsKey(analysisActivity.getComponentId())) {
					continue;
				}
				modelBiologicMap.getAnalysisActivityMap().put(analysisActivity.getId(),
						new AnalysisActivityJSON(analysisActivity));
			}
		}
	}

	private void buildModelVersionMap(final Long modelId, final ModelBiologicMap modelBiologicMap) {
		final Set<Long> modelIds = new HashSet<>(1, 1.0f);
		modelIds.add(modelId);

		final List<ModelVersion> availableModelVersions = modelVersionDao.getPossibleVersionsForModels(modelIds);
		if (CollectionUtils.isEmpty(availableModelVersions)) {
			return;
		}
		Map<Long, ModelVersionJSON> modelVersionMap = new HashMap<>(availableModelVersions.size(), 1.0f);
		for (ModelVersion modelVersion : availableModelVersions) {
			modelVersionMap.put(modelVersion.getId().getVersion(), new ModelVersionJSON(modelVersion));
		}
		modelBiologicMap.setModelVersionMap(modelVersionMap);
	}

	public void buildMetadataValueMap(final Long modelId, final boolean visibleAll,
			final Map<Long, EntityMetadataValueJSON> metadataMap) {
		if (this.modelEntityMetadataMap.containsKey(modelId) == false) {
			return;
		}
		// get the list of entity ids associated with the a particular model from the database
		List<Long> ids = metadataValueDao.getEntityIdsForModel(modelId, visibleAll);


		this.modelEntityMetadataMap.get(modelId).values().stream()
		 		.filter((m) -> (m.isVisibleAll() == visibleAll && m.isRange() == false && ids.contains(m.getId())))
				.forEach((m) -> metadataMap.put(m.getId(), new EntityMetadataValueJSON(m)));
	}

	public void buildMetadataRangeMap(final Long modelId, final boolean visibleAll,
			Map<String, EntityMetadataRangeJSON> metadataMap) {
		if (this.modelEntityMetadataMap.containsKey(modelId) == false) {
			return;
		}

		this.modelEntityMetadataMap.get(modelId).values().stream()
				.filter((m) -> (m.isVisibleAll() == visibleAll && m.isRange() == true))
				.forEach((m) -> metadataMap.put(new EntityMetadataRangeId(modelId, m.getId()).toJSIdentifier(),
						new EntityMetadataRangeJSON(m)));
	}

	public void buildComponentPairMap(final ModelBiologicMap modelBiologicMap) {
		if (MapUtils.isEmpty(modelBiologicMap.getSpeciesMap())) {
			return;
		}

		final List<ComponentPair> componentPairList = experimentDao
				.getComponentPairsForSpecies(modelBiologicMap.getSpeciesMap().keySet());
		modelBiologicMap.constructComponentPairMapping(componentPairList);
	}

	public void buildModelReferenceTypesMap(final Long modelId, final ModelBiologicMap modelBiologicMap) {
		final List<ModelReferenceTypes> modelReferenceTypesList = pageDao.getModelReferenceTypesForModel(modelId);
		modelBiologicMap.constructModelReferenceTypesMapping(modelReferenceTypesList);
	}

	public Map<Long, UploadJSON> buildUploadMap(final Long modelId, Map<Long, EntityMetadataValueJSON> metadataMap,
			final Long userId) {
		if (metadataMap.isEmpty()) {
			return null;
		}

		final Set<Long> attachmentDefinitionIds = LocalDefinitionCacheManager.getInstance()
				.getAttachmentDefinitionIds();
		if (attachmentDefinitionIds.isEmpty()) {
			return null;
		}

		Set<Long> uploadIds = new HashSet<>(metadataMap.size(), 1.0f);
		metadataMap.values().stream().filter((m) -> attachmentDefinitionIds.contains(m.getDefinitionId()))
				.forEach((m) -> uploadIds.add(getLongValue(m.getValue())));
		if (uploadIds.isEmpty()) {
			return null;
		}

		Map<Long, UploadJSON> uploadMap = new HashMap<>(uploadIds.size(), 1.0f);
		final Map<Long, UploadJSON> uploadJSONMap = LocalUploadCacheManager.getInstance().getAllUploads();
		for (Long uploadId : uploadIds) {
			UploadJSON retrieved = uploadJSONMap.get(uploadId);
			if (retrieved == null) {
				continue;
			}

			/*
			 * Build the upload access token.
			 */
			Map<String, Object> claims = new HashMap<>();
			// TODO: Create constants
			claims.put("USER", userId);
			claims.put("UPLOAD", uploadId);
			final String token = Jwts.builder().setClaims(claims).signWith(SignatureAlgorithm.HS512, DOWNLOAD_SECRET)
					.compact();

			UploadJSON tokenized = new UploadJSON(retrieved, token);
			uploadMap.put(uploadId, tokenized);
		}
		return uploadMap;
	}

	// TODO: relocate to Util or determine if Apache Commons provides support.
	private Long getLongValue(Object object) {
		if (object instanceof BigInteger) {
			return ((BigInteger) object).longValue();
		}

		return (Long) object;
	}

	private Map<Long, ExperimentMap> buildExperimentMap(List<Experiment> experiments,
			final ModelBiologicMap modelBiologicMap) {
		if (experiments.isEmpty()) {
			return Collections.emptyMap();
		}

		Map<Long, ExperimentMap> experimentMap = new HashMap<>(experiments.size(), 1.0f);
		Map<Long, CalcIntervalJSON> calcIntervalMap = new HashMap<>();
		for (Experiment experiment : experiments) {
			ExperimentMap experimentJSON = new ExperimentMap(experiment);
			if (experimentJSON.isBits()) {
				/*
				 * Determine if there are actually any bits files available to download.
				 */
				final Path experimentBitsPath = this.dynamicSimulationManager.getExperimentBitsPath(experiment.getId());
				if (Files.exists(experimentBitsPath)) {
					boolean bitsAvailable = false;
					try (DirectoryStream<Path> bitsDirectoryStream = Files.newDirectoryStream(experimentBitsPath)) {
						if (bitsDirectoryStream.iterator().hasNext()) {
							bitsAvailable = true;
						}
					} catch (IOException e) {
						logger.error("Failed to determine if bits were available for: " + experiment.toString() + ".",
								e);
					}
					experimentJSON.setBitsAvailable(bitsAvailable);
				}
				experimentJSON.setBitsAvailable(Files.exists(experimentBitsPath));
			}
			experimentMap.put(experiment.getId(), experimentJSON);
			if (CollectionUtils.isNotEmpty(experiment.getCalcIntervals())) {
				for (CalcInterval calcInterval : experiment.getCalcIntervals()) {
					calcIntervalMap.put(calcInterval.getId(), new CalcIntervalJSON(calcInterval));
				}
			}
		}

		modelBiologicMap.setCalcIntervalMap(calcIntervalMap);
		return experimentMap;
	}

	private ResponseEntity<Object> checkUpdateModelInitialState(final ModelPermissions permissions,
			final ModelBiologic modelBiologic, final ModelBiologicMap modelBiologicMap, final long modelId,
			final String operationIdentifier) {
		/*
		 * Determine if the default initial state has changed.
		 */
		if (modelBiologicMap.getModelInitialState() != null) {
			/*
			 * TODO: fix. But, for now permissions will only be NULL when the model access
			 * has already been validated.
			 */
			if (permissions != null && !permissions.isEdit() ) {
				return new ResponseEntity<Object>(
						"User does not have required permission to edit model: " + modelId + ".", HttpStatus.FORBIDDEN);
			}
			/*
			 * Determine if an initial state needs to be updated or created.
			 */
			ModelInitialState modelInitialState = modelDao.getModelInitialState(modelId);
			if (modelInitialState == null) {
				modelInitialState = modelBiologicMap.getModelInitialState();
				if (modelInitialState.getSurveyAsJSON() != null) {
					try {
						modelInitialState
								.setSurvey(objectMapper.writeValueAsString(modelInitialState.getSurveyAsJSON()));
					} catch (JsonProcessingException e) {
						logger.error("JSON String conversion of the survey field has failed for model: " + modelId
								+ " (Trx Id: " + operationIdentifier + ").", e);
						return new ResponseEntity<Object>("Failed to convert survey JSON to a JSON String for model: "
								+ modelId + ". Please refer to the logs for additional information. Reference Trx Id: "
								+ operationIdentifier + ".", HttpStatus.BAD_REQUEST);
					}
				}
				if (modelInitialState.getWorkspaceLayoutAsJSON() != null) {
					try {
						modelInitialState.setWorkspaceLayout(
								objectMapper.writeValueAsString(modelInitialState.getWorkspaceLayoutAsJSON()));
					} catch (JsonProcessingException e) {
						logger.error("JSON String conversion of the workspaceLayout field has failed for model: "
								+ modelId + " (Trx Id: " + operationIdentifier + ").", e);
						return new ResponseEntity<Object>(
								"Failed to convert workspaceLayout JSON to a JSON String for model: " + modelId
										+ ". Please refer to the logs for additional information. Reference Trx Id: "
										+ operationIdentifier + ".",
								HttpStatus.BAD_REQUEST);
					}
				}
				if (modelInitialState.getContentAsJSON() != null) {
					try {
						modelInitialState
								.setContent(objectMapper.writeValueAsString(modelInitialState.getContentAsJSON()));
					} catch (JsonProcessingException e) {
						logger.error("JSON String conversion of the content field has failed for model: " + modelId
								+ " (Trx Id: " + operationIdentifier + ").", e);
						return new ResponseEntity<Object>("Failed to convert content JSON to a JSON String for model: "
								+ modelId + ". Please refer to the logs for additional information. Reference Trx Id: "
								+ operationIdentifier + ".", HttpStatus.BAD_REQUEST);
					}
				}
			} else {
				final Long initialStateId = modelBiologicMap.getModelInitialState().getInitialStateId();
				final Long layoutId = modelBiologicMap.getModelInitialState().getLayoutId();
				final Object workspaceLayout = modelBiologicMap.getModelInitialState().getWorkspaceLayoutAsJSON();
				final Object survey = modelBiologicMap.getModelInitialState().getSurveyAsJSON();
				final Object content = modelBiologicMap.getModelInitialState().getContentAsJSON();

				if (initialStateId != null
						|| modelBiologicMap.wasSetNull(ModelBiologicMap.NullableFields.INITIAL_STATE_ID)) {
					modelInitialState.setInitialStateId(initialStateId);
				}
				if (layoutId != null || modelBiologicMap.wasSetNull(ModelBiologicMap.NullableFields.LAYOUT_ID)) {
					modelInitialState.setLayoutId(layoutId);
				}
				if (workspaceLayout != null
						|| modelBiologicMap.wasSetNull(ModelBiologicMap.NullableFields.WORKSPACE_LAYOUT)) {
					try {
						if (workspaceLayout == null) {
							modelInitialState.setWorkspaceLayout(null);
						} else {
							modelInitialState.setWorkspaceLayout(objectMapper.writeValueAsString(workspaceLayout));
						}
					} catch (JsonProcessingException e) {
						logger.error("JSON String conversion of the workspaceLayout field has failed for model: "
								+ modelId + " (Trx Id: " + operationIdentifier + ").", e);
						return new ResponseEntity<Object>(
								"Failed to convert workspaceLayout JSON to a JSON String for model: " + modelId
										+ ". Please refer to the logs for additional information. Reference Trx Id: "
										+ operationIdentifier + ".",
								HttpStatus.BAD_REQUEST);
					}
				}
				if (survey != null || modelBiologicMap.wasSetNull(ModelBiologicMap.NullableFields.SURVEY)) {
					try {
						if (survey == null) {
							modelInitialState.setSurvey(null);
						} else {
							modelInitialState.setSurvey(objectMapper.writeValueAsString(survey));
						}
					} catch (JsonProcessingException e) {
						logger.error("JSON String conversion of the survey field has failed for model: " + modelId
								+ " (Trx Id: " + operationIdentifier + ").", e);
						return new ResponseEntity<Object>("Failed to convert survey JSON to a JSON String for model: "
								+ modelId + ". Please refer to the logs for additional information. Reference Trx Id: "
								+ operationIdentifier + ".", HttpStatus.BAD_REQUEST);
					}
				}
				if (content != null || modelBiologicMap.wasSetNull(ModelBiologicMap.NullableFields.CONTENT)) {
					try {
						if (content == null) {
							modelInitialState.setContent(null);
						} else {
							modelInitialState.setContent(objectMapper.writeValueAsString(content));
						}
					} catch (JsonProcessingException e) {
						logger.error("JSON String conversion of the content field has failed for model: " + modelId
								+ " (Trx Id: " + operationIdentifier + ").", e);
						return new ResponseEntity<Object>("Failed to convert content JSON to a JSON String for model: "
								+ modelId + ". Please refer to the logs for additional information. Reference Trx Id: "
								+ operationIdentifier + ".", HttpStatus.BAD_REQUEST);
					}
				}
			}
			modelBiologic.setModelInitialState(modelInitialState);
		}

		return null;
	}

	@RequestMapping(value = "/save", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
	public @ResponseBody ResponseEntity<Object> saveModel(@RequestBody Map<String, ModelBiologicMap> modelMap,
			ServletRequest request) {
		/*
		 * Determine if which user is editing the specified {@link Model}s.
		 */
		final Long userId = this.getAuthenticatedUserId();
		final Domain domain = this.getOrigin(request, userId);
		final StopWatch timer = new StopWatch();
		timer.start();
		final long beforeDaoStart = System.currentTimeMillis();

		final String operationIdentifier = UUID.randomUUID().toString().toUpperCase();

		if (userId == null) {
			return new ResponseEntity<Object>("You must be authenticated to save Models", HttpStatus.UNAUTHORIZED);
		}

		logger.info("Saving Model(s) for user: {} (Trx Id: {}) ...", userId, operationIdentifier);

		List<ModelBiologic> modelBiologicList = new ArrayList<>(modelMap.size());
		Map<String, ModelMappedData> modelMappedDataMap = new HashMap<>(modelMap.size(), 1.0f);
		Map<String, ModelMetadata> modelMetadataMap = new HashMap<>(modelMap.size(), 1.0f);
		Map<String, ExperimentSettingsData> experimentDataMap = new HashMap<>(modelMap.size(), 1.0f);
		Map<Long, Long> masterIdToLatestVersionMap = new HashMap<>();
		final Map<Integer, Long> idToTemporaryVersionMap = new HashMap<>();

		for (String key : modelMap.keySet()) {
			String[] splitKey = key.split("/");
			Integer modelId = NumberUtils.toInt(splitKey[0]);
			Long currentVersion = NumberUtils.toLong(splitKey[1]);
			boolean newVersionOfModel = false;
			if (modelId.longValue() > 0 && currentVersion.longValue() > 0) {
				/*
				 * Get the actual model id associated with the version.
				 */
				final ModelVersionId modelVersionId = new ModelVersionId(modelId.longValue(),
						currentVersion.longValue());
				final ModelVersion modelVersion = modelVersionDao.getById(modelVersionId);
				if (modelVersion == null) {
					return new ResponseEntity<Object>("Failed to find version information for Model: " + modelId + ".",
							HttpStatus.INTERNAL_SERVER_ERROR);
				}
				/*
				 * Based on the version, this is the actual Model that we will want to update.
				 */
				modelId = modelVersion.getModelId().intValue();
			} else if (modelId.longValue() > 0 && currentVersion.longValue() <= 0) {
				/*
				 * Creating a new version of an existing Model.
				 */
				newVersionOfModel = true;
			}
			final ModelBiologicMap modelBiologicMap = modelMap.get(key);

			ModelBiologic modelBiologic = null;
			ModelPermissions permissions = null;
			if (modelBiologicMap == null) {
				modelBiologic = new ModelBiologic();
				/*
				 * The {@link Model} has been deleted.
				 */
				if (modelId > 0) {
					/*
					 * Retrieve the {@link Model} to delete.
					 */
					Model model = this.modelDao.getModel(modelId);
					if (model == null) {
						return new ResponseEntity<Object>("Model: " + modelId + " does not exist.",
								HttpStatus.NOT_FOUND);
					}
					final ModelVersion modelVersion = modelVersionDao.getVersionIdForModel(model.getId());
					if (modelVersion == null) {
						return new ResponseEntity<Object>(
								"Failed to find version information for Model: " + modelId + ".",
								HttpStatus.INTERNAL_SERVER_ERROR);
					}
					/*
					 * Verify that the user has permission to delete the {@link Model}.
					 */
					permissions = this.determineModelPermissions(model, modelVersion, userId, null);
					if (permissions.isDelete() == false) {
						return new ResponseEntity<Object>(
								"User does not have required permission to delete model: " + modelId + ".",
								HttpStatus.FORBIDDEN);
					}
					modelBiologic.setModelId(modelId);
					modelBiologic.setKey(key);
					modelBiologic.setModel(model);
					modelBiologic.delete();
					modelBiologicList.add(modelBiologic);
					modelMappedDataMap.put(key, new ModelMappedData(modelId));
					modelMetadataMap.put(key, new ModelMetadata(modelId));
					experimentDataMap.put(key, new ExperimentSettingsData());
				}

				continue;
			}

			/*
			 * Experiments only matters when the user in not logged in.
			 */
			if (modelBiologicMap.experimentsOnly(modelId.longValue())) {
				/*
				 * Only {@link Experiment}s need to be saved for this {@link Model}.
				 */
				Model model = this.modelDao.getModel(modelId);
				if (model == null) {
					return new ResponseEntity<Object>("Model: " + modelId + " does not exist.", HttpStatus.NOT_FOUND);
				}
				ModelVersion modelVersion = modelVersionDao.getVersionIdForModel(model.getId());
				if (modelVersion == null) {
					return new ResponseEntity<Object>(
							"Failed to find version information for Model: " + model.getId() + ".",
							HttpStatus.INTERNAL_SERVER_ERROR);
				}
				permissions = this.determineModelPermissions(model, modelVersion, userId, null);
				if (permissions.isView() == false) {
					return new ResponseEntity<Object>(
							"User does not have required permission to create experiment(s) for model: " + modelId
									+ ".",
							HttpStatus.FORBIDDEN);
				}

				modelBiologic = new ModelBiologic();
				ResponseEntity<Object> potentialResponse = checkUpdateModelInitialState(permissions, modelBiologic,
						modelBiologicMap, modelId, operationIdentifier);
				if (potentialResponse != null) {
					return potentialResponse;
				}

				modelBiologic.setModelId((int) model.getId());
				modelBiologic.setKey(key);
				modelBiologic.setModel(model);
				ModelMappedData modelMappedData = new ModelMappedData(modelBiologic.getModelId());
				ModelMetadata modelMetadata = new ModelMetadata(modelBiologic.getModelId());
				ExperimentSettingsData experimentSettingsData = null;
				try {
					this.prepareExperiments(modelBiologicMap, modelBiologic, modelMappedData, userId);
					experimentSettingsData = this.constructExperimentSettingsData(modelBiologicMap, modelBiologic,
							userId);
				} catch (EntityNotFoundException e) {
					logger.error("Unable to save Model: " + modelId + "!", e);
					return new ResponseEntity<Object>(e.getMessage(), HttpStatus.NOT_FOUND);
				} catch (ModelAccessDeniedException e) {
					logger.error("Unable to save Model: " + modelId + "!", e);
					return new ResponseEntity<Object>(e.getMessage(), HttpStatus.FORBIDDEN);
				} catch (Exception e) {
					logger.error("Unable to save Model: " + modelId + "!", e);
					return new ResponseEntity<Object>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
				}

				modelBiologic.setModelVersion(modelVersion);
				modelBiologicList.add(modelBiologic);
				modelMappedDataMap.put(key, modelMappedData);
				modelMetadataMap.put(key, modelMetadata);
				experimentDataMap.put(key, experimentSettingsData);

				continue;
			}

			try {
				modelBiologic = this.constructModelBiologic(modelBiologicMap, modelId, userId, newVersionOfModel);
				modelBiologic.setKey(key);
				ModelVersion modelVersion = null;
				if (modelBiologic.getModelId() <= 0) {
					/*
					 * New {@link Model} that does not have an id yet.
					 */
					modelBiologic.setModelId(modelId);

					ModelVersionId modelVersionId = new ModelVersionId();
					modelVersion = new ModelVersion();
					modelVersion.setId(modelVersionId);
					if (idToTemporaryVersionMap.containsKey(modelId)) {
						final long newVersion = idToTemporaryVersionMap.get(modelId) + 1;
						modelVersion.getId().setVersion(newVersion);
						idToTemporaryVersionMap.put(modelId, newVersion);
					}
					modelVersion.setUserId(userId);

					idToTemporaryVersionMap.put(modelId, modelVersionId.getVersion());
				} else {
					/*
					 * Retrieve the associated {@link ModelVersion}.
					 */
					if (currentVersion.longValue() < 0) {
						/*
						 * Is this a new version of an existing Model?
						 */
						ModelVersion existingModelVersion = modelVersionDao
								.getVersionIdForModel((long) modelBiologic.getModelId());
						if (existingModelVersion == null) {
							return new ResponseEntity<Object>(
									"Failed to find version information for Model: " + modelBiologic.getModelId() + ".",
									HttpStatus.INTERNAL_SERVER_ERROR);
						}
						existingModelVersion = modelVersionDao
								.getLatestVersionForVersionId(existingModelVersion.getId().getId());
						Long lastestVersionForModel = masterIdToLatestVersionMap
								.get(existingModelVersion.getId().getId());
						if (lastestVersionForModel == null) {
							lastestVersionForModel = existingModelVersion.getId().getVersion();
						}
						++lastestVersionForModel;
						masterIdToLatestVersionMap.put(existingModelVersion.getId().getId(), lastestVersionForModel);
						final long newVersion = lastestVersionForModel;
						ModelVersionId modelVersionId = new ModelVersionId(existingModelVersion.getId().getId(),
								newVersion);
						modelVersion = new ModelVersion();
						modelVersion.setId(modelVersionId);
						modelVersion.setUserId(userId);
						/*
						 * Ensure that a brand new model is created.
						 */
						modelBiologic.setModel(new Model(modelBiologic.getModel()));
						modelBiologic.getModel().setId(0);
						modelBiologic.getModel().setCreationDate(null);
						modelBiologic.getModel().setUpdateDate(null);
						modelBiologic.getModel().setOriginId(null);
						modelBiologic.getModel().setUserId(modelBiologicMap.getUserId());
						modelBiologic.setModelId(0);
					} else {
						modelVersion = modelVersionDao.getVersionIdForModel(modelId.longValue());
						if (modelVersion == null) {
							return new ResponseEntity<Object>(
									"Failed to find version information for Model: " + modelId + ".",
									HttpStatus.INTERNAL_SERVER_ERROR);
						}
					}
				}

				if (MapUtils.isNotEmpty(modelBiologicMap.getModelVersionMap())) {
					/*
					 * Determine if the associated {@link ModelVersion} is present in the {@link
					 * Map}.
					 */
					final Map<Long, ModelVersionJSON> modelVersionMap = modelBiologicMap.getModelVersionMap();
					if (currentVersion != null && modelVersionMap.containsKey(currentVersion)) {
						ModelVersionJSON updateVersionJSON = modelVersionMap.remove(currentVersion);
						if (updateVersionJSON.getName() != null
								|| updateVersionJSON.wasSetNull(ModelVersionJSON.NullableFields.NAME)) {
							modelVersion.setName(updateVersionJSON.getName());
						}
						if (updateVersionJSON.getDescription() != null
								|| updateVersionJSON.wasSetNull(ModelVersionJSON.NullableFields.DESCRIPTION)) {
							modelVersion.setDescription(updateVersionJSON.getDescription());
						}
						if (updateVersionJSON.isSelected() != null) {
							modelVersion.setSelected(updateVersionJSON.isSelected());
							if (Boolean.TRUE.equals(modelVersion.isSelected())) {
								/*
								 * Determine if there are any Model Version entities that need to be updated to
								 * not be the default selection.
								 */
								final List<ModelVersion> selectedModelVersions = modelVersionDao
										.getSelectedModelVersions(modelVersion.getId().getId());
								if (CollectionUtils.isNotEmpty(selectedModelVersions)) {
									for (ModelVersion selectedModelVersion : selectedModelVersions) {
										selectedModelVersion.setSelected(Boolean.FALSE);
										modelBiologic.getModelVersionsToPersist()
												.put(selectedModelVersion.getId().getVersion(), selectedModelVersion);
									}
								}
							}
						}

						modelBiologic.getModelVersionsToPersist().put(currentVersion, modelVersion);
					}

					/*
					 * Are there any additional {@link ModelVersion}s referenced?
					 */
					if (MapUtils.isNotEmpty(modelVersionMap)) {
						for (Long version : modelVersionMap.keySet()) {
							ModelVersionJSON updateVersionJSON = modelVersionMap.get(version);
							ModelVersionId modelVersionId = new ModelVersionId(modelVersion.getId().getId(), version);
							if (updateVersionJSON == null) {
								/*
								 * Delete this {@link ModelVersion}.
								 */
								ModelVersion deleteVersion = modelVersionDao.getById(modelVersionId);
								if (deleteVersion != null) {
									modelBiologic.getModelVersionsToDelete().put(version, deleteVersion);
									modelBiologic.getModelVersionsToPersist().remove(version);
								}
							} else {
								/*
								 * Update this {@link ModelVersion}.
								 */
								ModelVersion updateVersion = modelBiologic.getModelVersionsToPersist().get(version);
								if (updateVersion == null) {
									updateVersion = modelVersionDao.getById(modelVersionId);
								}
								if (updateVersion != null) {
									if (updateVersionJSON.getDescription() != null || updateVersionJSON
											.wasSetNull(ModelVersionJSON.NullableFields.DESCRIPTION)) {
										updateVersion.setDescription(updateVersionJSON.getDescription());
									}
									modelBiologic.getModelVersionsToPersist().put(version, updateVersion);
								}
							}
						}
					}
				}

				modelBiologic.setModelVersion(modelVersion);

				modelMappedDataMap.put(key, this.constructModelMappedData(modelBiologicMap, modelBiologic, userId,
						domain, modelVersion.getId().getId()));
				modelMetadataMap.put(key, this.constructModelMetadata(modelBiologicMap, modelBiologic, userId));
				experimentDataMap.put(key,
						this.constructExperimentSettingsData(modelBiologicMap, modelBiologic, userId));
				ResponseEntity<Object> potentialResponse = checkUpdateModelInitialState(permissions, modelBiologic,
						modelBiologicMap, modelId, operationIdentifier);
				if (potentialResponse != null) {
					return potentialResponse;
				}
			} catch (EntityNotFoundException e) {
				logger.error("Unable to save Model: " + modelId + "!", e);
				return new ResponseEntity<Object>(e.getMessage(), HttpStatus.NOT_FOUND);
			} catch (InvalidMetadataValue e) {
				logger.error("Unable to save Model: " + modelId + "!", e);
				return new ResponseEntity<Object>(e.getMessage(), HttpStatus.NOT_ACCEPTABLE);
			} catch (ModelAccessDeniedException e) {
				logger.error("Unable to save Model: " + modelId + "!", e);
				return new ResponseEntity<Object>(e.getMessage(), HttpStatus.FORBIDDEN);
			} catch (Exception e) {
				logger.error("Unable to save Model: " + modelId + "!", e);
				return new ResponseEntity<Object>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
			}

			ModelChangeset modelChangeset = null;
			FilteredModelChangesetMap filteredModelBiologicMap = new FilteredModelChangesetMap(modelBiologicMap);
			if (filteredModelBiologicMap.validModelChangeset()) {
				String json = null;
				try {
					json = objectMapper.writeValueAsString(filteredModelBiologicMap);
				} catch (JsonProcessingException e) {
					logger.error("Failed to convert model edit(s) to a changeset for Model: " + modelId + ".", e);
					return new ResponseEntity<Object>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
				}

				modelChangeset = new ModelChangeset();
				modelChangeset.setUserId(userId);
				if (modelId.intValue() <= 0) {
					modelChangeset.setDescription(ModelChangeset.DESCRIPTION_INITIAL_CREATION);
				}
				modelChangeset.setChangeset(json);
				modelBiologic.setChangeset(modelChangeset);
			}

			Calendar updateDate = Calendar.getInstance();
			if (filteredModelBiologicMap.containsBiologicChanges()) {
				modelBiologic.getModel().setBiologicUpdateDate(updateDate);
			}
			if (filteredModelBiologicMap.containsKnowledgeBaseChanges()) {
				modelBiologic.getModel().setKnowledgeBaseUpdateDate(updateDate);
			}

			modelBiologicList.add(modelBiologic);
		}

		fixForwardLinkedLearningActivityGroups(modelMap, modelBiologicList, modelMappedDataMap);

		IdReturnValue idReturnValue = null;
		Map<String, ModelBiologicIdMap> idMap = null;
		try {
			performanceLogger.info("Before modelBiologicDao save took: {}ms",
					(System.currentTimeMillis() - beforeDaoStart));
			final long saveStart = System.currentTimeMillis();
			idReturnValue = this.modelBiologicDao.saveModelBiologic(modelBiologicList, modelMappedDataMap,
					modelMetadataMap, experimentDataMap, operationIdentifier);
			idMap = idReturnValue.getIdMap();
			performanceLogger.info("modelBiologicDao save took: {}ms", (System.currentTimeMillis() - saveStart));
		} catch (Exception e) {
			logger.error("Failed to save Model(s) for user: " + userId + "!", e);
			return new ResponseEntity<Object>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
		}
		logger.info("Successfully saved Model(s) for user: {} (Trx Id: {}).", userId, operationIdentifier);
		for (ModelBiologic modelBiologic : modelBiologicList) {
			if (modelBiologic.getModelId() > 0 && modelBiologic.getModelVersion() != null) {
				if (this.cachedModelMap.remove(new Long(modelBiologic.getModelVersion().getModelId())) != null) {
					logger.info("Removed updated Model with id: {}: version: {} from the cache.",
							modelBiologic.getModelId(), modelBiologic.getModelVersion().getId().toString());
				}
			}
		}
		if (MapUtils.isNotEmpty(modelMappedDataMap)) {
			for (String key : modelMappedDataMap.keySet()) {
				ModelMappedData modelMappedData = modelMappedDataMap.get(key);
				if (MapUtils.isNotEmpty(modelMappedData.getPages())) {
					for (Number pageId : modelMappedData.getPages().keySet()) {
						if (pageId.longValue() > 0) {
							logger.info("Removed updated Knowledge Base Page with id: {} from cache.",
									pageId.longValue());
							this.cachedPageMap.remove(pageId.longValue());
						}
					}
				}
				if (CollectionUtils.isEmpty(modelMappedData.getPagesToDelete()) == false) {
					for (Page page : modelMappedData.getPagesToDelete()) {
						logger.info("Removed deleted Knowledge Base Page with id: {} from cache.", page.getId());
						this.cachedPageMap.remove(page.getId());
					}
				}
			}
		}
		if (MapUtils.isNotEmpty(modelMetadataMap)) {
			for (String key : modelMetadataMap.keySet()) {
				ModelMetadata modelMetadata = modelMetadataMap.get(key);

				final long modelId = (modelMetadata.getModelId().longValue() <= 0)
						? idMap.get(key).getId()
						: modelMetadata.getModelId().longValue();

				this.modelEntityMetadataMap.putIfAbsent(modelId, new HashMap<>());

				final Set<Long> saveValuesFilter;
				final Set<Long> deleteValuesFilter;

				if (MapUtils.isNotEmpty(modelMetadata.getValuesToDelete())) {
					modelMetadata.getValuesToDelete().keySet().stream()
							.forEach((m) -> this.modelEntityMetadataMap.get(modelId).remove(m));
					deleteValuesFilter = new HashSet<>(modelMetadata.getValuesToDelete().size(), 1.0f);
					modelMetadata.getValuesToDelete().values().forEach((v) -> deleteValuesFilter.add(v.getId()));
				} else {
					deleteValuesFilter = Collections.emptySet();
				}

				if (CollectionUtils.isNotEmpty(modelMetadata.getEntityValuesToDelete())) {
					modelMetadata.getEntityValuesToDelete().stream()
							.filter((m) -> deleteValuesFilter.contains(m.getId().getValue_id()) == false)
							.forEach((m) -> this.modelEntityMetadataMap.get(modelId).remove(m.getId().getValue_id()));
				}

				if (MapUtils.isNotEmpty(modelMetadata.getValuesToSave())) {
					saveValuesFilter = new HashSet<>(modelMetadata.getValuesToSave().size(), 1.0f);
					for (Value value : modelMetadata.getValuesToSave().values()) {
						this.modelEntityMetadataMap.get(modelId).put(value.getId(), new EntityMetadataValue(value));
						saveValuesFilter.add(value.getId());
					}
					modelMetadata.getValuesToSave().values().stream().forEach(
							(m) -> this.modelEntityMetadataMap.get(modelId).put(m.getId(), new EntityMetadataValue(m)));
				} else {
					saveValuesFilter = Collections.emptySet();
				}

				if (CollectionUtils.isNotEmpty(modelMetadata.getEntityValuesToSave())) {
					modelMetadata.getEntityValuesToSave().stream()
							.filter((m) -> saveValuesFilter.contains(m.getId().getValue_id()) == false)
							.forEach((m) -> this.modelEntityMetadataMap.get(modelId).put(m.getId().getValue_id(),
									new EntityMetadataValue(m)));
				}
			}
		}

		timer.stop();
		this.performanceLogger.info(
				"cc.application.main.controller.ModelController.saveModel(Map<Integer, ModelBiologicMap>) finished in {} ms.",
				timer.getTime());

		if (idMap != null) {
			try {
				String json = objectMapper.writeValueAsString(idMap);
				jsonResponseLogger.info("Returning JSON response: {} to user: {}", json, userId);
			} catch (JsonProcessingException e) {
				jsonResponseLogger
						.error("Failed to log the JSON response that will be returned to user: " + userId + "!", e);
			}
		}

		return new ResponseEntity<Object>(idMap, HttpStatus.OK);
	}

	private ModelMetadata constructModelMetadata(final ModelBiologicMap modelBiologicMap,
			final ModelBiologic modelBiologic, final Long userId) throws Exception {
		final long modelId = modelBiologic.getModelId();
		ModelMetadata modelMetadata = new ModelMetadata(modelId);

		if (MapUtils.isNotEmpty(modelBiologicMap.getMetadataValueMap())) {
			final List<Long> ids = new ArrayList<>(modelBiologicMap.getMetadataValueMap().keySet().size());
			modelBiologicMap.getMetadataValueMap().keySet().stream().filter((i) -> i > 0).forEach((i) -> ids.add(i));
			List<Value> retrievedValues = this.metadataValueDao.getValuesForIds(ids);
			final Map<Long, Value> retrievedValuesMap;
			if (CollectionUtils.isNotEmpty(retrievedValues)) {
				retrievedValuesMap = new HashMap<>(retrievedValues.size(), 1.0f);
				retrievedValues.stream().forEach((v) -> retrievedValuesMap.put(v.getId(), v));
			} else {
				retrievedValuesMap = Collections.emptyMap();
			}

			for (Long id : modelBiologicMap.getMetadataValueMap().keySet()) {
				EntityMetadataValueJSON data = modelBiologicMap.getMetadataValueMap().get(id);
				if (data == null) {
					if (id > 0) {
						Value value = retrievedValuesMap.get(id);
						if (value == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_METADATA_VALUE, id);
						}
						modelMetadata.addValueToDelete(id, value);
					}
				} else {
					Value value = null;
					if (id > 0) {
						value = retrievedValuesMap.get(id);
						if (value == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_METADATA_VALUE, id);
						}
						AbstractSetValue<?> setValue = this.metadataValueDao.getSetValue(value);
						if (setValue == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_METADATA_VALUE, id);
						}
						setValue = this.updateSetValue(setValue, data.getValue());
						if (setValue == null) {
							throw new InvalidMetadataValue(value.getDefinition());
						}
						value.setSetValue(setValue);
					} else {
						Definition definition = LocalDefinitionCacheManager.getInstance()
								.getDefinition(data.getDefinitionId());
						if (definition == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_DEFINITION,
									data.getDefinitionId());
						}
						AbstractSetValue<?> setValue = this.getSetValue(data.getValue(), definition);
						if (setValue == null) {
							throw new InvalidMetadataValue(definition);
						}
						value = new Value();
						value.setDefinition(definition);

						value.setSetValue(setValue);
						modelMetadata.addEntityValueToSave(new EntityValue(modelId, id));
					}
					if (data.getPosition() != null) {
						value.setPosition(data.getPosition());
					}

					modelMetadata.addValueToSave(id, value);
				}
			}
		}
		if (MapUtils.isNotEmpty(modelBiologicMap.getMetadataRangeMap())) {
			final Map<EntityValueId, EntityValue> retrievedEntityValuesMap;
			if (modelId > 0) {
				final List<EntityValueId> ids = new ArrayList<>(modelBiologicMap.getMetadataRangeMap().keySet().size());
				modelBiologicMap.getMetadataRangeMap().keySet().stream()
						.filter((k) -> k != null && k.startsWith(NEGATIVE_SYMBOL) == false)
						.forEach((k) -> ids.add(new EntityValueId(modelId, new EntityMetadataRangeId(k).getValueId())));
				if (ids.isEmpty()) {
					retrievedEntityValuesMap = Collections.emptyMap();
				} else {
					retrievedEntityValuesMap = new HashMap<>(ids.size(), 1.0f);
					List<EntityValue> retrievedEntityValues = this.metadataValueDao.getEntityValuesForIds(ids);
					retrievedEntityValues.forEach((ev) -> retrievedEntityValuesMap.put(ev.getId(), ev));
				}
			} else {
				retrievedEntityValuesMap = Collections.emptyMap();
			}
			for (String id : modelBiologicMap.getMetadataRangeMap().keySet()) {
				EntityMetadataRangeJSON data = modelBiologicMap.getMetadataRangeMap().get(id);
				if (data == null) {
					if (id.startsWith(NEGATIVE_SYMBOL) || modelId <= 0) {
						continue;
					}
					EntityMetadataRangeId jsId = new EntityMetadataRangeId(id);

					EntityValue entityValue = retrievedEntityValuesMap
							.get(new EntityValueId(modelId, jsId.getValueId()));
					if (entityValue == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_METADATA_RANGE,
								jsId.getValueId());
					}
					modelMetadata.addEntityValueToDelete(entityValue);
				} else {
					Definition definition = LocalDefinitionCacheManager.getInstance()
							.getDefinition(data.getDefinitionId());
					if (definition == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_DEFINITION,
								data.getDefinitionId());
					}

					Number jsId = NumberUtils.createNumber(id);
					modelMetadata.addEntityValueToSave(
							new EntityValue(modelId, data.getValueId(), definition, jsId.intValue()));
				}
			}
		}

		return modelMetadata;
	}

	private AbstractSetValue<?> getSetValue(final Object object, final Definition definition) throws Exception {
		if (definition.getType() == ValueType.Integer && object instanceof Integer) {
			IntegerValue value = new IntegerValue();
			value.setValue((Integer) object);
			return value;
		} else if (definition.getType() == ValueType.Decimal && object instanceof Number) {
			Number number = (Number) object;
			DecimalValue value = new DecimalValue();
			value.setValue(number.doubleValue());
			return value;
		} else if (definition.getType() == ValueType.Text && object instanceof String) {
			TextValue value = new TextValue();
			value.setValue((String) object);
			return value;
		} else if (definition.getType() == ValueType.Bool && object instanceof Boolean) {
			BoolValue value = new BoolValue();
			value.setValue((Boolean) object);
			return value;
		} else if (definition.getType() == ValueType.Date && object instanceof String) {

		} else if (definition.getType() == ValueType.Attachment && object instanceof String) {
			final String idString = (String) object;
			Long attachmentId = null;
			try {
				attachmentId = Long.valueOf(idString);
			} catch (NumberFormatException e) {
				return null;
			}

			AttachmentValue value = new AttachmentValue();
			if (LocalUploadCacheManager.getInstance().uploadExists(attachmentId.longValue()) == false) {
				throw new EntityNotFoundException(EntityNotFoundException.ENTITY_UPLOAD, attachmentId.longValue());
			}
			value.setValue(attachmentId.longValue());
			return value;
		}

		return null;
	}

	private AbstractSetValue<?> updateSetValue(final AbstractSetValue<?> currentSetValue, final Object object)
			throws Exception {
		if (currentSetValue instanceof IntegerValue && object instanceof Integer) {
			((IntegerValue) currentSetValue).setValue((Integer) object);
			return currentSetValue;
		}
		if (currentSetValue instanceof DecimalValue && object instanceof Number) {
			Number number = (Number) object;
			((DecimalValue) currentSetValue).setValue(number.doubleValue());
			return currentSetValue;
		}
		if (currentSetValue instanceof TextValue && object instanceof String) {
			((TextValue) currentSetValue).setValue((String) object);
			return currentSetValue;
		}
		if (currentSetValue instanceof BoolValue && object instanceof Boolean) {
			((BoolValue) currentSetValue).setValue((Boolean) object);
			return currentSetValue;
		}
		if (currentSetValue instanceof AttachmentValue && object instanceof String) {
			final String idString = (String) object;
			Long attachmentId = null;
			try {
				attachmentId = Long.valueOf(idString);
			} catch (NumberFormatException e) {
				return null;
			}

			if (LocalUploadCacheManager.getInstance().uploadExists(attachmentId.longValue()) == false) {
				throw new EntityNotFoundException(EntityNotFoundException.ENTITY_UPLOAD, attachmentId.longValue());
			}
			((AttachmentValue) currentSetValue).setValue(attachmentId.longValue());
			return currentSetValue;
		}
		if (currentSetValue instanceof AttachmentValue && object == null) {
			return currentSetValue;
		}

		return null;
	}

	private ExperimentSettingsData constructExperimentSettingsData(final ModelBiologicMap modelBiologicMap,
			final ModelBiologic modelBiologic, final Long userId) throws Exception {
		ExperimentSettingsData experimentSettingsData = new ExperimentSettingsData();

		if (MapUtils.isNotEmpty(modelBiologicMap.getCourseMap())) {
			final Map<Long, CourseJSON> courseMap = modelBiologicMap.getCourseMap();
			final Set<Long> retrievalIds = new HashSet<>(courseMap.size(), 1.0f);
			courseMap.keySet().stream().filter((i) -> i.longValue() > 0).forEach((i) -> retrievalIds.add(i));
			final Map<Long, Course> retrieved = new HashMap<>();
			if (!retrievalIds.isEmpty()) {
				List<Course> courseList = experimentDao.getCoursesForIds(retrievalIds);
				if (CollectionUtils.isNotEmpty(courseList)) {
					courseList.stream().forEach((c) -> retrieved.put(c.getId(), c));
				}
			}

			final Map<Long, Course> coursesToSave = new HashMap<>();
			final Map<Long, Course> coursesToDelete = new HashMap<>();

			for (Long id : courseMap.keySet()) {
				CourseJSON courseJSON = courseMap.get(id);
				if (courseJSON == null) {
					if (id.longValue() <= 0) {
						continue;
					}
					Course course = retrieved.get(id);
					if (course == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_COURSE, id);
					}
					coursesToDelete.put(course.getId(), course);
				} else {
					Course course = null;
					if (id.longValue() <= 0) {
						course = courseJSON.constructNewCourse();
					} else {
						course = retrieved.get(id);
						if (course != null) {
							mergeChangesToEntity(course, courseJSON);
						}
					}
					if (course == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_COURSE, id);
					}
					coursesToSave.put(id, course);
				}
			}

			experimentSettingsData.setCoursesToSave(coursesToSave);
			experimentSettingsData.setCoursesToDelete(coursesToDelete);
		}
		if (MapUtils.isNotEmpty(modelBiologicMap.getCourseRangeMap())) {
			final Map<Long, CourseRangeJSON> courseRangeMap = modelBiologicMap.getCourseRangeMap();
			final Set<Long> retrievalIds = new HashSet<>(courseRangeMap.size(), 1.0f);
			courseRangeMap.keySet().stream().filter((i) -> i.longValue() > 0).forEach((i) -> retrievalIds.add(i));
			final Map<Long, CourseRange> retrieved = new HashMap<>();
			if (!retrievalIds.isEmpty()) {
				List<CourseRange> courseRangeList = experimentDao.getCourseRangesForIds(retrievalIds);
				if (CollectionUtils.isNotEmpty(courseRangeList)) {
					courseRangeList.stream().forEach((c) -> retrieved.put(c.getId(), c));
				}
			}

			final Map<Long, CourseRange> courseRangesToSave = new HashMap<>();
			final Map<Long, CourseRange> courseRangesToDelete = new HashMap<>();

			for (Long id : courseRangeMap.keySet()) {
				CourseRangeJSON courseRangeJSON = courseRangeMap.get(id);
				if (courseRangeJSON == null) {
					if (id.longValue() <= 0) {
						continue;
					}
					CourseRange courseRange = retrieved.get(id);
					if (courseRange == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_COURSE_RANGE, id);
					}
					courseRangesToDelete.put(courseRange.getId(), courseRange);
				} else {
					CourseRange courseRange = null;
					if (id.longValue() <= 0) {
						courseRange = courseRangeJSON.constructNew();
					} else {
						courseRange = retrieved.get(id);
						if (courseRange != null) {
							mergeChangesToEntity(courseRange, courseRangeJSON);
						}
					}
					if (courseRange == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_COURSE_RANGE, id);
					}
					courseRangesToSave.put(id, courseRange);
				}
			}

			experimentSettingsData.setCourseRangesToSave(courseRangesToSave);
			experimentSettingsData.setCourseRangesToDelete(courseRangesToDelete);
		}
		if (MapUtils.isNotEmpty(modelBiologicMap.getCourseActivityMap())) {
			final Map<Long, CourseActivityJSON> courseActivityMap = modelBiologicMap.getCourseActivityMap();
			final Set<Long> retrievalIds = new HashSet<>(courseActivityMap.size(), 1.0f);
			courseActivityMap.keySet().stream().filter((i) -> i.longValue() > 0).forEach((i) -> retrievalIds.add(i));
			final Map<Long, CourseActivity> retrieved = new HashMap<>();
			if (!retrievalIds.isEmpty()) {
				List<CourseActivity> courseActivityList = experimentDao.getCourseActivitiesForIds(retrievalIds);
				if (CollectionUtils.isNotEmpty(courseActivityList)) {
					courseActivityList.stream().forEach((c) -> retrieved.put(c.getId(), c));
				}
			}

			final Map<Long, CourseActivity> courseActivitiesToSave = new HashMap<>();
			final Map<Long, CourseActivity> courseActivitiesToDelete = new HashMap<>();

			for (Long id : courseActivityMap.keySet()) {
				CourseActivityJSON courseActivityJSON = courseActivityMap.get(id);
				if (courseActivityJSON == null) {
					if (id.longValue() <= 0) {
						continue;
					}
					CourseActivity courseActivity = retrieved.get(id);
					if (courseActivity == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_COURSE_ACTIVITY, id);
					}
					courseActivitiesToDelete.put(courseActivity.getId(), courseActivity);
				} else {
					CourseActivity courseActivity = null;
					if (id.longValue() <= 0) {
						courseActivity = courseActivityJSON.constructNew();
					} else {
						courseActivity = retrieved.get(id);
						if (courseActivity != null) {
							mergeChangesToEntity(courseActivity, courseActivityJSON);
						}
					}
					if (courseActivity == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_COURSE_ACTIVITY, id);
					}
					courseActivitiesToSave.put(id, courseActivity);
				}
			}

			experimentSettingsData.setCourseActivitiesToSave(courseActivitiesToSave);
			experimentSettingsData.setCourseActivitiesToDelete(courseActivitiesToDelete);
		}
		if (MapUtils.isNotEmpty(modelBiologicMap.getCourseMutationMap())) {
			final Map<Long, CourseMutationJSON> courseMutationMap = modelBiologicMap.getCourseMutationMap();
			final Set<Long> retrievalIds = new HashSet<>(courseMutationMap.size(), 1.0f);
			courseMutationMap.keySet().stream().filter((i) -> i.longValue() > 0).forEach((i) -> retrievalIds.add(i));
			final Map<Long, CourseMutation> retrieved = new HashMap<>();
			if (!retrievalIds.isEmpty()) {
				List<CourseMutation> courseMutationList = experimentDao.getCourseMutationsForIds(retrievalIds);
				if (CollectionUtils.isNotEmpty(courseMutationList)) {
					courseMutationList.stream().forEach((c) -> retrieved.put(c.getId(), c));
				}
			}

			final Map<Long, CourseMutation> courseMutationsToSave = new HashMap<>();
			final Map<Long, CourseMutation> courseMutationsToDelete = new HashMap<>();

			for (Long id : courseMutationMap.keySet()) {
				CourseMutationJSON courseMutationJSON = courseMutationMap.get(id);
				if (courseMutationJSON == null) {
					if (id.longValue() <= 0) {
						continue;
					}
					CourseMutation courseMutation = retrieved.get(id);
					if (courseMutation == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_COURSE_MUTATION, id);
					}
					courseMutationsToDelete.put(courseMutation.getId(), courseMutation);
				} else {
					CourseMutation courseMutation = null;
					if (id.longValue() <= 0) {
						courseMutation = courseMutationJSON.constructNew();
					} else {
						courseMutation = retrieved.get(id);
						if (courseMutation != null) {
							mergeChangesToEntity(courseMutation, courseMutationJSON);
						}
					}
					if (courseMutation == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_COURSE_MUTATION, id);
					}
					courseMutationsToSave.put(id, courseMutation);
				}
			}

			experimentSettingsData.setCourseMutationsToSave(courseMutationsToSave);
			experimentSettingsData.setCourseMutationsToDelete(courseMutationsToDelete);
		}
		if (MapUtils.isNotEmpty(modelBiologicMap.getCalcIntervalMap())) {
			final Map<Long, CalcIntervalJSON> calcIntervalMap = modelBiologicMap.getCalcIntervalMap();
			final Set<Long> retrievalIds = new HashSet<>(calcIntervalMap.size(), 1.0f);
			calcIntervalMap.keySet().stream().filter((i) -> i.longValue() > 0).forEach((i) -> retrievalIds.add(i));
			final Map<Long, CalcInterval> retrieved = new HashMap<>();
			if (!retrievalIds.isEmpty()) {
				List<CalcInterval> calcIntervalList = experimentDao.getCalcIntervalsForIds(retrievalIds);
				if (CollectionUtils.isNotEmpty(calcIntervalList)) {
					calcIntervalList.stream().forEach((c) -> retrieved.put(c.getId(), c));
				}
			}

			final Map<Long, CalcInterval> calcIntervalsToSave = new HashMap<>();
			final Map<Long, CalcInterval> calcIntervalsToDelete = new HashMap<>();

			for (Long id : modelBiologicMap.getCalcIntervalMap().keySet()) {
				CalcIntervalJSON calcIntervalJSON = calcIntervalMap.get(id);
				if (calcIntervalJSON == null) {
					if (id.longValue() <= 0) {
						continue;
					}
					CalcInterval calcInterval = retrieved.get(id);
					if (calcInterval == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_CALC_INTERVAL, id);
					}
					calcIntervalsToDelete.put(id, calcInterval);
				} else {
					CalcInterval calcInterval = null;
					if (id.longValue() <= 0) {
						calcInterval = calcIntervalJSON.constructNew();
					} else {
						calcInterval = retrieved.get(id);
						if (calcInterval != null) {
							mergeChangesToEntity(calcInterval, calcIntervalJSON);
						}
					}
					if (calcInterval == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_CALC_INTERVAL, id);
					}
					calcIntervalsToSave.put(id, calcInterval);
				}
			}

			experimentSettingsData.setCalcIntervalsToSave(calcIntervalsToSave);
			experimentSettingsData.setCalcIntervalsToDelete(calcIntervalsToDelete);
		}
		if (MapUtils.isNotEmpty(modelBiologicMap.getComponentPairMap())) {
			final Map<Long, ComponentPairJSON> componentPairMap = modelBiologicMap.getComponentPairMap();
			final Set<Long> retrievalIds = new HashSet<>(componentPairMap.size(), 1.0f);
			componentPairMap.keySet().stream().filter((i) -> i.longValue() > 0).forEach((i) -> retrievalIds.add(i));
			final Map<Long, ComponentPair> retrieved = new HashMap<>();
			if (!retrievalIds.isEmpty()) {
				List<ComponentPair> componentPairsList = experimentDao.getComponentPairsForIds(retrievalIds);
				if (CollectionUtils.isNotEmpty(componentPairsList)) {
					componentPairsList.stream().forEach((c) -> retrieved.put(c.getId(), c));
				}
			}

			final Map<Long, ComponentPair> componentPairsToSave = new HashMap<>();
			final Map<Long, ComponentPair> componentPairsToDelete = new HashMap<>();

			for (Long id : componentPairMap.keySet()) {
				ComponentPairJSON componentPairJSON = componentPairMap.get(id);
				if (componentPairJSON == null) {
					if (id.longValue() <= 0) {
						continue;
					}
					ComponentPair componentPair = retrieved.get(id);
					if (componentPair == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_COMPONENT_PAIR, id);
					}
					componentPairsToDelete.put(id, componentPair);
				} else {
					ComponentPair componentPair = null;
					if (id.longValue() <= 0) {
						componentPair = componentPairJSON.constructNew();
					} else {
						componentPair = retrieved.get(id);
						if (componentPair != null) {
							if (componentPairJSON.getFirstComponentId() != 0) {
								componentPair.setFirstComponentId(componentPairJSON.getFirstComponentId());
							}
							if (componentPairJSON.getSecondComponentId() != 0) {
								componentPair.setSecondComponentId(componentPairJSON.getSecondComponentId());
							}
							if (componentPairJSON.getDelay() != null
									|| componentPairJSON.wasSetNull(ComponentPairJSON.NullableFields.DELAY)) {
								componentPair.setDelay(componentPairJSON.getDelay());
							}
							if (componentPairJSON.getThreshold() != null
									|| componentPairJSON.wasSetNull(ComponentPairJSON.NullableFields.THRESHOLD)) {
								componentPair.setThreshold(componentPairJSON.getThreshold());
							}
						}
					}
					if (componentPair == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_COMPONENT_PAIR, id);
					}
					componentPairsToSave.put(id, componentPair);
				}
			}

			experimentSettingsData.setComponentPairsToSave(componentPairsToSave);
			experimentSettingsData.setComponentPairsToDelete(componentPairsToDelete);
		}
		if (MapUtils.isNotEmpty(modelBiologicMap.getRealtimeEnvironmentMap())) {
			final Map<Long, RealtimeEnvironment> realtimeEnvironmentsToSave = new HashMap<>();
			final Map<Long, RealtimeEnvironment> realtimeEnvironmentsToDelete = new HashMap<>();
			Map<Long, RealtimeEnvironmentJSON> realtimeEnvironmentMap = modelBiologicMap.getRealtimeEnvironmentMap();
			for (Long id : realtimeEnvironmentMap.keySet()) {
				RealtimeEnvironmentJSON realtimeEnvironmentJSON = realtimeEnvironmentMap.get(id);
				if (realtimeEnvironmentJSON == null) {
					if (id.longValue() <= 0) {
						continue;
					}
					RealtimeEnvironment realtimeEnvironment = experimentDao.getRealtimeEnvironmentById(id);
					if (realtimeEnvironment == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_REALTIME_ENVIRONMENT, id);
					}
					realtimeEnvironmentsToDelete.put(id, realtimeEnvironment);
				} else {
					RealtimeEnvironment realtimeEnvironment = null;
					if (id.longValue() <= 0) {
						realtimeEnvironment = realtimeEnvironmentJSON.toRealtimeEnvironment();
						realtimeEnvironment.setUserId(userId);
					} else {
						realtimeEnvironment = experimentDao.getRealtimeEnvironmentById(id);
						if (realtimeEnvironment == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_REALTIME_ENVIRONMENT, id);
						}
						if (realtimeEnvironmentJSON.getName() != null) {
							realtimeEnvironment.setName(realtimeEnvironmentJSON.getName());
						}
					}
					realtimeEnvironmentsToSave.put(id, realtimeEnvironment);
				}
			}
			experimentSettingsData.setRealtimeEnvironmentsToSave(realtimeEnvironmentsToSave);
			experimentSettingsData.setRealtimeEnvironmentsToDelete(realtimeEnvironmentsToDelete);
		}
		if (MapUtils.isNotEmpty(modelBiologicMap.getRealtimeActivityMap())) {
			final Map<Long, RealtimeActivity> realtimeActivitiesToSave = new HashMap<>();
			final Map<Long, RealtimeActivity> realtimeActivitiesToDelete = new HashMap<>();
			Map<Long, RealtimeActivityJSON> realtimeActivityMap = modelBiologicMap.getRealtimeActivityMap();
			for (Long id : realtimeActivityMap.keySet()) {
				RealtimeActivityJSON realtimeActivityJSON = realtimeActivityMap.get(id);
				if (realtimeActivityJSON == null) {
					if (id.longValue() <= 0) {
						continue;
					}
					RealtimeActivity realtimeActivity = experimentDao.getRealtimeActivityById(id);
					if (realtimeActivity == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_REALTIME_ACTIVITY, id);
					}
					realtimeActivitiesToDelete.put(id, realtimeActivity);
				} else {
					RealtimeActivity realtimeActivity = null;
					if (id.longValue() <= 0) {
						realtimeActivity = realtimeActivityJSON.toRealtimeActivity();
					} else {
						realtimeActivity = experimentDao.getRealtimeActivityById(id);
						if (realtimeActivity == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_REALTIME_ACTIVITY, id);
						}
						if (realtimeActivityJSON.getValue() != null) {
							realtimeActivity.setValue(realtimeActivityJSON.getValue());
						}
					}
					realtimeActivitiesToSave.put(id, realtimeActivity);
				}
			}
			experimentSettingsData.setRealtimeActivitiesToSave(realtimeActivitiesToSave);
			experimentSettingsData.setRealtimeActivitiesToDelete(realtimeActivitiesToDelete);
		}
		if (MapUtils.isNotEmpty(modelBiologicMap.getAnalysisEnvironmentMap())) {
			final Map<Long, AnalysisEnvironment> analysisEnvironmentsToSave = new HashMap<>();
			final Map<Long, AnalysisEnvironment> analysisEnvironmentsToDelete = new HashMap<>();
			Map<Long, AnalysisEnvironmentJSON> analysisEnvironmentMap = modelBiologicMap.getAnalysisEnvironmentMap();
			for (Long id : analysisEnvironmentMap.keySet()) {
				AnalysisEnvironmentJSON analysisEnvironmentJSON = analysisEnvironmentMap.get(id);
				if (analysisEnvironmentJSON == null) {
					if (id.longValue() <= 0) {
						continue;
					}
					AnalysisEnvironment analysisEnvironment = experimentDao.getAnalysisEnvironmentById(id);
					if (analysisEnvironment == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_ANALYSIS_ENVIRONMENT, id);
					}
					analysisEnvironmentsToDelete.put(id, analysisEnvironment);
				} else {
					AnalysisEnvironment analysisEnvironment = null;
					if (id.longValue() <= 0) {
						analysisEnvironment = analysisEnvironmentJSON.toAnalysisEnvironment();
						analysisEnvironment.setUserId(userId);
					} else {
						analysisEnvironment = experimentDao.getAnalysisEnvironmentById(id);
						if (analysisEnvironment == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_ANALYSIS_ENVIRONMENT, id);
						}
						if (analysisEnvironmentJSON.getName() != null) {
							analysisEnvironment.setName(analysisEnvironmentJSON.getName());
						}
						if (analysisEnvironmentJSON.getIsDefault() != null) {
							analysisEnvironment.setIsDefault(analysisEnvironmentJSON.getIsDefault());
						}
					}
					analysisEnvironmentsToSave.put(id, analysisEnvironment);
				}
			}
			experimentSettingsData.setAnalysisEnvironmentsToSave(analysisEnvironmentsToSave);
			experimentSettingsData.setAnalysisEnvironmentsToDelete(analysisEnvironmentsToDelete);
		}
		if (MapUtils.isNotEmpty(modelBiologicMap.getAnalysisActivityMap())) {
			final Map<Long, AnalysisActivity> analysisActivitiesToSave = new HashMap<>();
			final Map<Long, AnalysisActivity> analysisActivitiesToDelete = new HashMap<>();
			Map<Long, AnalysisActivityJSON> analysisActivityMap = modelBiologicMap.getAnalysisActivityMap();
			for (Long id : analysisActivityMap.keySet()) {
				AnalysisActivityJSON analysisActivityJSON = analysisActivityMap.get(id);
				if (analysisActivityJSON == null) {
					if (id.longValue() <= 0) {
						continue;
					}
					AnalysisActivity analysisActivity = experimentDao.getAnalysisActivityById(id);
					if (analysisActivity == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_ANALYSIS_ACTIVITY, id);
					}
					analysisActivitiesToDelete.put(id, analysisActivity);
				} else {
					AnalysisActivity analysisActivity = null;
					if (id.longValue() <= 0) {
						analysisActivity = analysisActivityJSON.toAnalysisActivity();
					} else {
						analysisActivity = experimentDao.getAnalysisActivityById(id);
						if (analysisActivity == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_ANALYSIS_ACTIVITY, id);
						}
						if (analysisActivityJSON.getMin() != null) {
							analysisActivity.setMin(analysisActivityJSON.getMin());
						}
						if (analysisActivityJSON.getMax() != null) {
							analysisActivity.setMax(analysisActivityJSON.getMax());
						}
					}
					analysisActivitiesToSave.put(id, analysisActivity);
				}
			}
			experimentSettingsData.setAnalysisActivitiesToSave(analysisActivitiesToSave);
			experimentSettingsData.setAnalysisActivitiesToDelete(analysisActivitiesToDelete);
		}

		return experimentSettingsData;
	}

	private void fixForwardLinkedLearningActivityGroups(Map<String, ModelBiologicMap> modelMap,
			final Iterable<ModelBiologic> modelBiologicIterable,
			final Map<String, ModelMappedData> modelMappedDataMap) {
		Map<Long, LearningActivityGroup> learningActivityGroups = new HashMap<>();

		// Phase 1: Collect all LearningActivityGroups
		for (ModelBiologic modelBiologic : modelBiologicIterable) {
			final ModelMappedData modelMappedData = modelMappedDataMap.get(modelBiologic.getKey());
			if (MapUtils.isNotEmpty(modelMappedData.getLearningActivityGroups())) {
				learningActivityGroups.putAll(modelMappedData.getLearningActivityGroups());
			}
		}

		// Phase 2: Fix forward link (LearningActivities that have groupId==null)
		for (ModelBiologic modelBiologic : modelBiologicIterable) {
			if (modelBiologic.isDelete()) {
				continue;
			}

			final ModelBiologicMap modelBiologicMap = modelMap.get(modelBiologic.getKey());
			if (modelBiologicMap == null) {
				logger.warn("fixForwardLinkedLearningActivityGroups: Key " + modelBiologic.getKey()
						+ " not found in modelMap");
				continue;
			}

			final ModelMappedData modelMappedData = modelMappedDataMap.get(modelBiologic.getKey());
			if (MapUtils.isNotEmpty(modelMappedData.getLearningActivities())) {
				final Map<Long, LearningActivityJSON> learningActivityMap = modelBiologicMap.getLearningActivityMap();

				for (Long id : modelMappedData.getLearningActivities().keySet()) {
					LearningActivity learningActivity = modelMappedData.getLearningActivities().get(id);
					LearningActivityJSON learningActivityJSON = learningActivityMap.get(id);
					if (learningActivity.getGroup() == null && learningActivityJSON.getGroupId() != null) {
						LearningActivityGroup groupToSet = learningActivityGroups.get(learningActivityJSON.getGroupId());
						if(groupToSet == null){
							//TODO: nasty and quick hack
							groupToSet = modelBiologicDao.getLearningActivityGroupById(learningActivityJSON.getGroupId());
						}
						learningActivity.setGroup(groupToSet);
					}
				}
			}
		}
	}

	private ModelMappedData constructModelMappedData(final ModelBiologicMap modelBiologicMap,
			final ModelBiologic modelBiologic, final Long userId, final Domain domain, final Long masterId)
			throws Exception {
		ModelMappedData modelMappedData = new ModelMappedData(modelBiologic.getModelId());

		for (Long id : modelBiologicMap.getInitialStateMap().keySet()) {
			InitialStateMap initialStateMap = modelBiologicMap.getInitialStateMap().get(id);
			if (initialStateMap == null) {
				/*
				 * The {@link InitialState} has been deleted.
				 */
				if (id > 0) {
					InitialState initialState = this.initialStateDao.getInitialState(id);
					if (initialState == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_INITIAL_STATE, id);
					}
					modelMappedData.addInitialStateToDelete(initialState);
				}
				continue;
			}

			InitialState initialState = null;
			if (id > 0) {
				initialState = this.initialStateDao.getInitialState(id);
				if (initialState == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_INITIAL_STATE, id);
				}
				this.mergeChangesToEntity(initialState, initialStateMap);
			} else {
				initialState = initialStateMap.constructNewInitialState();
				initialState.setModel(modelBiologic.getModel().getModelIdentifier());
			}
			modelMappedData.addInitialState(id, initialState);
		}

		for (String id : modelBiologicMap.getInitialStateSpeciesMap().keySet()) {
			InitialStateSpeciesId initialStateSpeciesId = modelBiologicMap.getInitialStateSpeciesMap().get(id);
			if (initialStateSpeciesId == null) {
				/*
				 * The relation has been removed.
				 */
				if (id.startsWith(NEGATIVE_SYMBOL)) {
					continue;
				}
				InitialStateSpeciesId initialStateSpecies = new InitialStateSpeciesId(id);

				InitialState initialState = modelMappedData.getInitialStates()
						.get(initialStateSpecies.getInitialStateId());
				boolean initialStateRetrieved = false;

				if (initialState == null) {
					initialState = this.initialStateDao.getInitialState(initialStateSpecies.getInitialStateId());
					initialStateRetrieved = true;
				}

				if (initialState == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_INITIAL_STATE,
							initialStateSpecies.getInitialStateId());
				}

				if (initialStateRetrieved) {
					modelMappedData.addInitialState(initialState.getId(), initialState);
				}

				Iterator<SpeciesIdentifier> iterator = initialState.getSpecies().iterator();
				while (iterator.hasNext()) {
					if (iterator.next().getId() == initialStateSpecies.getSpeciesId()) {
						iterator.remove();
						break;
					}
				}
			} else {
				InitialState initialState = modelMappedData.getInitialStates()
						.get(initialStateSpeciesId.getInitialStateId());
				Species species = modelBiologic.getSpecies().get(initialStateSpeciesId.getSpeciesId());
				boolean initialStateRetrieved = false;
				boolean specifiesRetrieved = false;

				if (initialState == null) {
					initialState = this.initialStateDao.getInitialState(initialStateSpeciesId.getInitialStateId());
					initialStateRetrieved = true;
				}
				if (species == null) {
					species = this.speciesDao.getSpecies(initialStateSpeciesId.getSpeciesId());
					specifiesRetrieved = true;
				}

				if (initialState == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_INITIAL_STATE,
							initialStateSpeciesId.getInitialStateId());
				}
				if (species == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SPECIES,
							initialStateSpeciesId.getSpeciesId());
				}

				if (initialStateRetrieved) {
					modelMappedData.addInitialState(initialState.getId(), initialState);
				}
				if (specifiesRetrieved) {
					modelBiologic.addSpecies(species.getId(), species);
				}
				/*
				 * If the id is JavaScript generated, it will start with a hyphen because it
				 * will be a number < 0.
				 */
				if (id.startsWith(NEGATIVE_SYMBOL)) {
					Number jsId = NumberUtils.createNumber(id);
					modelMappedData.addInitialStateSpecies(jsId,
							new InitialStateSpecies(initialState, species.getSpeciesIdentifier()));
				}

				initialState.addSpecies(species.getSpeciesIdentifier());
			}
		}

		if (MapUtils.isNotEmpty(modelBiologicMap.getShareMap())) {
			final Map<Long, ModelShareMap> modelShareMap = modelBiologicMap.getShareMap();
			final Set<Long> retrievalIds = new HashSet<>(modelShareMap.size(), 1.0f);
			modelShareMap.keySet().stream().filter((i) -> i.longValue() > 0).forEach((i) -> retrievalIds.add(i));
			final Map<Long, ModelShare> retrieved = new HashMap<>();
			if (!retrievalIds.isEmpty()) {
				List<ModelShare> modelShareList = modelShareDao.getModelSharesForIds(retrievalIds);
				if (!modelShareList.isEmpty()) {
					modelShareList.stream().forEach((ms) -> retrieved.put(ms.getId(), ms));
				}
			}
			for (Long id : modelBiologicMap.getShareMap().keySet()) {
				ModelShareMap modelShareJSON = modelShareMap.get(id);
				if (modelShareJSON == null) {
					/*
					 * The {@link ModelShare} has been deleted.
					 */
					if (id > 0) {
						ModelShare share = retrieved.get(id);
						if (share == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_MODEL_SHARE, id);
						}
						modelMappedData.addShareToDelete(share);
					}
					continue;
				} else {
					ModelShare share = null;
					if (id > 0) {
						share = retrieved.get(id);
						if (share == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_MODEL_SHARE, id);
						}
						this.mergeChangesToEntity(share, modelShareJSON);
					} else {
						share = modelShareJSON.constructNewShare();
						share.setModel_id(masterId);

						final String email = (share.getEmail() == null) ? StringUtils.EMPTY : share.getEmail().trim();
						if (!email.isEmpty()) {
							ModelShareNotificationId modelShareNotificationId = new ModelShareNotificationId(masterId,
									email);
							ModelShareNotification modelShareNotification = new ModelShareNotification(
									modelShareNotificationId);
							modelShareNotification.setUserId(userId);
							modelShareNotification.setDomain(domain);
							modelMappedData.addShareNotification(id, modelShareNotification);
						}
					}

					if (share.getEmail() != null) {
						Long userIdToUse = this.userDao.getUserIdForEmail(share.getEmail().trim());
						share.setUserId(userIdToUse);
					}
					if (share.getUserId() != null) {
						/*
						 * Do not store the user e-mail if the associated account is known. We want to
						 * ensure that the current user e-mail address is used in all cases.
						 */
						share.setEmail(null);
					}

					modelMappedData.addShare(id, share);
				}
			}
		}

		if (MapUtils.isNotEmpty(modelBiologicMap.getLinkMap())) {
			final Map<Long, ModelLinkJSON> modelLinkMap = modelBiologicMap.getLinkMap();
			final Set<Long> retrievalIds = new HashSet<>(modelLinkMap.size(), 1.0f);
			modelLinkMap.keySet().stream().filter((i) -> i.longValue() > 0).forEach((i) -> retrievalIds.add(i));
			final Map<Long, ModelLink> retrieved = new HashMap<>();
			if (!retrievalIds.isEmpty()) {
				List<ModelLink> modelLinkList = modelLinkDao.getModelLinksForIds(retrievalIds);
				if (!modelLinkList.isEmpty()) {
					modelLinkList.stream().forEach((ml) -> retrieved.put(ml.getId(), ml));
				}
			}
			for (Long id : modelBiologicMap.getLinkMap().keySet()) {
				ModelLinkJSON modelLinkJSON = modelLinkMap.get(id);
				if (modelLinkJSON == null) {
					if (id > 0) {
						ModelLink link = retrieved.get(id);
						if (link == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_MODEL_LINK, id);
						}
						modelMappedData.addLinkToDelete(link);
					}
					continue;
				} else {
					ModelLink link = null;
					if (id > 0) {
						link = retrieved.get(id);
						if (link == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_MODEL_LINK, id);
						}
						this.mergeChangesToEntity(link, modelLinkJSON);
					} else {
						link = modelLinkJSON.createNewLink();
						link.setModel_id(masterId);
						link.setUserId(userId);
					}

					modelMappedData.addLink(id, link);
				}
			}
		}

		for (Long id : modelBiologicMap.getReferenceMap().keySet()) {
			ReferenceMap referenceMap = modelBiologicMap.getReferenceMap().get(id);
			if (referenceMap == null) {
				if (id > 0) {
					Reference reference = this.referenceDao.getById(id);
					if (reference == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_REFERENCE, id);
					}
					modelMappedData.addReferenceToDelete(reference);
				}
				continue;
			} else {
				Reference reference = null;
				if (id > 0) {
					reference = this.referenceDao.getById(id);
					if (reference == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_REFERENCE, id);
					}
					this.mergeChangesToEntity(reference, referenceMap);
					reference.setUpdateUser(userId);
				} else {
					reference = referenceMap.constructNew();
					reference.setCreationUser(userId);
					reference.setUpdateUser(userId);
				}
				modelMappedData.addReference(id, reference);
			}
		}

		for (Long id : modelBiologicMap.getModelReferenceMap().keySet()) {
			ModelReferenceMap modelReferenceMap = modelBiologicMap.getModelReferenceMap().get(id);
			if (modelReferenceMap == null) {
				if (id > 0) {
					ModelReference reference = this.modelReferenceDao.getById(id);
					if (reference == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_MODEL_REFERENCE, id);
					}
					modelMappedData.addModelReferenceToDelete(reference);
				}
				continue;
			} else {
				ModelReference modelReference = null;
				if (id > 0) {
					modelReference = this.modelReferenceDao.getById(id);
					if (modelReference == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_MODEL_REFERENCE, id);
					}
					this.mergeChangesToEntity(modelReference, modelReferenceMap);
				} else {
					modelReference = modelReferenceMap.constructNew();
					modelReference.setCreationUser(userId);
					modelReference.setModel(modelBiologic.getModel().getModelIdentifier());
					Reference reference = modelMappedData.getReferences().get(modelReference.getReference().getId());
					if (reference == null) {
						reference = this.referenceDao.getById(modelReference.getReference().getId());
					}
					if (reference == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_REFERENCE, id);
					}
					modelReference.setReference(reference);
				}
				modelMappedData.addModelReference(id, modelReference);
			}
		}

		for (Long id : modelBiologicMap.getPageMap().keySet()) {
			PageMap pageMap = modelBiologicMap.getPageMap().get(id);
			if (pageMap == null) {
				if (id > 0) {
					Page page = this.pageDao.getById(id);
					if (page == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_PAGE, id);
					}
					modelMappedData.addPageToDelete(page);
				}
				continue;
			} else {
				Page page = null;
				if (id > 0) {
					page = this.pageDao.getById(pageMap.getSpecies().getId());
					if (page == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_PAGE, id);
					}
					this.mergeChangesToEntity(page, pageMap);
					page.setUpdateUser(userId);
				} else {
					page = pageMap.constructNew();
					Species species = modelBiologic.getSpecies().get(page.getSpecies().getId());
					if (species == null) {
						species = this.speciesDao.getSpecies(page.getSpecies().getId());
					}
					if (species == null) {
						/*
						 * The referenced {@link Species} does not exist.
						 */
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SPECIES,
								page.getSpecies().getId());
					}
					page.setSpecies(species.getSpeciesIdentifier());
					page.setCreationUser(userId);
					page.setUpdateUser(userId);
				}
				modelMappedData.addPage(id, page);
			}
		}

		for (Long id : modelBiologicMap.getPageReferenceMap().keySet()) {
			PageReferenceMap pageReferenceMap = modelBiologicMap.getPageReferenceMap().get(id);
			if (pageReferenceMap == null) {
				if (id > 0) {
					PageReference pageReference = this.pageReferenceDao.getById(id);
					if (pageReference == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_PAGE_REFERENCE, id);
					}
					modelMappedData.addPageReferenceToDelete(pageReference);
					this.loadPageForReference(pageReference, userId, modelMappedData);
				}
				continue;
			} else {
				PageReference pageReference = null;
				if (id > 0) {
					pageReference = this.pageReferenceDao.getById(id);
					if (pageReference == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_PAGE_REFERENCE, id);
					}
					this.mergeChangesToEntity(pageReference, pageReferenceMap);
				} else {
					pageReference = pageReferenceMap.constructNew();
					pageReference.setCreationUser(userId);
					Reference reference = modelMappedData.getReferences().get(pageReference.getReference().getId());
					if (reference == null) {
						reference = this.referenceDao.getById(pageReference.getReference().getId());
					}
					if (reference == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_REFERENCE, id);
					}
					pageReference.setReference(reference);
					Page page = modelMappedData.getPages().get(pageReference.getPage().getId());
					boolean pageRetrieved = false;
					if (page == null) {
						page = this.pageDao.getById(pageReference.getPage().getId());
						pageRetrieved = true;
					}
					if (page == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_PAGE, id);
					}
					pageReference.setPage(page.getIdentifier());
					if (pageRetrieved) {
						page.setUpdateUser(userId);
						modelMappedData.addPage(page.getId(), page);
					}
				}
				modelMappedData.addPageReference(id, pageReference);
			}
		}

		for (Long id : modelBiologicMap.getSectionMap().keySet()) {
			SectionMap sectionMap = modelBiologicMap.getSectionMap().get(id);
			if (sectionMap == null) {
				if (id > 0) {
					Section section = this.sectionDao.getById(id);
					if (section == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SECTION, id);
					}
					modelMappedData.addSectionToDelete(section);
					this.loadPageForSection(section, userId, modelMappedData);
				}
				continue;
			} else {
				Section section = null;
				if (id > 0) {
					section = this.sectionDao.getById(id);
					if (section == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SECTION, id);
					}
					this.mergeChangesToEntity(section, sectionMap);
					section.setUpdateUser(userId);
					/*
					 * Also want to ensure that the page receives an updated timestamp.
					 */
					Page page = modelMappedData.getPages().get(section.getPage().getId());
					if (page == null) {
						page = this.pageDao.getById(section.getPage().getId());
						if (page == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_PAGE, id);
						}
						page.setUpdateUser(userId);
						modelMappedData.addPage(id, page);
					}
				} else {
					section = sectionMap.constructNew();
					section.setCreationUser(userId);
					section.setUpdateUser(userId);
					Page page = modelMappedData.getPages().get(section.getPage().getId());
					boolean pageRetrieved = false;
					if (page == null) {
						page = this.pageDao.getById(section.getPage().getId());
						pageRetrieved = true;
					}
					if (page == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_PAGE, id);
					}
					if (pageRetrieved) {
						page.setUpdateUser(userId);
						modelMappedData.addPage(page.getId(), page);
					}
					section.setPage(page.getIdentifier());
				}
				modelMappedData.addSection(id, section);
			}
		}

		for (Long id : modelBiologicMap.getContentMap().keySet()) {
			ContentMap contentMap = modelBiologicMap.getContentMap().get(id);
			if (contentMap == null) {
				if (id > 0) {
					Content content = this.contentDao.getById(id);
					if (content == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_CONTENT, id);
					}
					modelMappedData.addContentToDelete(content);
					this.loadSectionForContent(content, userId, modelMappedData);
				}
				continue;
			} else {
				Content content = null;
				if (id > 0) {
					content = this.contentDao.getById(id);
					if (content == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_CONTENT, id);
					}
					this.mergeChangesToEntity(content, contentMap);
					content.setUpdateUser(userId);
					Section section = modelMappedData.getSections().get(content.getSection().getId());
					if (section == null) {
						section = this.sectionDao.getById(content.getSection().getId());
						if (section == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SECTION, id);
						}
						section.setUpdateUser(userId);
						modelMappedData.addSection(section.getId(), section);
					}
				} else {
					content = contentMap.constructNew();
					content.setCreationUser(userId);
					content.setUpdateUser(userId);
					Section section = modelMappedData.getSections().get(content.getSection().getId());
					boolean sectionRetrieved = false;
					if (section == null) {
						section = this.sectionDao.getById(content.getSection().getId());
						sectionRetrieved = true;
					}
					if (section == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SECTION, id);
					}
					content.setSection(section.getIdentifier());
					if (sectionRetrieved) {
						section.setUpdateUser(userId);
						modelMappedData.addSection(section.getId(), section);
					}
				}
				modelMappedData.addContent(id, content);
				if (content.getSection().getPage().getId() > 0) {
					Page page = modelMappedData.getPages().get(content.getSection().getPage().getId());
					if (page == null) {
						page = this.pageDao.getById(content.getSection().getPage().getId());
						if (page == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_PAGE, id);
						}
						page.setUpdateUser(userId);
						modelMappedData.addPage(page.getId(), page);
					}
				}
			}
		}

		for (Long id : modelBiologicMap.getContentReferenceMap().keySet()) {
			ContentReferenceMap contentReferenceMap = modelBiologicMap.getContentReferenceMap().get(id);
			if (contentReferenceMap == null) {
				if (id > 0) {
					ContentReference contentReference = this.contentReferenceDao.getById(id);
					if (contentReference == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_CONTENT_REFERENCE, id);
					}
					modelMappedData.addContentReferenceToDelete(contentReference);
					this.loadContentForReference(contentReference, userId, modelMappedData);
				}
				continue;
			} else {
				ContentReference contentReference = null;
				if (id > 0) {
					contentReference = this.contentReferenceDao.getById(id);
					if (contentReference == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_CONTENT_REFERENCE, id);
					}
					this.mergeChangesToEntity(contentReference, contentReferenceMap);
				} else {
					contentReference = contentReferenceMap.constructNew();
					contentReference.setCreationUser(userId);
					Reference reference = modelMappedData.getReferences().get(contentReference.getReference().getId());
					if (reference == null) {
						reference = this.referenceDao.getById(contentReference.getReference().getId());
					}
					if (reference == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_REFERENCE, id);
					}
					contentReference.setReference(reference);
					Content content = modelMappedData.getContents().get(contentReference.getContent().getId());
					if (content == null) {
						content = this.contentDao.getById(contentReference.getContent().getId());
						if (content == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_CONTENT, id);
						}
						content.setUpdateUser(userId);
						modelMappedData.addContent(content.getId(), content);
					}
					contentReference.setContent(content);
				}
				modelMappedData.addContentReference(id, contentReference);
				if (contentReference.getContent().getSection().getId() > 0) {
					Section section = modelMappedData.getSections()
							.get(contentReference.getContent().getSection().getId());
					if (section == null) {
						section = this.sectionDao.getById(contentReference.getContent().getSection().getId());
						if (section == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SECTION,
									contentReference.getContent().getSection().getId());
						}
						section.setUpdateUser(userId);
						modelMappedData.addSection(section.getId(), section);
					}
					Page page = modelMappedData.getPages().get(section.getPage().getId());
					if (page == null) {
						page = this.pageDao.getById(section.getPage().getId());
						if (page == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_PAGE, id);
						}
						page.setUpdateUser(userId);
						modelMappedData.addPage(page.getId(), page);
					}
				}
			}
		}

		if (MapUtils.isNotEmpty(modelBiologicMap.getModelReferenceTypesMap())) {
			final Map<Long, ModelReferenceTypesJSON> modelReferencesTypesMap = modelBiologicMap
					.getModelReferenceTypesMap();
			final Set<Long> retrievalIds = new HashSet<>(modelReferencesTypesMap.size(), 1.0f);
			modelReferencesTypesMap.keySet().stream().filter((i) -> i.longValue() > 0)
					.forEach((i) -> retrievalIds.add(i));
			final Map<Long, ModelReferenceTypes> retrieved = new HashMap<>();
			if (!retrievalIds.isEmpty()) {
				List<ModelReferenceTypes> modelReferenceTypesList = pageDao
						.getModelReferenceTypesForIdsIn(retrievalIds);
				if (CollectionUtils.isNotEmpty(modelReferenceTypesList)) {
					modelReferenceTypesList.stream().forEach((c) -> retrieved.put(c.getId(), c));
				}
			}

			final Map<Long, ModelReferenceTypes> modelReferenceTypesToSave = new HashMap<>();
			final Map<Long, ModelReferenceTypes> modelReferenceTypesToDelete = new HashMap<>();

			for (Long id : modelReferencesTypesMap.keySet()) {
				ModelReferenceTypesJSON modelReferenceTypesJSON = modelReferencesTypesMap.get(id);
				if (modelReferenceTypesJSON == null) {
					if (id.longValue() <= 0) {
						continue;
					}
					ModelReferenceTypes modelReferenceTypes = retrieved.get(id);
					if (modelReferenceTypes == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_MODEL_REFERENCE_TYPES, id);
					}
					modelReferenceTypesToDelete.put(id, modelReferenceTypes);
				} else {
					ModelReferenceTypes modelReferenceTypes = null;
					if (id.longValue() <= 0) {
						modelReferenceTypes = modelReferenceTypesJSON.constructNew();
					} else {
						modelReferenceTypes = retrieved.get(id);
						if (modelReferenceTypes != null) {
							if (modelReferenceTypesJSON.getModelId() != 0) {
								modelReferenceTypes.setModelId(modelReferenceTypesJSON.getModelId());
							}
							if (modelReferenceTypesJSON.getReferenceId() != 0) {
								modelReferenceTypes.setReferenceId(modelReferenceTypesJSON.getReferenceId());
							}
							if (modelReferenceTypesJSON.getCitationType() != null || modelReferenceTypesJSON
									.wasSetNull(ModelReferenceTypesJSON.NullableFields.CITATION_TYPE)) {
								modelReferenceTypes.setCitationType(modelReferenceTypesJSON.getCitationType());
							}
							if (modelReferenceTypesJSON.getDataType() != null || modelReferenceTypesJSON
									.wasSetNull(ModelReferenceTypesJSON.NullableFields.DATA_TYPE)) {
								modelReferenceTypes.setDataType(modelReferenceTypesJSON.getDataType());
							}
						}
					}
					if (modelReferenceTypes == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_MODEL_REFERENCE_TYPES, id);
					}
					modelReferenceTypesToSave.put(id, modelReferenceTypes);
				}
			}

			modelMappedData.setModelReferenceTypesToSave(modelReferenceTypesToSave);
			modelMappedData.setModelReferenceTypesToDelete(modelReferenceTypesToDelete);
		}

		if (MapUtils.isNotEmpty(modelBiologicMap.getLayoutMap())) {
			final Map<Long, LayoutJSON> layoutsMap = modelBiologicMap.getLayoutMap();
			final Set<Long> retrievalIds = new HashSet<>(layoutsMap.size(), 1.0f);
			layoutsMap.keySet().stream().filter((i) -> i.longValue() > 0).forEach((i) -> retrievalIds.add(i));
			final Map<Long, Layout> retrieved = new HashMap<>();
			if (!retrievalIds.isEmpty()) {
				List<Layout> layoutsList = layoutDao.getLayoutsForIds(retrievalIds);
				if (CollectionUtils.isNotEmpty(layoutsList)) {
					layoutsList.forEach((l) -> retrieved.put(l.getId(), l));
				}
			}

			final Map<Long, Layout> layoutsToSave = new HashMap<>();
			final Map<Long, Layout> layoutsToDelete = new HashMap<>();

			for (Long id : layoutsMap.keySet()) {
				LayoutJSON layoutJSON = layoutsMap.get(id);
				if (layoutJSON == null) {
					if (id.intValue() <= 0) {
						continue;
					}
					Layout layout = retrieved.get(id);
					if (layout == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_LAYOUT, id);
					}
					layoutsToDelete.put(layout.getId(), layout);
				} else {
					Layout layout = null;
					if (id.longValue() <= 0) {
						layout = layoutJSON.constructNew();
					} else {
						layout = retrieved.get(id);
						mergeChangesToEntity(layout, layoutJSON);
					}
					if (layout == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_LAYOUT, id);
					}
					layoutsToSave.put(id, layout);
				}
			}

			modelMappedData.setLayoutsToSave(layoutsToSave);
			modelMappedData.setLayoutsToDelete(layoutsToDelete);
		}

		if (MapUtils.isNotEmpty(modelBiologicMap.getLayoutNodeMap())) {
			final Map<Long, LayoutNodeJSON> layoutNodesMap = modelBiologicMap.getLayoutNodeMap();
			final Set<Long> retrievalIds = new HashSet<>(layoutNodesMap.size(), 1.0f);
			layoutNodesMap.keySet().stream().filter((i) -> i.longValue() > 0).forEach((i) -> retrievalIds.add(i));
			final Map<Long, LayoutNode> retrieved = new HashMap<>();
			if (!retrievalIds.isEmpty()) {
				List<LayoutNode> layoutNodesList = layoutDao.getLayoutNodesForIds(retrievalIds);
				if (CollectionUtils.isNotEmpty(layoutNodesList)) {
					layoutNodesList.forEach((ln) -> retrieved.put(ln.getId(), ln));
				}
			}

			final Map<Long, LayoutNode> layoutNodesToSave = new HashMap<>();
			final Map<Long, LayoutNode> layoutNodesToDelete = new HashMap<>();

			for (Long id : layoutNodesMap.keySet()) {
				LayoutNodeJSON layoutNodeJSON = layoutNodesMap.get(id);
				if (layoutNodeJSON == null) {
					if (id.intValue() <= 0) {
						continue;
					}
					LayoutNode layoutNode = retrieved.get(id);
					if (layoutNode == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_LAYOUT_NODE, id);
					}
					layoutNodesToDelete.put(layoutNode.getId(), layoutNode);
				} else {
					LayoutNode layoutNode = null;
					if (id.longValue() <= 0) {
						layoutNode = layoutNodeJSON.constructNew();
					} else {
						layoutNode = retrieved.get(id);
						if (layoutNodeJSON.getX() != null
								|| layoutNodeJSON.wasSetNull(LayoutNodeJSON.NullableFields.X)) {
							layoutNode.setX(layoutNodeJSON.getX());
						}
						if (layoutNodeJSON.getY() != null
								|| layoutNodeJSON.wasSetNull(LayoutNodeJSON.NullableFields.Y)) {
							layoutNode.setY(layoutNodeJSON.getY());
						}
					}
					if (layoutNode == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_LAYOUT_NODE, id);
					}
					layoutNodesToSave.put(id, layoutNode);
				}
			}

			modelMappedData.setLayoutNodesToSave(layoutNodesToSave);
			modelMappedData.setLayoutNodesToDelete(layoutNodesToDelete);
		}

		if (MapUtils.isNotEmpty(modelBiologicMap.getLearningActivityGroupMap())) {
			final Map<Long, LearningActivityGroupJSON> learningActivityGroupMap = modelBiologicMap
					.getLearningActivityGroupMap();
			for (Long id : learningActivityGroupMap.keySet()) {
				LearningActivityGroupJSON learningActivityGroupJSON = learningActivityGroupMap.get(id);
				if (learningActivityGroupJSON == null && id.longValue() > 0) {
					/*
					 * Find the learning activity that needs to be deleted.
					 */
					LearningActivityGroup learningActivityGroup = modelVersionDao.getLearningActivityGroupById(id);
					if (learningActivityGroup == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_LEARNING_ACTIVITY_GROUP, id);
					}
					modelMappedData.getLearningActivityGroupsToDelete().put(id, learningActivityGroup);
				} else {
					LearningActivityGroup learningActivityGroup = null;
					if (id.longValue() <= 0) {
						/*
						 * Create a new Learning Activity.
						 */
						learningActivityGroup = new LearningActivityGroup();
						learningActivityGroup.setMasterId(masterId);
						learningActivityGroup.setName(learningActivityGroupJSON.getName());
						learningActivityGroup.setPosition(learningActivityGroupJSON.getPosition());
					} else {				
						/*
						 * Find the Learning Activity that needs to be updated.
						 */
						learningActivityGroup = modelVersionDao.getLearningActivityGroupById(id);
						if (learningActivityGroup == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_LEARNING_ACTIVITY_GROUP,
									id);
						}
						if (learningActivityGroupJSON.getName() != null) {
							learningActivityGroup.setName(learningActivityGroupJSON.getName());
						}
						if (learningActivityGroupJSON.getPosition() >= 0) {
							learningActivityGroup.setPosition(learningActivityGroupJSON.getPosition());
						}
					}
					modelMappedData.getLearningActivityGroups().put(id, learningActivityGroup);
				}
			}
		}

		if (MapUtils.isNotEmpty(modelBiologicMap.getLearningActivityMap())) {
			final Map<Long, LearningActivityJSON> learningActivityMap = modelBiologicMap.getLearningActivityMap();
			for (Long id : learningActivityMap.keySet()) {
				LearningActivityJSON learningActivityJSON = learningActivityMap.get(id);
				if (learningActivityJSON == null && id.longValue() > 0) {
					/*
					 * Find the learning activity that needs to be deleted.
					 */
					LearningActivity learningActivity = modelVersionDao.getLearningActivityById(id);
					if (learningActivity == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_LEARNING_ACTIVITY, id);
					}
					modelMappedData.getLearningActivitiesToDelete().put(id, learningActivity);
				} else if(learningActivityJSON != null) {
					LearningActivity learningActivity = null;

					LearningActivityGroup laGroup = null;
					if (learningActivityJSON != null && learningActivityJSON.getGroupId() != null) {
						laGroup = modelMappedData.getLearningActivityGroups().get(learningActivityJSON.getGroupId());
					}

					if (id.longValue() <= 0) {
						/*
						 * Create a new Learning Activity.
						 */
						learningActivity = new LearningActivity();
						learningActivity.setMasterId(masterId);
						learningActivity.setName(learningActivityJSON.getName());
						learningActivity.setPosition(learningActivityJSON.getPosition());

						if (laGroup != null) {
							learningActivity.setGroup(laGroup);
						}

						learningActivity.setWorkspaceLayout(
								objectMapper.writeValueAsString(learningActivityJSON.getWorkspaceLayout()));
						if (learningActivityJSON.getViews() != null) {
							learningActivity.setViews(objectMapper.writeValueAsString(learningActivityJSON.getViews()));
						}
						learningActivity.setVersion(learningActivityJSON.getVersion());
					} else {
						/*
						 * Find the Learning Activity that needs to be updated.
						 */
						learningActivity = modelVersionDao.getLearningActivityById(id);
						if (learningActivity == null) {
							throw new EntityNotFoundException(EntityNotFoundException.ENTITY_LEARNING_ACTIVITY, id);
						}
						if (learningActivityJSON.getName() != null) {
							learningActivity.setName(learningActivityJSON.getName());
						}
						if (learningActivityJSON.getPosition() >= 0) {
							learningActivity.setPosition(learningActivityJSON.getPosition());
						}
						if (laGroup != null) {
							learningActivity.setGroup(laGroup);
						}
						if (learningActivityJSON.getWorkspaceLayout() != null) {
							learningActivity.setWorkspaceLayout(
									objectMapper.writeValueAsString(learningActivityJSON.getWorkspaceLayout()));
						}
						if (learningActivityJSON.getViews() == null && learningActivityJSON.isViewSetNull()) {
							learningActivity.setViews(null);
						} else if (learningActivityJSON.getViews() != null) {
							learningActivity.setViews(objectMapper.writeValueAsString(learningActivityJSON.getViews()));
						}

						if (learningActivityJSON.getVersion() > 0) {
							learningActivity.setVersion(learningActivityJSON.getVersion());
						}
					}
					modelMappedData.getLearningActivities().put(id, learningActivity);
				}
			}
		}

		this.prepareExperiments(modelBiologicMap, modelBiologic, modelMappedData, userId);
		return modelMappedData;
	}

	private void loadContentForReference(final ContentReference contentReference, final long userId,
			final ModelMappedData modelMappedData) throws EntityNotFoundException {
		final long contentId = contentReference.getContent().getId();
		if (contentId <= 0) {
			return;
		}
		Content content = modelMappedData.getContents().get(contentId);
		if (content != null) {
			return;
		}
		content = this.contentDao.getById(contentId);
		if (content == null) {
			throw new EntityNotFoundException(EntityNotFoundException.ENTITY_CONTENT, contentId);
		}
		modelMappedData.addContent(content.getId(), content);
		this.loadSectionForContent(content, userId, modelMappedData);
	}

	private void loadSectionForContent(final Content content, final long userId, final ModelMappedData modelMappedData)
			throws EntityNotFoundException {
		final long sectionId = content.getSection().getId();
		if (sectionId <= 0) {
			return;
		}
		Section section = modelMappedData.getSections().get(sectionId);
		if (section != null) {
			return;
		}
		section = this.sectionDao.getById(sectionId);
		if (section == null) {
			throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SECTION, sectionId);
		}
		section.setUpdateUser(userId);
		modelMappedData.addSection(section.getId(), section);
		this.loadPageForSection(section, userId, modelMappedData);
	}

	private void loadPageForReference(final PageReference pageReference, final long userId,
			final ModelMappedData modelMappedData) throws EntityNotFoundException {
		final long pageId = pageReference.getPage().getId();
		if (pageId <= 0) {
			return;
		}
		Page page = modelMappedData.getPages().get(pageId);
		if (page != null) {
			return;
		}
		if (page == null) {
			page = this.pageDao.getById(pageId);
			if (page == null) {
				throw new EntityNotFoundException(EntityNotFoundException.ENTITY_PAGE, pageId);
			}
			page.setUpdateUser(userId);
			modelMappedData.addPage(page.getId(), page);
		}
	}

	private void loadPageForSection(final Section section, final long userId, final ModelMappedData modelMappedData)
			throws EntityNotFoundException {
		final long pageId = section.getPage().getId();
		if (pageId <= 0) {
			return;
		}
		Page page = modelMappedData.getPages().get(pageId);
		if (page != null) {
			return;
		}
		page = this.pageDao.getById(pageId);
		if (page == null) {
			throw new EntityNotFoundException(EntityNotFoundException.ENTITY_PAGE, pageId);
		}
		page.setUpdateUser(userId);
		modelMappedData.addPage(page.getId(), page);
	}

	private void prepareExperiments(final ModelBiologicMap modelBiologicMap, final ModelBiologic modelBiologic,
			final ModelMappedData modelMappedData, final Long userId) throws Exception {
		for (Long id : modelBiologicMap.getExperimentMap().keySet()) {
			ExperimentMap experimentMap = modelBiologicMap.getExperimentMap().get(id);
			if (experimentMap == null) {
				if (id > 0) {
					Experiment experiment = this.experimentDao.getById(id);
					if (experiment == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_EXPERIMENT, id);
					}
					modelMappedData.addExperimentToDelete(experiment);
				}
				continue;
			} else {
				Experiment experiment = null;
				if (id > 0) {
					experiment = this.experimentDao.getById(id);
					if (experiment == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_EXPERIMENT, id);
					}
					this.mergeChangesToEntity(experiment, experimentMap);

					/*
					 * Check for settings updates.
					 */
					if (experimentMap.getObjSettings() != null) {
						DynamicSimulationSettings storedSettings = (DynamicSimulationSettings) SimulationSettingsJAXBManager
								.getInstance().fromXMLString(experiment.getSettings());
						experimentMap.udpateExisting(storedSettings);
						modelMappedData.addExperimentSettings(id, storedSettings);
					}
				} else {
					experiment = experimentMap.constructNew();
					modelMappedData.addExperimentSettings(id, experimentMap.getObjSettings());
				}

				experiment.setModel_id(modelBiologic.getModelId());
				experiment.setUserId(userId);

				modelMappedData.addExperiment(id, experiment);
			}
		}
	}
}