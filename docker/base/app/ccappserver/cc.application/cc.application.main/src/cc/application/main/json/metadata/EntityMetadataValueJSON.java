/**
 * 
 */
package cc.application.main.json.metadata;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import cc.dataaccess.EntityMetadataValue;

/**
 * @author Bryan Kowal
 */
@JsonSerialize
@JsonInclude(Include.NON_NULL)
public class EntityMetadataValueJSON extends EntityMetadataValue {

	public EntityMetadataValueJSON() {
	}

	public EntityMetadataValueJSON(EntityMetadataValue entityMetadataValue) {
		super(entityMetadataValue);
	}

	@JsonIgnore
	@Override
	public Long getId() {
		return super.getId();
	}

	@JsonIgnore
	@Override
	public long getEntityId() {
		return super.getEntityId();
	}

	@JsonIgnore
	@Override
	public boolean isVisibleAll() {
		return super.isVisibleAll();
	}

	@JsonIgnore
	@Override
	public boolean isRange() {
		return super.isRange();
	}
}