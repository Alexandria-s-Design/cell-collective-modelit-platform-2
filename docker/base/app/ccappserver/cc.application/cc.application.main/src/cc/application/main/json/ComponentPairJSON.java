/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.simulation.ComponentPair;

/**
 * @author Bryan Kowal
 *
 */
public class ComponentPairJSON extends ComponentPair implements INullableFields {

	public static class NullableFields {
		public static final String DELAY = "delay";

		public static final String THRESHOLD = "threshold";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	public ComponentPairJSON() {
	}

	public ComponentPairJSON(ComponentPair componentPair) {
		super(componentPair);
	}

	public ComponentPair constructNew() {
		ComponentPair componentPair = new ComponentPair();
		componentPair.setFirstComponentId(getFirstComponentId());
		componentPair.setSecondComponentId(getSecondComponentId());
		componentPair.setDelay(getDelay());
		componentPair.setThreshold(getThreshold());
		return componentPair;
	}

	@Override
	public boolean wasSetNull(final String fieldName) {
		return this.nullableFields.wasSetNull(fieldName);
	}

	@JsonIgnore
	public long getId() {
		return super.getId();
	}

	@Override
	public void setDelay(Integer delay) {
		super.setDelay(delay);
		nullableFields.handleNullSet(delay, NullableFields.DELAY);
	}

	@Override
	public void setThreshold(Integer threshold) {
		super.setThreshold(threshold);
		nullableFields.handleNullSet(threshold, NullableFields.THRESHOLD);
	}
}