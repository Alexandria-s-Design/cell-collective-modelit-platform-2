/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.knowledge.PageIdentifier;
import cc.common.data.knowledge.PageReference;
import cc.common.data.knowledge.Reference;

/**
 * @author Bryan Kowal
 */
public class PageReferenceMap extends PageReference {

	public PageReferenceMap() {
	}

	public PageReferenceMap(PageReference pageReference) {
		super(pageReference);
	}

	public PageReference constructNew() {
		PageReference reference = new PageReference();
		reference.setPosition(super.getPosition());
		reference.setReference(super.getReference());
		reference.setPage(super.getPage());
		reference.setCreationDate(super.getCreationDate());
		reference.setCreationUser(super.getCreationUser());
		return reference;
	}

	public long getReferenceId() {
		return super.getReference().getId();
	}

	public void setReferenceId(long referenceId) {
		if (super.getReference() == null) {
			super.setReference(new Reference());
		}
		super.getReference().setId(referenceId);
	}

	public long getPageId() {
		return super.getPage().getId();
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
	public Reference getReference() {
		return super.getReference();
	}
}