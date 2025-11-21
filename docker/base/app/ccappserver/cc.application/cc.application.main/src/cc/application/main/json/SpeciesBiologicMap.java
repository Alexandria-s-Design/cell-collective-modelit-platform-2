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

import cc.common.data.biologic.Regulator;
import cc.common.data.biologic.Species;
import cc.common.data.knowledge.Page;

/**
 * @author bkowal
 *
 */
@JsonInclude(Include.NON_NULL)
public class SpeciesBiologicMap extends Species implements INullableFields {

	private static class NullableFields {
		public static String ABSENT_STATE = "absentState";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	/**
	 * 
	 */
	public SpeciesBiologicMap() {
	}

	/**
	 * @param species
	 */
	public SpeciesBiologicMap(Species species) {
		super(species);
	}

	public Species constructNewSpecies() {
		Species species = new Species();
		species.setName(super.getName());
		species.setExternal(super.isExternal());
		species.setAbsentState(super.getAbsentState());

		return species;
	}

	public Map<Long, RegulatorBiologicMap> buildRegulatorBiologicMap() {
		if (CollectionUtils.isEmpty(super.getRegulators())) {
			return Collections.emptyMap();
		}

		Map<Long, RegulatorBiologicMap> regulatorMap = new HashMap<>(super.getRegulators().size(), 1.0f);
		for (Regulator regulator : super.getRegulators()) {
			regulatorMap.put(regulator.getId(), new RegulatorBiologicMap(regulator));
		}
		return regulatorMap;
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
	public void setAbsentState(AbsentState absentState) {
		super.setAbsentState(absentState);
		this.nullableFields.handleNullSet(absentState, NullableFields.ABSENT_STATE);
	}

	@JsonIgnore
	@Override
	public Set<Regulator> getRegulators() {
		return super.getRegulators();
	}

	@JsonIgnore
	@Override
	public Page getPage() {
		return super.getPage();
	}
}