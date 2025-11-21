/**
 * 
 */
package cc.dataaccess;

import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import cc.common.data.biologic.Condition;
import cc.common.data.biologic.Regulator;
import cc.common.data.biologic.Species;
import cc.common.data.biologic.SubCondition;
import cc.common.data.model.Model;
import cc.common.data.model.ModelChangeset;
import cc.common.data.model.ModelInitialState;
import cc.common.data.model.ModelVersion;

/**
 * @author bkowal
 *
 */
public class ModelBiologic {

	private String key;
	
	private int modelId;

	private boolean delete = false;

	private Model model;

	private ModelVersion modelVersion;
	
	private Map<Long, ModelVersion> modelVersionsToPersist = new HashMap<>();
	
	private Map<Long, ModelVersion> modelVersionsToDelete = new HashMap<>();

	private ModelInitialState modelInitialState;

	private Map<Number, Species> species = new HashMap<>();

	private List<Species> speciesToDelete = new ArrayList<>();

	private Map<Number, Regulator> regulators = new HashMap<>();

	private List<Regulator> regulatorsToDelete = new ArrayList<>();

	private Map<Number, Condition> conditions = new HashMap<>();

	private List<Condition> conditionsToDelete = new ArrayList<>();

	private Map<Number, SubCondition> subConditions = new HashMap<>();

	private List<SubCondition> subConditionsToDelete = new ArrayList<>();

	private Map<Number, ConditionSpecies> conditionSpecies = new HashMap<>();

	private Map<Number, SubConditionSpecies> subConditionSpecies = new HashMap<>();

	private Map<Number, Dominance> dominance = new HashMap<>();

	private ModelChangeset changeset;

	public void delete() {
		this.delete = true;
	}

	public void addSpecies(final Number id, Species species) {
		this.species.put(id, species);
	}

	public void addSpeciesToDelete(final Species species) {
		this.speciesToDelete.add(species);
	}

	public void addRegulator(final Number id, Regulator regulator) {
		this.regulators.put(id, regulator);
	}

	public void addRegulatorToDelete(final Regulator regulator) {
		this.regulatorsToDelete.add(regulator);
	}

	public void addCondition(final Number id, Condition condition) {
		this.conditions.put(id, condition);
	}

	public void addConditionToDelete(final Condition condition) {
		this.conditionsToDelete.add(condition);
	}

	public void addSubCondition(final Number id, SubCondition subCondition) {
		this.subConditions.put(id, subCondition);
	}

	public void addSubConditionToDelete(SubCondition subCondition) {
		this.subConditionsToDelete.add(subCondition);
	}

	public void addConditionSpecies(final Number id, ConditionSpecies conditionSpecies) {
		this.conditionSpecies.put(id, conditionSpecies);
	}

	public void addSubConditionSpecies(final Number id, SubConditionSpecies subConditionSpecies) {
		this.subConditionSpecies.put(id, subConditionSpecies);
	}

	public void addDominance(final Number id, Dominance dominance) {
		this.dominance.put(id, dominance);
	}

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	/**
	 * @return the modelId
	 */
	public int getModelId() {
		return modelId;
	}

	/**
	 * @return the delete
	 */
	public boolean isDelete() {
		return delete;
	}

	/**
	 * @param modelId
	 *            the modelId to set
	 */
	public void setModelId(int modelId) {
		this.modelId = modelId;
	}

	/**
	 * @return the model
	 */
	public Model getModel() {
		return model;
	}

	/**
	 * @param model
	 *            the model to set
	 */
	public void setModel(Model model) {
		this.model = model;
	}

	public ModelVersion getModelVersion() {
		return modelVersion;
	}

	public void setModelVersion(ModelVersion modelVersion) {
		this.modelVersion = modelVersion;
	}

	public Map<Long, ModelVersion> getModelVersionsToPersist() {
		return modelVersionsToPersist;
	}

	public void setModelVersionsToPersist(Map<Long, ModelVersion> modelVersionsToPersist) {
		this.modelVersionsToPersist = modelVersionsToPersist;
	}

	public Map<Long, ModelVersion> getModelVersionsToDelete() {
		return modelVersionsToDelete;
	}

	public void setModelVersionsToDelete(Map<Long, ModelVersion> modelVersionsToDelete) {
		this.modelVersionsToDelete = modelVersionsToDelete;
	}

	/**
	 * @return the modelInitialState
	 */
	public ModelInitialState getModelInitialState() {
		return modelInitialState;
	}

	/**
	 * @param modelInitialState
	 *            the modelInitialState to set
	 */
	public void setModelInitialState(ModelInitialState modelInitialState) {
		this.modelInitialState = modelInitialState;
	}

	/**
	 * @return the species
	 */
	public Map<Number, Species> getSpecies() {
		return species;
	}

	/**
	 * @return the speciesToDelete
	 */
	public List<Species> getSpeciesToDelete() {
		return speciesToDelete;
	}

	/**
	 * @return the regulators
	 */
	public Map<Number, Regulator> getRegulators() {
		return regulators;
	}

	/**
	 * @return the regulatorsToDelete
	 */
	public List<Regulator> getRegulatorsToDelete() {
		return regulatorsToDelete;
	}

	/**
	 * @return the conditions
	 */
	public Map<Number, Condition> getConditions() {
		return conditions;
	}

	/**
	 * @return the conditionsToDelete
	 */
	public List<Condition> getConditionsToDelete() {
		return conditionsToDelete;
	}

	/**
	 * @return the subConditions
	 */
	public Map<Number, SubCondition> getSubConditions() {
		return subConditions;
	}

	/**
	 * @return the subConditionsToDelete
	 */
	public List<SubCondition> getSubConditionsToDelete() {
		return subConditionsToDelete;
	}

	/**
	 * @param subConditionsToDelete
	 *            the subConditionsToDelete to set
	 */
	public void setSubConditionsToDelete(List<SubCondition> subConditionsToDelete) {
		this.subConditionsToDelete = subConditionsToDelete;
	}

	/**
	 * @return the conditionSpecies
	 */
	public Map<Number, ConditionSpecies> getConditionSpecies() {
		return conditionSpecies;
	}

	/**
	 * @return the subConditionSpecies
	 */
	public Map<Number, SubConditionSpecies> getSubConditionSpecies() {
		return subConditionSpecies;
	}

	/**
	 * @return the dominance
	 */
	public Map<Number, Dominance> getDominance() {
		return dominance;
	}

	/**
	 * @return the changeset
	 */
	public ModelChangeset getChangeset() {
		return changeset;
	}

	/**
	 * @param changeset
	 *            the changeset to set
	 */
	public void setChangeset(ModelChangeset changeset) {
		this.changeset = changeset;
	}
}