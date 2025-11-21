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

import cc.common.data.biologic.SpeciesIdentifier;
import cc.common.data.knowledge.Page;
import cc.common.data.knowledge.PageReference;
import cc.common.data.knowledge.Section;

/**
 * @author Bryan Kowal
 *
 */
public class PageMap extends Page {

	public PageMap() {
	}

	public PageMap(Page page) {
		super(page);
	}

	public Page constructNew() {
		Page page = new Page();
		page.setSpecies(super.getSpecies());
		page.setCreationDate(super.getCreationDate());
		page.setCreationUser(super.getCreationUser());
		page.setUpdateDate(super.getUpdateDate());
		page.setUpdateUser(super.getUpdateUser());

		return page;
	}

	public Map<Long, SectionMap> buildSectionMap() {
		if (CollectionUtils.isEmpty(super.getSections())) {
			return Collections.emptyMap();
		}

		Map<Long, SectionMap> sectionMap = new HashMap<>();
		for (Section section : super.getSections()) {
			sectionMap.put(section.getId(), new SectionMap(section));
		}
		return sectionMap;
	}
	
	public long getSpeciesId() {
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
	public long getId() {
		return super.getId();
	}

	@JsonIgnore
	@Override
	public SpeciesIdentifier getSpecies() {
		return super.getSpecies();
	}

	@JsonIgnore
	@Override
	public Set<Section> getSections() {
		return super.getSections();
	}

	@JsonIgnore
	@Override
	public Set<PageReference> getReferences() {
		return super.getReferences();
	}
}