/**
 * 
 */
package cc.application.main.controller;

import java.util.Calendar;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.function.Consumer;

import javax.servlet.ServletRequest;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.lang3.math.NumberUtils;
import org.apache.commons.lang3.time.StopWatch;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.CollectionUtils;

import cc.application.main.exception.EntityNotFoundException;
import cc.application.main.exception.ModelAccessDeniedException;
import cc.application.main.json.ConditionBiologicMap;
import cc.application.main.json.ModelBiologicMap;
import cc.application.main.json.ModelPermissions;
import cc.application.main.json.RegulatorBiologicMap;
import cc.application.main.json.SpeciesBiologicMap;
import cc.application.main.json.SubConditionBiologicMap;
import cc.common.data.biologic.Condition;
import cc.common.data.biologic.Regulator;
import cc.common.data.biologic.RegulatorIdentifier;
import cc.common.data.biologic.Species;
import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.biologic.SubCondition;
import cc.common.data.biologic.Regulator.RegulationType;
import cc.common.data.knowledge.Page;
import cc.common.data.model.Model;
import cc.common.data.model.ModelLink;
import cc.common.data.model.ModelVersion;
import cc.dataaccess.ConditionSpecies;
import cc.dataaccess.ConditionSpeciesId;
import cc.dataaccess.Dominance;
import cc.dataaccess.DominanceId;
import cc.dataaccess.ModelBiologic;
import cc.dataaccess.SubConditionSpecies;
import cc.dataaccess.SubConditionSpeciesId;
import cc.dataaccess.main.dao.ConditionDao;
import cc.dataaccess.main.dao.ModelBiologicDao;
import cc.dataaccess.main.dao.ModelLinkDao;
import cc.dataaccess.main.dao.ModelStatisticDao;
import cc.dataaccess.main.dao.ModelVersionDao;
import cc.dataaccess.main.dao.PageDao;
import cc.dataaccess.main.dao.RegulatorDao;
import cc.dataaccess.main.dao.SpeciesDao;
import cc.dataaccess.main.dao.SubConditionDao;
import io.jsonwebtoken.Jwts;

/**
 * @author Bryan Kowal
 */
public class AbstractModelController extends AbstractController {

	public static final String NEGATIVE_SYMBOL = "-";

	protected static final String TEMP_SECRET = "TEMP";

	private static final String TEMP_ACCESS_HEADER = "TEMP-ACCESS";

	@Autowired
	protected ModelBiologicDao modelBiologicDao;

	@Autowired
	protected SpeciesDao speciesDao;

	@Autowired
	protected RegulatorDao regulatorDao;

	@Autowired
	protected ConditionDao conditionDao;

	@Autowired
	protected SubConditionDao subConditionDao;

	@Autowired
	protected ModelLinkDao modelLinkDao;

	@Autowired
	protected ModelStatisticDao modelStatisticDao;

	@Autowired
	protected PageDao pageDao;

	@Autowired
	protected ModelVersionDao modelVersionDao;

	protected final ConcurrentMap<Long, Page> cachedPageMap = new ConcurrentHashMap<>();

	protected ModelBiologic constructModelBiologic(final ModelBiologicMap modelBiologicMap, Number modelId,
			final Long userId, final boolean newVersionOfModel) throws Exception {
		Model model = this.retrieveModel(modelBiologicMap, modelId, userId);
		return this.constructModelBiologic(modelBiologicMap, model, userId, newVersionOfModel);
	}

	protected ModelBiologic constructModelBiologic(final ModelBiologicMap modelBiologicMap, Model model,
			final Long userId, final boolean newVersionOfModel) throws Exception {
		ModelBiologic modelBiologic = new ModelBiologic();
		long actualModelId = -1;
		if (newVersionOfModel) {
			modelBiologic.setModelId(0);
			actualModelId = model.getId();
			model.setId(0);
		} else {
			modelBiologic.setModelId((int) model.getId());
		}

		modelBiologic.setModel(model);
		this.retrieveSpecies(modelBiologic, modelBiologicMap);
		this.retrieveRegulators(modelBiologic, modelBiologicMap);
		this.retrieveDominance(modelBiologic, modelBiologicMap);
		this.retrieveConditions(modelBiologic, modelBiologicMap);
		this.retrieveConditionSpecies(modelBiologic, modelBiologicMap);
		this.retrieveSubConditions(modelBiologic, modelBiologicMap);
		this.retrieveSubConditionSpecies(modelBiologic, modelBiologicMap);
		if (actualModelId != -1) {
			modelBiologic.setModelId((int) actualModelId);
		}

		return modelBiologic;
	}

