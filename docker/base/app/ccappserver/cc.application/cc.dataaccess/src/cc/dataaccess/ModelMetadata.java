/**
 * 
 */
package cc.dataaccess;

import java.util.Map;

import cc.common.data.metadata.EntityValue;
import cc.common.data.metadata.Value;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * @author Bryan Kowal
 */
public class ModelMetadata {

	private final Number modelId;

	private final Map<Long, Value> valuesToSave = new HashMap<>();

	private final Map<Long, Value> valuesToDelete = new HashMap<>();

	private final List<EntityValue> entityValuesToSave = new ArrayList<>();

	private final List<EntityValue> entityValuesToDelete = new ArrayList<>();

	public ModelMetadata(final Number modelId) {
		this.modelId = modelId;
	}

	public void addValueToSave(final Long id, final Value value) {
		this.valuesToSave.put(id, value);
	}

	public void addValueToDelete(final Long id, final Value value) {
		this.valuesToDelete.put(id, value);
	}

	public void addEntityValueToSave(final EntityValue entityValue) {
		this.entityValuesToSave.add(entityValue);
	}

	public void addEntityValueToDelete(final EntityValue entityValue) {
		this.entityValuesToDelete.add(entityValue);
	}

	/**
	 * @return the modelId
	 */
	public Number getModelId() {
		return modelId;
	}

	/**
	 * @return the valuesToSave
	 */
	public Map<Long, Value> getValuesToSave() {
		return valuesToSave;
	}

	/**
	 * @return the valuesToDelete
	 */
	public Map<Long, Value> getValuesToDelete() {
		return valuesToDelete;
	}

	/**
	 * @return the entityValuesToSave
	 */
	public List<EntityValue> getEntityValuesToSave() {
		return entityValuesToSave;
	}

	/**
	 * @return the entityValuesToDelete
	 */
	public List<EntityValue> getEntityValuesToDelete() {
		return entityValuesToDelete;
	}
}