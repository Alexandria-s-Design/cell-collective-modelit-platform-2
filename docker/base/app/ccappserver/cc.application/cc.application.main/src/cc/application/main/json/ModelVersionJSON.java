/**
 * 
 */
package cc.application.main.json;

import java.util.Calendar;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.model.ModelVersion;
import cc.common.data.model.ModelVersionId;

/**
 * @author Bryan Kowal
 *
 */
public class ModelVersionJSON extends ModelVersion implements INullableFields {

	public static class NullableFields {
		public static String NAME = "name";
		
		public static String DESCRIPTION = "description";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	public ModelVersionJSON() {
	}

	public ModelVersionJSON(final ModelVersion modelVersion) {
		super(modelVersion);
	}

	@Override
	public boolean wasSetNull(final String fieldName) {
		return this.nullableFields.wasSetNull(fieldName);
	}

	@JsonIgnore
	@Override
	public ModelVersionId getId() {
		return super.getId();
	}

	@Override
	public void setVersion(int version) {
		super.setVersion(version);
	}

	@Override
	public void setName(String name) {
		super.setName(name);
		this.nullableFields.handleNullSet(name, NullableFields.NAME);
	}
	
	@Override
	public void setDescription(String description) {
		super.setDescription(description);
		this.nullableFields.handleNullSet(description, NullableFields.DESCRIPTION);
	}

	@JsonIgnore
	@Override
	public Long getModelId() {
		return super.getModelId();
	}

	@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "EEE, dd MMM yyyy HH:mm:ss z")
	@Override
	public Calendar getCreationDate() {
		return super.getCreationDate();
	}
}