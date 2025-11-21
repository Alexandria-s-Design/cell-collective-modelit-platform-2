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
import cc.common.data.knowledge.PageIdentifier;
import cc.common.data.knowledge.Section;

/**
 * @author Bryan Kowal
 */
public class SectionMap extends Section {

	public SectionMap() {
	}

	public SectionMap(Section section) {
		super(section);
	}

	public Section constructNew() {
		Section section = new Section();
		section.setPage(super.getPage());
		section.setType(super.getType());
		section.setPosition(super.getPosition());
		section.setTitle(super.getTitle());
		section.setCreationDate(super.getCreationDate());
		section.setCreationUser(super.getCreationUser());
		section.setUpdateDate(super.getUpdateDate());
		section.setUpdateUser(super.getUpdateUser());

		return section;
	}

	public Map<Long, ContentMap> buildContentMap() {
		if (CollectionUtils.isEmpty(super.getContents())) {
			return Collections.emptyMap();
		}

		Map<Long, ContentMap> contentMap = new HashMap<>();
		for (Content content : super.getContents()) {
			contentMap.put(content.getId(), new ContentMap(content));
		}
		return contentMap;
	}

	public Long getPageId() {
		return (super.getPage() == null) ? null : super.getPage().getId();
	}

	public void setPageId(long pageId) {
		if (super.getPage() == null) {
			super.setPage(new PageIdentifier());
		}
		super.getPage().setId(pageId);
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}

	@JsonIgnore
	@Override
	public PageIdentifier getPage() {
		return super.getPage();
	}

	@JsonIgnore
	@Override
	public Set<Content> getContents() {
		return super.getContents();
	}
}