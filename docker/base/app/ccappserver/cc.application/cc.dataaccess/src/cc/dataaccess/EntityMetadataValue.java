/**
 * 
 */
package cc.dataaccess;

import cc.common.data.metadata.EntityValue;
import cc.common.data.metadata.Value;

/**
 * @author Bryan Kowal
 */
public class EntityMetadataValue {

	private Long id;

	private long entityId;

	private long definitionId;

	private Integer position;

	private boolean visibleAll;

	private boolean range;

	private Object value;

	public EntityMetadataValue() {
	}

	public EntityMetadataValue(Value value) {
		this.id = value.getId();
		this.definitionId = value.getDefinition().getId();
		this.position = value.getPosition();
		this.visibleAll = (value.getDefinition().getVisibleAll() == null) ? false
				: value.getDefinition().getVisibleAll();
		this.range = false;
		this.value = value.getSetValue().getValue();
	}

	public EntityMetadataValue(EntityValue entityValue) {
		this.id = entityValue.getId().getValue_id();
		this.entityId = entityValue.getId().getEntity_id();
		this.definitionId = entityValue.getDefinition().getId();
		this.visibleAll = (entityValue.getDefinition().getVisibleAll() == null) ? false
				: entityValue.getDefinition().getVisibleAll();
		this.range = true;
	}

	protected EntityMetadataValue(EntityMetadataValue entityMetadataValue) {
		this.id = entityMetadataValue.id;
		this.entityId = entityMetadataValue.entityId;
		this.definitionId = entityMetadataValue.definitionId;
		this.position = entityMetadataValue.position;
		this.visibleAll = entityMetadataValue.visibleAll;
		this.range = entityMetadataValue.range;
		this.value = entityMetadataValue.value;
	}

	/**
	 * @return the id
	 */
	public Long getId() {
		return id;
	}

	/**
	 * @param id
	 *            the id to set
	 */
	public void setId(Long id) {
		this.id = id;
	}

	/**
	 * @return the entityId
	 */
	public long getEntityId() {
		return entityId;
	}

	/**
	 * @param entityId
	 *            the entityId to set
	 */
	public void setEntityId(long entityId) {
		this.entityId = entityId;
	}

	/**
	 * @return the definitionId
	 */
	public long getDefinitionId() {
		return definitionId;
	}

	/**
	 * @param definitionId
	 *            the definitionId to set
	 */
	public void setDefinitionId(long definitionId) {
		this.definitionId = definitionId;
	}

	/**
	 * @return the position
	 */
	public Integer getPosition() {
		return position;
	}

	/**
	 * @param position
	 *            the position to set
	 */
	public void setPosition(Integer position) {
		this.position = position;
	}

	/**
	 * @return the visibleAll
	 */
	public boolean isVisibleAll() {
		return visibleAll;
	}

	/**
	 * @param visibleAll
	 *            the visibleAll to set
	 */
	public void setVisibleAll(boolean visibleAll) {
		this.visibleAll = visibleAll;
	}

	/**
	 * @return the range
	 */
	public boolean isRange() {
		return range;
	}

	/**
	 * @param range
	 *            the range to set
	 */
	public void setRange(boolean range) {
		this.range = range;
	}

	/**
	 * @return the value
	 */
	public Object getValue() {
		return value;
	}

	/**
	 * @param value
	 *            the value to set
	 */
	public void setValue(Object value) {
		this.value = value;
	}
}