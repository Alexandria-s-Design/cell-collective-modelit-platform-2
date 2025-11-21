/**
 * 
 */
package cc.application.main.json;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * @author Bryan
 *
 */
public final class NullableFieldsJSON implements INullableFields {

	@JsonIgnore
	private final List<String> nullableFieldsSet = new ArrayList<>();

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * cc.application.main.json.INullableFields#wasSetNull(java.lang.String)
	 */
	@Override
	public boolean wasSetNull(String fieldName) {
		return this.nullableFieldsSet.contains(fieldName);
	}

	protected void handleNullSet(final Object fieldValue, final String fieldName) {
		if (fieldValue == null) {
			this.nullableFieldsSet.add(fieldName);
		}
	}

	public boolean isEmpty() {
		return this.nullableFieldsSet.isEmpty();
	}
}