	private Model retrieveModel(final ModelBiologicMap modelBiologicMap, Number modelId, final Long userId)
			throws EntityNotFoundException, ModelAccessDeniedException {
		Model model = null;
		if (modelId.intValue() <= 0) {
			model = modelBiologicMap.constructNewModel();
			model.setUserId(userId);
		} else {
			model = this.modelDao.getModel(modelId.longValue());
			if (model == null) {
				/*
				 * First version of model does not exist.
				 */
				final ModelVersion latestModelVersion = modelVersionDao
						.getLatestVersionForVersionId(modelId.longValue());
				if (latestModelVersion != null) {
					model = modelDao.getModel(latestModelVersion.getModelId());
				}
			}
			if (model == null) {
				throw new EntityNotFoundException(EntityNotFoundException.ENTITY_MODEL, modelId);
			}
			ModelVersion modelVersion = modelVersionDao.getVersionIdForModel(model.getId());
			if (modelVersion == null) {
				throw new EntityNotFoundException(EntityNotFoundException.ENTITY_MODEL, modelId);
			}
			/*
			 * Verify that the user has permission to edit the {@link Model}.
			 */
			ModelPermissions permissions = this.determineModelPermissions(model, modelVersion, userId, null);
			if ( !permissions.isEdit() && !permissions.isPublish() ) {
				throw new ModelAccessDeniedException(ModelAccessDeniedException.ACTION_EDIT_PUBISH, modelId);
			}
			if (permissions.isShare() == false && (modelBiologicMap.getShareMap().isEmpty() == false
					|| modelBiologicMap.getLinkMap().isEmpty() == false)) {
				/*
				 * The user is not allowed to alter {@link ModelShare}s.
				 */
				throw new ModelAccessDeniedException(ModelAccessDeniedException.ACTION_SHARE, modelId);
			}
			this.mergeChangesToEntity(model, modelBiologicMap);
		}

		return model;
	}

	private void retrieveSpecies(ModelBiologic modelBiologic, final ModelBiologicMap modelBiologicMap)
			throws EntityNotFoundException {
		if (CollectionUtils.isEmpty(modelBiologicMap.getSpeciesMap())) {
			return;
		}

		for (Long speciesId : modelBiologicMap.getSpeciesMap().keySet()) {
			final SpeciesBiologicMap speciesBiologicMap = modelBiologicMap.getSpeciesMap().get(speciesId);
			if (speciesBiologicMap == null) {
				/*
				 * The {@link Species} has been deleted.
				 */
				if (speciesId > 0) {
					/*
					 * Retrieve the {@link Species} to delete.
					 */
					Species species = this.speciesDao.getSpecies(speciesId);
					if (species == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SPECIES, speciesId);
					}
					modelBiologic.addSpeciesToDelete(species);
				}
				continue;
			}

			Species species = null;
			if (speciesId <= 0) {
				species = speciesBiologicMap.constructNewSpecies();
				species.setModel(modelBiologic.getModel().getModelIdentifier());
			} else {
				species = this.speciesDao.getSpecies(speciesId);
				if (species == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SPECIES, speciesId);
				}
				this.mergeChangesToEntity(species, speciesBiologicMap);
			}

