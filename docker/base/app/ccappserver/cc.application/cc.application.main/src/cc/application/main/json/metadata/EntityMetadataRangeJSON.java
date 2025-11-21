/**
 * 
 */
package cc.application.main.json.metadata;

import com.fasterxml.jackson.annotation.JsonIgnore;

import cc.dataaccess.EntityMetadataValue;

/**
 * @author Bryan Kowal
 */
public class EntityMetadataRangeJSON extends EntityMetadataValueJSON {

	public EntityMetadataRangeJSON() {
	}

	public EntityMetadataRangeJSON(EntityMetadataValue entityMetadataValue) {
		super(entityMetadataValue);
	}

	public long getValueId() {
		return super.getId();
	}

	public void setValueId(final long id) {
		super.setId(id);
	}

	@JsonIgnore
	@Override
	public Object getValue() {
		return super.getValue();
	}
}