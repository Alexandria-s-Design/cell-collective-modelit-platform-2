/**
 * 
 */
package cc.application.main.json;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import cc.common.data.biologic.Condition;
import cc.common.data.biologic.RegulatorIdentifier;
import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.biologic.SubCondition;
import cc.common.data.biologic.ConditionalConstants.Relation;
import cc.dataaccess.ConditionSpeciesId;

/**
 * @author bkowal
 *
 */
@JsonInclude(Include.NON_NULL)
public class ConditionBiologicMap extends Condition implements INullableFields {

	private static class NullableFields {
		public static String NAME = "name";

		public static String SPECIES_RELATION = "speciesRelation";

		public static String SUB_CONDITION_RELATION = "subConditionRelation";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	/**
	 * 
	 */
	public ConditionBiologicMap() {
	}

	/**
	 * @param condition
	 */
	public ConditionBiologicMap(Condition condition) {
		super(condition);
	}

	public Condition constructNewCondition() {
		Condition condition = new Condition();
		condition.setName(super.getName());
		condition.setType(super.getType());
		condition.setState(super.getState());
		condition.setRegulator(super.getRegulator());
		condition.setSpeciesRelation(super.getSpeciesRelation());
		condition.setSpecies(super.getSpecies());
		condition.setSubConditionRelation(super.getSubConditionRelation());

		return condition;
	}

	public Map<String, ConditionSpeciesId> buildSpeciesMap() {
		if (CollectionUtils.isEmpty(super.getSpecies())) {
			return Collections.emptyMap();
		}

		Map<String, ConditionSpeciesId> speciesMap = new HashMap<>(super.getSpecies().size(), 1.0f);
		for (SpeciesIdentifier species : super.getSpecies()) {
			ConditionSpeciesId conditionalSpecies = new ConditionSpeciesId(this.getId(), species.getId());
			speciesMap.put(conditionalSpecies.toJSIdentifier(), conditionalSpecies);
		}
		return speciesMap;
	}

	public Map<Long, SubConditionBiologicMap> buildSubConditionMap() {
		if (CollectionUtils.isEmpty(super.getSubConditions())) {
			return Collections.emptyMap();
		}

		Map<Long, SubConditionBiologicMap> subConditionBiologicMap = new HashMap<>(super.getSubConditions().size(),
				1.0f);
		for (SubCondition subCondition : super.getSubConditions()) {
			subConditionBiologicMap.put(subCondition.getId(), new SubConditionBiologicMap(subCondition));
		}
		return subConditionBiologicMap;
	}

	@Override
	public boolean wasSetNull(final String fieldName) {
		return this.nullableFields.wasSetNull(fieldName);
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}

	@Override
	public void setName(String name) {
		super.setName(name);
		this.nullableFields.handleNullSet(name, NullableFields.NAME);
	}

	@JsonIgnore
	@Override
	public RegulatorIdentifier getRegulator() {
		return super.getRegulator();
	}

	public Long getRegulatorId() {
		if (super.getRegulator() == null) {
			return null;
		}
		return super.getRegulator().getId();
	}

	public void setRegulatorId(long regulatorId) {
		if (super.getRegulator() == null) {
			super.setRegulator(new RegulatorIdentifier());
		}
		super.getRegulator().setId(regulatorId);
	}

	@Override
	public void setSpeciesRelation(Relation speciesRelation) {
		super.setSpeciesRelation(speciesRelation);
		this.nullableFields.handleNullSet(speciesRelation, NullableFields.SPECIES_RELATION);
	}

	@JsonIgnore
	@Override
	public Set<SpeciesIdentifier> getSpecies() {
		return super.getSpecies();
	}

	@Override
	public void setSubConditionRelation(Relation subConditionRelation) {
		super.setSubConditionRelation(subConditionRelation);
		this.nullableFields.handleNullSet(subConditionRelation, NullableFields.SUB_CONDITION_RELATION);
	}

	@JsonIgnore
	@Override
	public Set<SubCondition> getSubConditions() {
		return super.getSubConditions();
	}
}