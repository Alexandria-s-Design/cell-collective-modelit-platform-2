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

import cc.common.data.knowledge.Content;
import cc.common.data.knowledge.ContentReference;
import cc.common.data.knowledge.SectionIdentifier;

/**
 * @author Bryan Kowal
 */
public class ContentMap extends Content implements INullableFields {

	@JsonIgnore
	private final NullableFieldsJSON nullableFields = new NullableFieldsJSON();

	public ContentMap() {
	}

	public ContentMap(Content content) {
		super(content);
	}

	public Content constructNew() {
		Content content = new Content();
		content.setSection(super.getSection());
		content.setText(super.getText());
		content.setPosition(super.getPosition());
		content.setFlagged(super.isFlagged());
		content.setCreationDate(super.getCreationDate());
		content.setCreationUser(super.getCreationUser());
		content.setUpdateDate(super.getUpdateDate());
		content.setUpdateUser(super.getUpdateUser());

		return content;
	}

	public Map<Long, ContentReferenceMap> constructReferenceMap(Map<Long, ReferenceMap> referenceMap) {
		if (CollectionUtils.isEmpty(super.getReferences())) {
			return Collections.emptyMap();
		}

		Map<Long, ContentReferenceMap> contentReferenceMap = new HashMap<>();
		for (ContentReference contentReference : super.getReferences()) {
			contentReferenceMap.put(contentReference.getId(), new ContentReferenceMap(contentReference));
			if (referenceMap.containsKey(contentReference.getReference().getId()) == false) {
				referenceMap.put(contentReference.getReference().getId(),
						new ReferenceMap(contentReference.getReference()));
			}
		}
		return contentReferenceMap;
	}

	@Override
	public boolean wasSetNull(final String fieldName) {
		return this.nullableFields.wasSetNull(fieldName);
	}

	public Long getSectionId() {
		return (super.getSection() == null) ? null : super.getSection().getId();
	}

	public void setSectionId(long sectionId) {
		if (super.getSection() == null) {
			super.setSection(new SectionIdentifier());
		}
		super.getSection().setId(sectionId);
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}

	@JsonIgnore
	@Override
	public SectionIdentifier getSection() {
		return super.getSection();
	}

	@JsonIgnore
	@Override
	public Set<ContentReference> getReferences() {
		return super.getReferences();
	}
}