			modelBiologic.addSpecies(speciesId, species);
		}
	}

	private void retrieveRegulators(ModelBiologic modelBiologic, final ModelBiologicMap modelBiologicMap)
			throws EntityNotFoundException {
		if (CollectionUtils.isEmpty(modelBiologicMap.getRegulatorMap())) {
			return;
		}

		for (Long regulatorId : modelBiologicMap.getRegulatorMap().keySet()) {
			final RegulatorBiologicMap regulatorBiologicMap = modelBiologicMap.getRegulatorMap().get(regulatorId);
			if (regulatorBiologicMap == null) {
				/*
				 * The link {@link Regulator} has been deleted.
				 */
				if (regulatorId > 0) {
					Regulator regulator = this.regulatorDao.getRegulator(regulatorId);
					if (regulator == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_REGULATOR, regulatorId);
					}
					regulator.setDominance(null);
					regulator.setConditions(null);
					modelBiologic.addRegulatorToDelete(regulator);
				}
				continue;
			}

			Regulator regulator = null;
			if (regulatorId <= 0) {
				regulator = regulatorBiologicMap.constructNewRegulator();
				if (regulator.getSpecies() == null) { continue; }
				final long speciesId = regulator.getSpecies().getId();
				final long regulatorSpeciesId = regulator.getRegulatorSpecies().getId();

				Species species = modelBiologic.getSpecies().get(speciesId);
				boolean speciesRetrieved = false;
				if (species == null) {
					species = this.speciesDao.getSpecies(speciesId);
					speciesRetrieved = true;
				}
				Species regulatorSpecies = modelBiologic.getSpecies().get(regulatorSpeciesId);
				boolean regulatorSpeciesRetrieved = false;
				if (regulatorSpecies == null) {
					regulatorSpecies = this.speciesDao.getSpecies(regulatorSpeciesId);
					regulatorSpeciesRetrieved = true;
				}

				/*
				 * Verify that the referenced {@link Species} exist.
				 */
				if (species == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SPECIES, speciesId);
				}
				if (regulatorSpecies == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SPECIES, regulatorSpeciesId);
				}

				/*
				 * Add the {@link Species} to the new {@link Regulator}.
				 */
				regulator.setSpecies(species.getSpeciesIdentifier());
				regulator.setRegulatorSpecies(regulatorSpecies.getSpeciesIdentifier());

				/*
				 * If we had to retrieve the {@link Species} from the database, add the {@link
				 * Species} to the {@link ModelBiologic} so that they will be updated
				 * appropriately.
				 */
				if (speciesRetrieved) {
					modelBiologic.addSpecies(speciesId, species);
				}
				if (regulatorSpeciesRetrieved) {
					modelBiologic.addSpecies(regulatorSpeciesId, regulatorSpecies);
				}
			} else {
				regulator = this.regulatorDao.getRegulator(regulatorId);
				if (regulator == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_REGULATOR, regulatorId);
				}
				this.mergeChangesToEntity(regulator, regulatorBiologicMap);
			}
			modelBiologic.addRegulator(regulatorId, regulator);
		}
	}

	private void retrieveDominance(ModelBiologic modelBiologic, final ModelBiologicMap modelBiologicMap)
			throws EntityNotFoundException {
		if (CollectionUtils.isEmpty(modelBiologicMap.getDominanceMap())) {
			return;
		}

		for (String id : modelBiologicMap.getDominanceMap().keySet()) {
			DominanceId dominanceId = modelBiologicMap.getDominanceMap().get(id);
			if (dominanceId == null) {
				if (id.startsWith(NEGATIVE_SYMBOL)) {
					continue;
				}
				/*
				 * The {@link Dominance} relation has been removed.
				 */
				DominanceId dominance = new DominanceId(id);
				Regulator negativeRegulator = modelBiologic.getRegulators().get(dominance.getNegativeRegulatorId());
				boolean negativeRegulatorRetrieved = false;

				if (negativeRegulator == null) {
					negativeRegulator = this.regulatorDao.getRegulator(dominance.getNegativeRegulatorId());
					negativeRegulatorRetrieved = true;
				}

				if (negativeRegulator == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_REGULATOR,
							dominance.getNegativeRegulatorId());
				}

				if (negativeRegulatorRetrieved) {
					/*
					 * Add the {@link Regulator} to the {@link ModelBiologic} data structure.
					 */
					modelBiologic.addRegulator(negativeRegulator.getId(), negativeRegulator);
				}

				Iterator<RegulatorIdentifier> iterator = negativeRegulator.getDominance().iterator();
				while (iterator.hasNext()) {
					if (iterator.next().getId() == dominance.getPositiveRegulatorId()) {
						iterator.remove();
						break;
					}
				}
			} else {
				/*
				 * Add the dominance relation; may or may not need to add or retrieve the
				 * positive and negative regulator(s) as well.
				 */
				Regulator negativeRegulator = modelBiologic.getRegulators().get(dominanceId.getNegativeRegulatorId());
				Regulator positiveRegulator = modelBiologic.getRegulators().get(dominanceId.getPositiveRegulatorId());
				/*
				 * Flag to determine if the negative {@link Regulator} will need to be added to
				 * the {@link ModelBiologic} data structure.
				 */
				boolean negativeRegulatorRetrieved = false;
				boolean positiveRegulatorRetrieved = false;

				if (negativeRegulator == null) {
					negativeRegulator = this.regulatorDao.getRegulator(dominanceId.getNegativeRegulatorId());
					negativeRegulatorRetrieved = true;
				}
				if (positiveRegulator == null) {
					positiveRegulator = this.regulatorDao.getRegulator(dominanceId.getPositiveRegulatorId());
					positiveRegulatorRetrieved = true;
				}

				/*
				 * Verify that we were successfully able to find the negative {@link Regulator}
				 * and that it is actually a negative regulator.
				 */
				if (negativeRegulator == null || negativeRegulator.getRegulationType() != RegulationType.NEGATIVE) {
					throw new EntityNotFoundException("Negative " + EntityNotFoundException.ENTITY_REGULATOR,
							dominanceId.getNegativeRegulatorId());
				}

				/*
				 * Verify that we were successfully able to find the positive {@link Regulator}
				 * and that it is actually a positive regulator.
				 */
				if (positiveRegulator == null || positiveRegulator.getRegulationType() != RegulationType.POSITIVE) {
					throw new EntityNotFoundException("Positive " + EntityNotFoundException.ENTITY_REGULATOR,
							dominanceId.getPositiveRegulatorId());
				}

				if (negativeRegulatorRetrieved) {
					/*
					 * Add the {@link Regulator} to the {@link ModelBiologic} data structure.
					 */
					modelBiologic.addRegulator(negativeRegulator.getId(), negativeRegulator);
				}
				if (positiveRegulatorRetrieved) {
					/*
					 * Add the {@link Regulator} to the {@link ModelBiologic} data structure.
					 */
					modelBiologic.addRegulator(positiveRegulator.getId(), positiveRegulator);
				}
				if (id.startsWith(NEGATIVE_SYMBOL)) {
					Number jsId = NumberUtils.createNumber(id);
					modelBiologic.addDominance(jsId,
							new Dominance(negativeRegulator, positiveRegulator.getRegulatorIdentifier()));
				}

				negativeRegulator.addDominance(positiveRegulator.getRegulatorIdentifier());
			}
		}
	}

	private void retrieveConditions(ModelBiologic modelBiologic, final ModelBiologicMap modelBiologicMap)
			throws EntityNotFoundException {
		if (CollectionUtils.isEmpty(modelBiologicMap.getConditionMap())) {
			return;
		}

		for (Long conditionId : modelBiologicMap.getConditionMap().keySet()) {
			final ConditionBiologicMap conditionBiologicMap = modelBiologicMap.getConditionMap().get(conditionId);
			if (conditionBiologicMap == null) {
				/*
				 * The {@link Condition} has been deleted.
				 */
				if (conditionId > 0) {
					Condition condition = this.conditionDao.getCondition(conditionId);
					if (condition == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_CONDITION, conditionId);
					}
					modelBiologic.addConditionToDelete(condition);
				}
				continue;
			}

			Condition condition = null;
			if (conditionId < 0) {
				condition = conditionBiologicMap.constructNewCondition();
				/*
				 * Retrieve the {@link Regulator} the {@link Condition} will be added to.
				 */
				Regulator regulator = modelBiologic.getRegulators().get(condition.getRegulator().getId());
				if (regulator == null) {
					regulator = this.regulatorDao.getRegulator(condition.getRegulator().getId());
				}

				/*
				 * Verify that the specified {@link Regulator} exists.
				 */
				if (regulator == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_REGULATOR,
							condition.getRegulator().getId());
				}
				condition.setRegulator(regulator.getRegulatorIdentifier());
			} else {
				condition = this.conditionDao.getCondition(conditionId);
				if (condition == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_CONDITION, conditionId);
				}
				this.mergeChangesToEntity(condition, conditionBiologicMap);
			}
			modelBiologic.addCondition(conditionId, condition);
		}
	}

	private void retrieveConditionSpecies(ModelBiologic modelBiologic, final ModelBiologicMap modelBiologicMap)
			throws EntityNotFoundException {
		for (String id : modelBiologicMap.getConditionSpeciesMap().keySet()) {
			ConditionSpeciesId conditionalSpecies = modelBiologicMap.getConditionSpeciesMap().get(id);
			if (conditionalSpecies == null) {
				// Deleted.
				if (id.startsWith(NEGATIVE_SYMBOL)) {
					continue;
				}
				ConditionSpeciesId conditionSpecies = new ConditionSpeciesId(id);

				Condition condition = modelBiologic.getConditions().get(conditionSpecies.getConditionId());
				boolean conditionRetrieved = false;

				if (condition == null) {
					condition = this.conditionDao.getCondition(conditionSpecies.getConditionId());
					conditionRetrieved = true;
				}

				if (condition == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_CONDITION,
							conditionSpecies.getConditionId());
				}

				if (conditionRetrieved) {
					modelBiologic.addCondition(condition.getId(), condition);
				}

				Iterator<SpeciesIdentifier> iterator = condition.getSpecies().iterator();
				while (iterator.hasNext()) {
					if (iterator.next().getId() == conditionSpecies.getSpeciesId()) {
						iterator.remove();
						break;
					}
				}

				/*
				 * We cannot have {@link Condition}s without any {@link Species}. So, assume
				 * that the {@link Condition} has been deleted if all associated {@link Species}
				 * relations have been removed.
				 */
				if (condition.getSpecies().isEmpty()) {
					modelBiologic.getConditions().remove(condition.getId());
				}
			} else {
				Condition condition = modelBiologic.getConditions().get(conditionalSpecies.getConditionId());
				Species species = modelBiologic.getSpecies().get(conditionalSpecies.getSpeciesId());
				boolean conditionRetrieved = false;
				boolean speciesRetrieved = false;

				if (condition == null) {
					condition = this.conditionDao.getCondition(conditionalSpecies.getConditionId());
					conditionRetrieved = true;
				}
				if (species == null) {
					species = this.speciesDao.getSpecies(conditionalSpecies.getSpeciesId());
					speciesRetrieved = true;
				}

				/*
				 * Verify entity retrieval.
				 */
				if (condition == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_CONDITION,
							conditionalSpecies.getConditionId());
				}
				if (species == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SPECIES,
							conditionalSpecies.getSpeciesId());
				}

				if (conditionRetrieved) {
					modelBiologic.addCondition(condition.getId(), condition);
				}
				if (speciesRetrieved) {
					modelBiologic.addSpecies(species.getId(), species);
				}
				/*
				 * If the id is JavaScript generated, it will start with a hyphen because it
				 * will be a number < 0.
				 */
				if (id.startsWith(NEGATIVE_SYMBOL)) {
					Number jsId = NumberUtils.createNumber(id);
					modelBiologic.addConditionSpecies(jsId,
							new ConditionSpecies(condition.getConditionIdentifier(), species.getSpeciesIdentifier()));
				}

				condition.addSpecies(species.getSpeciesIdentifier());
			}
		}
	}

	private void retrieveSubConditions(ModelBiologic modelBiologic, final ModelBiologicMap modelBiologicMap)
			throws EntityNotFoundException {
		if (CollectionUtils.isEmpty(modelBiologicMap.getSubConditionMap())) {
			return;
		}

		for (Long subConditionId : modelBiologicMap.getSubConditionMap().keySet()) {
			final SubConditionBiologicMap subConditionBiologicMap = modelBiologicMap.getSubConditionMap()
					.get(subConditionId);
			if (subConditionBiologicMap == null) {
				/*
				 * The link {@link SubCondition} has been deleted.
				 */
				if (subConditionId > 0) {
					SubCondition subCondition = this.subConditionDao.getSubCondition(subConditionId);
					if (subCondition == null) {
						throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SUB_CONDITION, subConditionId);
					}
					modelBiologic.addSubConditionToDelete(subCondition);
				}
				continue;
			}

			SubCondition subCondition = null;
			if (subConditionId < 0) {
				subCondition = subConditionBiologicMap.constructNewSubCondition();
				Condition condition = modelBiologic.getConditions().get(subCondition.getCondition().getId());
				boolean conditionRetrieved = false;
				if (condition == null) {
					condition = this.conditionDao.getCondition(subCondition.getCondition().getId());
					conditionRetrieved = true;
				}
				if (condition == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_CONDITION,
							subCondition.getCondition().getId());
				}
				subCondition.setCondition(condition.getConditionIdentifier());
				if (conditionRetrieved) {
					modelBiologic.addCondition(condition.getId(), condition);
				}
			} else {
				subCondition = this.subConditionDao.getSubCondition(subConditionId);
				if (subCondition == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SUB_CONDITION, subConditionId);
				}
				this.mergeChangesToEntity(subCondition, subConditionBiologicMap);
			}
			modelBiologic.addSubCondition(subConditionId, subCondition);
		}
	}

	private void retrieveSubConditionSpecies(ModelBiologic modelBiologic, final ModelBiologicMap modelBiologicMap)
			throws EntityNotFoundException {
		for (String id : modelBiologicMap.getSubConditionSpeciesMap().keySet()) {
			SubConditionSpeciesId conditionalSpecies = modelBiologicMap.getSubConditionSpeciesMap().get(id);
			if (conditionalSpecies == null) {
				// Deleted.
				if (id.startsWith(NEGATIVE_SYMBOL)) {
					continue;
				}

				SubConditionSpeciesId subConditionSpecies = new SubConditionSpeciesId(id);

				SubCondition subCondition = modelBiologic.getSubConditions()
						.get(subConditionSpecies.getSubConditionId());
				boolean subConditionRetrieved = false;

				if (subCondition == null) {
					subCondition = this.subConditionDao.getSubCondition(subConditionSpecies.getSubConditionId());
					subConditionRetrieved = true;
				}

				if (subCondition == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SUB_CONDITION,
							subConditionSpecies.getSubConditionId());
				}

				if (subConditionRetrieved) {
					modelBiologic.addSubCondition(subCondition.getId(), subCondition);
				}

				Iterator<SpeciesIdentifier> iterator = subCondition.getSpecies().iterator();
				while (iterator.hasNext()) {
					if (iterator.next().getId() == subConditionSpecies.getSpeciesId()) {
						iterator.remove();
						break;
					}
				}

				/*
				 * We cannot have {@link SubCondition}s without any {@link Species}. So, assume
				 * that the {@link SubCondition} has been deleted if all associated {@link
				 * Species} relations have been removed.
				 */
				if (subCondition.getSpecies().isEmpty()) {
					modelBiologic.getSubConditions().remove(subCondition.getId());
				}
			} else {
				SubCondition subCondition = modelBiologic.getSubConditions()
						.get(conditionalSpecies.getSubConditionId());
				boolean subConditionRetrieved = false;
				Species species = modelBiologic.getSpecies().get(conditionalSpecies.getSpeciesId());
				boolean speciesRetrieved = false;

				if (subCondition == null) {
					subCondition = this.subConditionDao.getSubCondition(conditionalSpecies.getSubConditionId());
					subConditionRetrieved = true;
				}
				if (species == null) {
					species = this.speciesDao.getSpecies(conditionalSpecies.getSpeciesId());
					speciesRetrieved = true;
				}

				/*
				 * Verify entity retrieval.
				 */
				if (subCondition == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SUB_CONDITION,
							conditionalSpecies.getSubConditionId());
				}
				if (species == null) {
					throw new EntityNotFoundException(EntityNotFoundException.ENTITY_SPECIES,
							conditionalSpecies.getSpeciesId());
				}

				if (subConditionRetrieved) {
					modelBiologic.addSubCondition(subCondition.getId(), subCondition);
				}
				if (speciesRetrieved) {
					modelBiologic.addSpecies(species.getId(), species);
				}
				/*
				 * If the id is JavaScript generated, it will start with a hyphen because it
				 * will be a number < 0.
				 */
				if (id.startsWith(NEGATIVE_SYMBOL)) {
					Number jsId = NumberUtils.createNumber(id);
					modelBiologic.addSubConditionSpecies(jsId,
							new SubConditionSpecies(subCondition, species.getSpeciesIdentifier()));
				}

				subCondition.addSpecies(species.getSpeciesIdentifier());
			}
		}
	}

	protected Long checkForTempAccess(final ServletRequest request) {
		final String token = ((HttpServletRequest) request).getHeader(TEMP_ACCESS_HEADER);
		if (token == null) {
			return null;
		}
		final String accessCode = Jwts.parser().setSigningKey(TEMP_SECRET).parseClaimsJws(token.trim()).getBody()
				.getSubject();
		if (accessCode == null) {
			return null;
		}

		ModelLink modelLink = this.modelLinkDao.getForAccessCode(accessCode);
		if (modelLink == null
				|| modelLink.getEndDate() != null && Calendar.getInstance().after(modelLink.getEndDate())) {
			return null;
		}

		return modelLink.getModel_id();
	}

	protected Map<Long, Page> loadKBInformation(final Long modelId, final Set<Species> species) {
		if (CollectionUtils.isEmpty(species)) {
			return Collections.emptyMap();
		}
		final Map<Long, Page> speciesIdToPageMap = new HashMap<>(species.size(), 1.0f);
		final Map<Long, Species> kbSpeciesToPagesToRetrieveMap = new HashMap<>();

		StringBuilder retrievedPageIds = new StringBuilder();
		species.stream().forEach(new Consumer<Species>() {
			@Override
			public void accept(Species t) {
				final Page page = cachedPageMap.get(t.getId());
				if (page == null) {
					if (!kbSpeciesToPagesToRetrieveMap.isEmpty()) {
						retrievedPageIds.append(", ");
					}
					kbSpeciesToPagesToRetrieveMap.put(t.getId(), t);
					retrievedPageIds.append(t.getId());
					return;
				}
				speciesIdToPageMap.put(page.getId(), page);
			}
		});

		if (kbSpeciesToPagesToRetrieveMap.isEmpty()) {
			return speciesIdToPageMap;
		}

		final StopWatch timer = new StopWatch();
		timer.start();
		List<Page> pagesRetrieved = this.pageDao.getPagesForIds(kbSpeciesToPagesToRetrieveMap.keySet());
		if (!CollectionUtils.isEmpty(pagesRetrieved)) {
			for (Page page : pagesRetrieved) {
				cachedPageMap.put(page.getId(), page);
				speciesIdToPageMap.put(page.getId(), page);
			}
		}
		timer.stop();
		performanceLogger.info("Successfully retrieved Knowledge Base pages: [{}] for Model: {} in {} ms.",
				retrievedPageIds.toString(), modelId, timer.getTime());
		return speciesIdToPageMap;
	}

	protected void loadKBInformation(final Long modelId, final ModelBiologicMap modelBiologicMap) {
		if (CollectionUtils.isEmpty(modelBiologicMap.getSpecies())) {
			return;
		}

		final Map<Long, Page> speciesIdToPageMap = loadKBInformation(modelId, modelBiologicMap.getSpecies());
		if (speciesIdToPageMap.isEmpty()) {
			return;
		}

		for (Species species : modelBiologicMap.getSpecies()) {
			Page page = speciesIdToPageMap.get(species.getId());
			if (page == null) {
				continue;
			}
			species.setPage(page);
			species.getPage().setSpecies(species.getSpeciesIdentifier());
			modelBiologicMap.constructKnowledgeBaseMapping(page);
		}
	}
}