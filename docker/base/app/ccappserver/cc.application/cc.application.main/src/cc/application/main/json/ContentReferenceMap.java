/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.knowledge.CitationType;
import cc.common.data.knowledge.Content;
import cc.common.data.knowledge.ContentReference;
import cc.common.data.knowledge.DataType;
import cc.common.data.knowledge.Reference;

/**
 * @author Bryan Kowal
 */
public class ContentReferenceMap extends ContentReference implements INullableFields {

	private static class NullableFields {
		public static final String CITATION_TYPE = "citationType";

		public static final String DATA_TYPE = "dataType";
	}

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	public ContentReferenceMap() {
	}

	public ContentReferenceMap(ContentReference contentReference) {
		super(contentReference);
	}

	public ContentReference constructNew() {
		ContentReference reference = new ContentReference();
		reference.setId(super.getId());
		reference.setPosition(super.getPosition());
		reference.setReference(super.getReference());
		reference.setContent(super.getContent());
		reference.setCreationDate(super.getCreationDate());
		reference.setCreationUser(super.getCreationUser());
		reference.setCitationType(super.getCitationType());
		reference.setDataType(super.getDataType());
		return reference;
	}

	@Override
	public boolean wasSetNull(final String fieldName) {
		return this.nullableFields.wasSetNull(fieldName);
	}

	public void setReferenceId(long referenceId) {
		if (super.getReference() == null) {
			super.setReference(new Reference());
		}
		super.getReference().setId(referenceId);
	}

	public Long getReferenceId() {
		if (super.getReference() == null) {
			return null;
		}
		return super.getReference().getId();
	}

	public void setContentId(long contentId) {
		if (super.getContent() == null) {
			super.setContent(new Content());
		}
		super.getContent().setId(contentId);
	}

	public Long getContentId() {
		if (super.getContent() == null) {
			return null;
		}
		return super.getContent().getId();
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}

	@JsonIgnore
	@Override
	public Reference getReference() {
		return super.getReference();
	}

	@JsonIgnore
	@Override
	public Content getContent() {
		return super.getContent();
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