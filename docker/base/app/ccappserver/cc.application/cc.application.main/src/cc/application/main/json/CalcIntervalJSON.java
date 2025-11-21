/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.simulation.CalcInterval;

/**
 * @author Bryan Kowal
 */
public class CalcIntervalJSON extends CalcInterval implements INullableFields {

	private static class NullableFields {
		public static String FROM = "from";

		public static String TO = "to";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	public CalcIntervalJSON() {
	}

	public CalcIntervalJSON(CalcInterval calcInterval) {
		super(calcInterval);
	}

	public CalcInterval constructNew() {
		CalcInterval calcInterval = new CalcInterval();
		calcInterval.setExperimentId(getExperimentId());
		calcInterval.setFrom(getFrom());
		calcInterval.setTo(getTo());
		return calcInterval;
	}

	@Override
	public boolean wasSetNull(String fieldName) {
		return this.nullableFields.wasSetNull(fieldName);
	}

	@Override
	public void setFrom(Integer from) {
		super.setFrom(from);
		nullableFields.handleNullSet(from, NullableFields.FROM);
	}

	@Override
	public void setTo(Integer to) {
		super.setTo(to);
		nullableFields.handleNullSet(to, NullableFields.TO);
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}
}