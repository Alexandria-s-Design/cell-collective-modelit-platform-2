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

import cc.common.data.biologic.ConditionIdentifier;
import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.biologic.SubCondition;
import cc.common.data.biologic.ConditionalConstants.Relation;
import cc.dataaccess.SubConditionSpeciesId;

/**
 * @author bkowal
 *
 */
@JsonInclude(Include.NON_NULL)
public class SubConditionBiologicMap extends SubCondition implements INullableFields {

	private static class NullableFields {
		public static String NAME = "name";

		public static String SPECIES_RELATION = "speciesRelation";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	/**
	 * 
	 */
	public SubConditionBiologicMap() {
	}

	/**
	 * @param subCondition
	 */
	public SubConditionBiologicMap(SubCondition subCondition) {
		super(subCondition);
	}

	public SubCondition constructNewSubCondition() {
		SubCondition subCondition = new SubCondition();
		subCondition.setName(super.getName());
		subCondition.setType(super.getType());
		subCondition.setState(super.getState());
		subCondition.setCondition(super.getCondition());
		subCondition.setSpeciesRelation(super.getSpeciesRelation());
		subCondition.setSpecies(super.getSpecies());

		return subCondition;
	}

	public Map<String, SubConditionSpeciesId> buildSpeciesMap() {
		if (CollectionUtils.isEmpty(super.getSpecies())) {
			return Collections.emptyMap();
		}

		Map<String, SubConditionSpeciesId> speciesMap = new HashMap<>(super.getSpecies().size(), 1.0f);
		for (SpeciesIdentifier species : super.getSpecies()) {
			SubConditionSpeciesId conditionalSpecies = new SubConditionSpeciesId(super.getId(), species.getId());
			speciesMap.put(conditionalSpecies.toJSIdentifier(), conditionalSpecies);
		}
		return speciesMap;
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
	public ConditionIdentifier getCondition() {
		return super.getCondition();
	}

	public Long getConditionId() {
		if (super.getCondition() == null) {
			return null;
		}
		return super.getCondition().getId();
	}

	public void setConditionId(long conditionId) {
		if (super.getCondition() == null) {
			super.setCondition(new ConditionIdentifier());
		}
		super.getCondition().setId(conditionId);
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
}