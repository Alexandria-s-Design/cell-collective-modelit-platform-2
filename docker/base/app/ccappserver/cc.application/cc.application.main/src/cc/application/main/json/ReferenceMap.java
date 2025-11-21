/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.knowledge.Reference;

/**
 * @author Bryan Kowal
 *
 */
public class ReferenceMap extends Reference {

	public ReferenceMap() {
	}

	public ReferenceMap(Reference reference) {
		super(reference);
	}

	public Reference constructNew() {
		Reference reference = new Reference();
		reference.setPmid(super.getPmid());
		reference.setDoi(super.getDoi());
		reference.setText(super.getText());
		reference.setCreationDate(super.getCreationDate());
		reference.setCreationUser(super.getCreationUser());
		reference.setUpdateDate(super.getUpdateDate());
		reference.setUpdateUser(super.getUpdateUser());

		return reference;
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}
}