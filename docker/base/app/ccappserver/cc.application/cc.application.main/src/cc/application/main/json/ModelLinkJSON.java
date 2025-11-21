/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.model.ModelLink;

/**
 * @author Bryan Kowal
 *
 */
public class ModelLinkJSON extends ModelLink {

	public ModelLinkJSON() {
	}

	public ModelLinkJSON(ModelLink link) {
		super(link);
	}

	public ModelLink createNewLink() {
		ModelLink link = new ModelLink();
		link.setAccessCode(super.getAccessCode());
		link.setAccess(super.getAccess());
		link.setModel_id(super.getModel_id());
		link.setUserId(super.getUserId());
		link.setStartDate(super.getStartDate());
		link.setEndDate(super.getEndDate());
		link.setCreationDate(super.getCreationDate());
		link.setUpdateDate(super.getUpdateDate());
		link.setAccessCount(super.getAccessCount());

		return link;
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}
}