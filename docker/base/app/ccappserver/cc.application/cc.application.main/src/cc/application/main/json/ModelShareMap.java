/**
 * 
 */
package cc.application.main.json;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.common.data.model.ModelShare;

/**
 * @author Bryan Kowal
 */
public class ModelShareMap extends ModelShare {

	public ModelShareMap() {
	}

	public ModelShareMap(ModelShare modelShare) {
		super(modelShare);
	}

	public ModelShare constructNewShare() {
		ModelShare share = new ModelShare();
		share.setModel_id(super.getModel_id());
		share.setEmail(super.getEmail());
		share.setAccess(super.getAccess());

		return share;
	}

	@JsonIgnore
	@Override
	public long getId() {
		return super.getId();
	}
}