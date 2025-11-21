/**
 * 
 */
package cc.application.main.json;

import java.util.Collections;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;

import org.springframework.util.CollectionUtils;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import cc.common.data.biologic.Condition;
import cc.common.data.biologic.Regulator;
import cc.common.data.biologic.RegulatorIdentifier;
import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.biologic.ConditionalConstants.Relation;
import cc.dataaccess.DominanceId;

/**
 * @author bkowal
 *
 */
@JsonInclude(Include.NON_NULL)
public class RegulatorBiologicMap extends Regulator implements INullableFields {

	private static class NullableFields {
		public static String CONDITION_RELATION = "conditionRelation";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	/**
	 * 
	 */
	public RegulatorBiologicMap() {
	}

	/**
	 * @param regulator
	 */
	public RegulatorBiologicMap(Regulator regulator) {
		super(regulator);
	}

	public Regulator constructNewRegulator() {
		Regulator regulator = new Regulator();
		regulator.setSpecies(super.getSpecies());
		regulator.setRegulatorSpecies(super.getRegulatorSpecies());
		regulator.setRegulationType(super.getRegulationType());
		regulator.setConditionRelation(super.getConditionRelation());

		return regulator;
	}

	public Map<Long, ConditionBiologicMap> buildConditionMap() {
		if (CollectionUtils.isEmpty(super.getConditions())) {
			return Collections.emptyMap();
		}

		Map<Long, ConditionBiologicMap> conditionMap = new HashMap<>(super.getConditions().size(), 1.0f);
		for (Condition condition : super.getConditions()) {
			conditionMap.put(condition.getId(), new ConditionBiologicMap(condition));
		}
		return conditionMap;
	}

	public Map<String, DominanceId> buildDominanceMap() {
		if (CollectionUtils.isEmpty(super.getDominance())) {
			return Collections.emptyMap();
		}

		Map<String, DominanceId> dominanceMap = new HashMap<>(super.getDominance().size(), 1.0f);
		for (RegulatorIdentifier regulatorIdentifier : super.getDominance()) {
			DominanceId dominanceId = new DominanceId(super.getId(), regulatorIdentifier.getId());
			dominanceMap.put(dominanceId.toJSIdentifier(), dominanceId);
		}
		return dominanceMap;
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

	@JsonIgnore
	@Override
	public SpeciesIdentifier getSpecies() {
		return super.getSpecies();
	}

	public Long getSpeciesId() {
		if (super.getSpecies() == null) {
			return null;
		}
		return super.getSpecies().getId();
	}

	public void setSpeciesId(long speciesId) {
		if (super.getSpecies() == null) {
			super.setSpecies(new SpeciesIdentifier());
		}
		super.getSpecies().setId(speciesId);
	}

	@JsonIgnore
	@Override
	public SpeciesIdentifier getRegulatorSpecies() {
		return super.getRegulatorSpecies();
	}

	public Long getRegulatorSpeciesId() {
		if (super.getRegulatorSpecies() == null) {
			return null;
		}
		return super.getRegulatorSpecies().getId();
	}

	public void setRegulatorSpeciesId(long regulatorSpeciesId) {
		if (super.getRegulatorSpecies() == null) {
			super.setRegulatorSpecies(new SpeciesIdentifier());
		}
		super.getRegulatorSpecies().setId(regulatorSpeciesId);
	}

	@Override
	public void setConditionRelation(Relation conditionRelation) {
		super.setConditionRelation(conditionRelation);
		this.nullableFields.handleNullSet(conditionRelation, NullableFields.CONDITION_RELATION);
	}

	@JsonIgnore
	@Override
	public Set<Condition> getConditions() {
		return super.getConditions();
	}

	@JsonIgnore
	@Override
	public Set<RegulatorIdentifier> getDominance() {
		return super.getDominance();
	}
}