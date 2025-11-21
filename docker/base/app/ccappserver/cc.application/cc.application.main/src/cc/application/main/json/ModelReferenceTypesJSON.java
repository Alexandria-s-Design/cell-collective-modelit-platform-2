/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.knowledge.CitationType;
import cc.common.data.knowledge.DataType;
import cc.common.data.knowledge.ModelReferenceTypes;

/**
 * @author Bryan Kowal
 */
public class ModelReferenceTypesJSON extends ModelReferenceTypes implements INullableFields {

	public static class NullableFields {
		public static final String CITATION_TYPE = "citationType";

		public static final String DATA_TYPE = "dataType";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	public ModelReferenceTypesJSON() {
	}

	public ModelReferenceTypesJSON(ModelReferenceTypes modelReferenceTypes) {
		super(modelReferenceTypes);
	}

	public ModelReferenceTypes constructNew() {
		ModelReferenceTypes modelReferenceTypes = new ModelReferenceTypes();
		modelReferenceTypes.setModelId(getModelId());
		modelReferenceTypes.setReferenceId(getReferenceId());
		modelReferenceTypes.setCitationType(getCitationType());
		modelReferenceTypes.setDataType(getDataType());
		return modelReferenceTypes;
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
	public void setCitationType(CitationType citationType) {
		super.setCitationType(citationType);
		nullableFields.handleNullSet(citationType, NullableFields.CITATION_TYPE);
	}

	@Override
	public void setDataType(DataType dataType) {
		super.setDataType(dataType);
		nullableFields.handleNullSet(dataType, NullableFields.DATA_TYPE);
	}
}